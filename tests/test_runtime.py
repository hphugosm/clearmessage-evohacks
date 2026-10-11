"""Resource admission, total read deadlines, private diagnostics and packaging."""
import asyncio
import hashlib
import json
import logging
from pathlib import Path
import shutil
import subprocess
import sys

import pytest

from backend.privacy import PrivacyBoundary
from backend.runtime import MAX_HTTP_REQUESTS, PrivateDiagnostic
from backend.inference import CONFIG
from scripts.package_runtime import package

ROOT = Path(__file__).resolve().parents[1]
CANARY = 'PRIVATE_RUNTIME_CANARY_INTERNAL_PATH'


def scope(path='/api/health', method='GET'):
    return {'type': 'http', 'path': path, 'method': method, 'query_string': b'',
            'headers': [(b'content-type', b'application/json')]}


async def receive():
    return {'type': 'http.request', 'body': b'', 'more_body': False}


def test_admission_is_bounded_and_cancelled_requests_release_slots():
    async def scenario():
        entered = 0
        admitted = asyncio.Event()
        release = asyncio.Event()

        async def test_only_app(_scope, _receive, send):
            nonlocal entered
            entered += 1
            if entered == MAX_HTTP_REQUESTS:
                admitted.set()
            await release.wait()
            await send({'type': 'http.response.start', 'status': 200, 'headers': []})
            await send({'type': 'http.response.body', 'body': b''})

        app = PrivacyBoundary(test_only_app)
        async def discard(_message):
            pass
        tasks = [asyncio.create_task(app(scope(), receive, discard)) for _ in range(MAX_HTTP_REQUESTS)]
        await asyncio.wait_for(admitted.wait(), 1)
        messages = []
        async def collect(message):
            messages.append(message)
        await app(scope(), receive, collect)
        assert messages[0]['status'] == 503
        assert (b'cache-control', b'no-store') in messages[0]['headers']
        assert json.loads(messages[1]['body'])['error_key'] == 'service_unavailable'
        assert entered == MAX_HTTP_REQUESTS
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)
        release.set()
        messages.clear()
        await app(scope(), receive, collect)
        assert messages[0]['status'] == 200
    asyncio.run(scenario())


def test_partial_body_has_a_total_deadline_and_private_error(monkeypatch):
    monkeypatch.setattr('backend.privacy.BODY_TIMEOUT_SECONDS', .01)
    async def scenario():
        async def test_only_app(_scope, _receive, _send):
            raise AssertionError('Body timeout must precede dispatch')
        messages = []
        calls = 0
        async def slow_receive():
            nonlocal calls
            calls += 1
            if calls == 1:
                return {'type': 'http.request', 'body': CANARY.encode(), 'more_body': True}
            await asyncio.sleep(10)
        async def collect(message):
            messages.append(message)
        await PrivacyBoundary(test_only_app)(scope('/api/analyze', 'POST'), slow_receive, collect)
        assert messages[0]['status'] == 408
        assert (b'cache-control', b'no-store') in messages[0]['headers']
        assert json.loads(messages[1]['body'])['error_key'] == 'request_rejected'
        assert CANARY not in str(messages)
    asyncio.run(scenario())


def test_server_diagnostics_never_format_private_values_or_tracebacks():
    try:
        raise RuntimeError('/' + CANARY)
    except RuntimeError:
        record = logging.LogRecord('uvicorn.error', logging.ERROR, '/' + CANARY, 1, '%s', (CANARY,), sys.exc_info())
    record.stack_info = CANARY
    assert PrivateDiagnostic().filter(record)
    output = logging.Formatter().format(record)
    assert output == 'ClearMessage server diagnostic; check service health.'
    assert CANARY not in output


def test_real_runtime_package_and_trusted_import_preserve_foreign_files(tmp_path):
    staged = tmp_path / 'runtime'
    built_frontend = tmp_path / 'test-only-build'
    (built_frontend / 'assets').mkdir(parents=True)
    (built_frontend / 'index.html').write_text('<html lang="en"><title>ClearMessage test-only build</title></html>')
    manifest = package(staged, built_frontend)
    assert manifest['model_sha256'] == CONFIG['sha256']
    assert manifest['encoder_required'] is False
    assert not (staged / 'ml/data').exists()
    assert not (staged / 'tests').exists()
    assert not (staged / 'scripts/train.py').exists()
    for name, expected in manifest['files'].items():
        assert hashlib.sha256((staged / name).read_bytes()).hexdigest() == expected
    assert package(staged, built_frontend) == manifest
    foreign = staged / 'owner-note.txt'
    foreign.write_text(CANARY)
    with pytest.raises(ValueError, match='existing_package_differs'):
        package(staged, built_frontend)
    assert foreign.read_text() == CANARY
    # Only a task-generated model copy is removed; canonical project data remains untouched.
    (staged / CONFIG['artifact_path']).unlink()
    shutil.copyfile(ROOT / 'scripts/prepare_model.py', staged / 'scripts/prepare_model.py')
    result = subprocess.run([sys.executable, str(staged / 'scripts/prepare_model.py'), '--artifact-file', str(ROOT / CONFIG['artifact_path'])], cwd=staged, capture_output=True, text=True, timeout=30)
    assert result.returncode == 0, 'Trusted import failed; private diagnostics suppressed'
    assert json.loads(result.stdout)['model_ready'] is True
    assert hashlib.sha256((staged / CONFIG['artifact_path']).read_bytes()).hexdigest() == CONFIG['sha256']
    invalid = tmp_path / 'untrusted.json'
    invalid.write_text(json.dumps({'private': CANARY}))
    result = subprocess.run([sys.executable, str(staged / 'scripts/prepare_model.py'), '--artifact-file', str(invalid)], cwd=staged, capture_output=True, text=True, timeout=30)
    assert result.returncode != 0
    assert CANARY not in result.stdout + result.stderr
    assert str(staged) not in result.stdout + result.stderr
    assert hashlib.sha256((staged / CONFIG['artifact_path']).read_bytes()).hexdigest() == CONFIG['sha256']


def test_launcher_argument_errors_do_not_echo_secrets_or_paths():
    result = subprocess.run([sys.executable, str(ROOT / 'scripts/serve.py'), '--port', CANARY], capture_output=True, text=True, timeout=10)
    assert result.returncode == 2
    assert CANARY not in result.stdout + result.stderr
    assert str(ROOT) not in result.stdout + result.stderr
    assert result.stderr == 'ClearMessage command rejected: invalid arguments.\n'
