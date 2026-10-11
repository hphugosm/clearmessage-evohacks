"""Explicit clean-install/real-HTTP release verification; not a Docker test."""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor
import hashlib
import http.client
import importlib.metadata
import json
import os
from pathlib import Path
import platform
import shutil
import socket
import subprocess
import sys
import tempfile
from threading import Event, Thread
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from backend.runtime import PrivateArgumentParser
from backend.inference import CONFIG
from backend.runtime import BODY_TIMEOUT_SECONDS, MAX_HTTP_REQUESTS
from scripts.package_runtime import package

CANARY = 'PRIVATE_RELEASE_CANARY_Alex_654321_ACCOUNT'
OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}))


class VerificationFailure(Exception):
    pass


def require(condition, code):
    if not condition:
        raise VerificationFailure(code)


def command(args, cwd, env, timeout=120):
    result = subprocess.run(args, cwd=cwd, env=env, capture_output=True, timeout=timeout)
    require(result.returncode == 0, 'setup_or_browser_command_failed')
    return result.stdout


def request(port, path='/api/health', text=None, language='en'):
    data = json.dumps({'text': text, 'message_language': language}).encode() if text is not None else None
    query = urllib.request.Request(f'http://127.0.0.1:{port}{path}', data=data,
                                   headers={'Content-Type': 'application/json'} if data is not None else {})
    started = time.perf_counter()
    try:
        response = OPENER.open(query, timeout=10)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        body = response.read()
        status, headers = response.status, dict(response.headers.items())
    require(CANARY.encode() not in body, 'response_canary_leak')
    require(headers.get('cache-control') == 'no-store', 'missing_no_store')
    return status, headers, body, (time.perf_counter() - started) * 1000


def new_port():
    with socket.socket() as probe:
        probe.bind(('127.0.0.1', 0))
        return probe.getsockname()[1]


def metrics(values):
    ordered = sorted(values)
    return {'requests': len(values), 'p50_ms': round(ordered[len(ordered)//2], 3),
            'p95_ms': round(ordered[int((len(ordered)-1)*.95)], 3), 'max_ms': round(max(values), 3)}


def browser_check(port, mode, env):
    output = command(['node', 'frontend/scripts/verify-release.mjs', str(port), mode], ROOT, env, timeout=60)
    return json.loads(output)


def run_server(runtime, python, env, hook, mode, *, benchmark=True, browser=True):
    ready = mode != 'failed-model'
    port = new_port()
    events = hook / f'{mode}-network-events.txt'
    env = {**env, 'PYTHONPATH': str(hook), 'CLEARMESSAGE_TEST_NETWORK_EVENTS': str(events)}
    stdout, stderr = tempfile.TemporaryFile(), tempfile.TemporaryFile()
    started = time.perf_counter()
    process = subprocess.Popen([str(python), 'scripts/serve.py', '--port', str(port)], cwd=runtime,
                               env=env, stdout=stdout, stderr=stderr)
    stop = Event()
    samples = []

    def monitor():
        while not stop.wait(.05):
            result = subprocess.run(['ps', '-o', 'rss=', '-p', str(process.pid)], capture_output=True)
            try:
                samples.append(int(result.stdout.strip()) / 1024)
            except ValueError:
                pass

    watcher = Thread(target=monitor, daemon=True)
    watcher.start()
    try:
        health = None
        last_status = None
        while time.perf_counter() - started < 120:
            require(process.poll() is None, 'server_start_failed')
            try:
                status, _, body, _ = request(port)
                last_status = status
                if status == 200:
                    health = json.loads(body)
                    break
            except (OSError, TimeoutError):
                pass
            time.sleep(.025)
        require(health is not None, f'startup_timeout_last_http_{last_status}')
        startup = time.perf_counter() - started
        require(health['service_status'] == 'ok', 'liveness_failed')
        require(health['model_ready'] is ready, 'incorrect_model_readiness')
        checks = []
        for name, text, language, expected in [
            ('ordinary', 'We can meet for a fictional lunch tomorrow.', 'en', 'review'),
            ('observed-warning', 'Please send me your login code. Pay the invoice immediately. Keep this secret.', 'en', 'suspicious'),
            ('unsupported-scope', 'We can meet for a fictional lunch tomorrow.', 'other', 'review'),
            ('private-canary', f'Please send me your login code. {CANARY} https://notice.invalid/example', 'en', 'suspicious'),
        ]:
            status, _, body, elapsed = request(port, '/api/analyze', text, language)
            response = json.loads(body)
            require(status == 200 and response['status'] == expected and not response['analysis_complete'], 'real_flow_mismatch')
            require(response['model_version'] is not None if ready else response['model_version'] is None, 'model_identity_mismatch')
            if ready:
                require(not {'inference_unavailable', 'rules_only', 'incomplete_coverage'} & set(response['limitations']), 'genuine_inference_not_completed')
            if not ready:
                require('model_not_ready' in response['limitations'] and 'rules_only' in response['limitations'], 'failed_model_limit_missing')
            checks.append({'case': name, 'status': response['status'], 'analysis_complete': response['analysis_complete'],
                           'evidence_keys': [item['key'] for item in response['evidence']], 'limitations': response['limitations'], 'latency_ms': round(elapsed, 3)})
        for text in ('', 'x' * 2001):
            status, _, body, _ = request(port, '/api/analyze', text)
            require(status == 422 and json.loads(body)['error_key'] == 'invalid_input', 'input_limit_failed')
        if ready and benchmark:
            maximum = ('Fictional development text. ' * 100)[:1968] + ' Please send me your login code.'
            require(len(maximum) <= 2000, 'benchmark_input_limit')
            timings = []
            for index in range(100):
                text = maximum if index % 2 else 'We can meet for a fictional lunch tomorrow.'
                status, _, body, elapsed = request(port, '/api/analyze', text)
                result = json.loads(body)
                require(status == 200 and not result['analysis_complete'], 'benchmark_response_failed')
                require(not {'inference_unavailable', 'rules_only', 'incomplete_coverage'} & set(result['limitations']), 'benchmark_inference_failed')
                if index % 2:
                    require('request_for_secret' in [item['key'] for item in json.loads(body)['evidence']], 'full_text_end_signal_missing')
                timings.append(elapsed)
            with ThreadPoolExecutor(max_workers=8) as pool:
                burst = list(pool.map(lambda _: request(port, '/api/analyze', maximum), range(32)))
            require(all(status in (200, 503) for status, *_ in burst), 'burst_status_failed')
            concurrency = {'client_workers': 8, 'requests': len(burst), 'http_200': sum(item[0] == 200 for item in burst),
                           'http_503': sum(item[0] == 503 for item in burst), 'latency': metrics([item[3] for item in burst])}
            # Occupy all admission slots with incomplete bodies; prove rejection and total body deadline.
            sockets = []
            try:
                for _ in range(MAX_HTTP_REQUESTS):
                    connection = socket.create_connection(('127.0.0.1', port), timeout=2)
                    connection.settimeout(BODY_TIMEOUT_SECONDS + 3)
                    connection.sendall(f'POST /api/analyze HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/json\r\nContent-Length: 100\r\nConnection: close\r\n\r\n'.encode() + b'{"text":"')
                    sockets.append(connection)
                time.sleep(.15)
                status, _, body, _ = request(port)
                require(status == 503 and json.loads(body)['error_key'] == 'service_unavailable', 'admission_not_bounded')
                timeout_started = time.perf_counter()
                for connection in sockets:
                    reply = b''
                    while True:
                        part = connection.recv(8192)
                        if not part:
                            break
                        reply += part
                    require(b'408 Request Timeout' in reply and b'cache-control: no-store' in reply.lower(), 'body_deadline_failed')
                admission = {'slots': MAX_HTTP_REQUESTS, 'overflow_http_status': status, 'slow_body_http_status': 408,
                             'timeout_seconds': BODY_TIMEOUT_SECONDS, 'remaining_wait_measured_seconds': round(time.perf_counter() - timeout_started, 3)}
            finally:
                for connection in sockets:
                    connection.close()
        else:
            timings, concurrency, admission = [], None, None
        ui = browser_check(port, 'real-model' if ready else 'failed-model', env) if browser else None
        # Probe processes need loopback HTTP; only the application process is network-blocked.
        probe_env = {key: value for key, value in env.items() if key not in ('PYTHONPATH', 'CLEARMESSAGE_TEST_NETWORK_EVENTS')}
        liveness = subprocess.run([str(python), 'scripts/healthcheck.py', '--port', str(port)], cwd=runtime, env=probe_env, capture_output=True)
        readiness = subprocess.run([str(python), 'scripts/healthcheck.py', '--port', str(port), '--require-model'], cwd=runtime, env=probe_env, capture_output=True)
        require(liveness.returncode == 0 and readiness.returncode == (0 if ready else 1), 'health_probe_failed')
        return {'mode': mode, 'startup_to_http_health_seconds': round(startup, 3), 'health': health, 'flows': checks,
                'sequential_latency': metrics(timings) if timings else None, 'concurrency': concurrency,
                'admission': admission, 'browser': ui, 'liveness_probe_exit': liveness.returncode, 'readiness_probe_exit': readiness.returncode}
    finally:
        stop.set()
        watcher.join(timeout=2)
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)
        stdout.seek(0); stderr.seek(0)
        captured = stdout.read() + stderr.read()
        require(CANARY.encode() not in captured and str(runtime).encode() not in captured, 'diagnostic_leak')
        stdout.close(); stderr.close()
        require(bool(samples), 'memory_observation_missing')
        # Stored on this function so the caller can attach actual observations after shutdown.
        run_server.observations = {'sampled_peak_rss_mib': round(max(samples), 2) if samples else None,
                                   'samples': len(samples), 'application_logs_empty': not captured,
                                   'outgoing_network_attempts': len(events.read_text().splitlines()) if events.exists() else 0}


def main():
    parser = PrivateArgumentParser(description=__doc__)
    parser.add_argument('--clean-install', action='store_true', required=True)
    parser.add_argument('--report', type=Path, default=ROOT / 'docs/data/goal05-local-release.json')
    args = parser.parse_args()
    env = {key: value for key, value in os.environ.items() if key in ('PATH', 'TMPDIR', 'SYSTEMROOT', 'LANG', 'LC_ALL')}
    env.update({'PYTHONDONTWRITEBYTECODE': '1', 'FASTAPI_OTEL_AUTO_CONFIGURE': 'false', 'HF_HUB_OFFLINE': '1', 'TRANSFORMERS_OFFLINE': '1',
                'PLAYWRIGHT_BROWSERS_PATH': str(ROOT / '.cache/playwright')})
    try:
        with tempfile.TemporaryDirectory(prefix='clearmessage-release-') as temporary:
            work = Path(temporary)
            python = work / 'venv/bin/python'
            command([sys.executable, '-m', 'venv', str(work / 'venv')], ROOT, env)
            print('{"stage":"fresh_locked_python_install"}', flush=True)
            command([str(python), '-m', 'pip', 'install', '--no-cache-dir', '--disable-pip-version-check', '--only-binary=:all:', '--require-hashes', '-r', str(ROOT / 'backend/requirements.txt')], ROOT, env, timeout=300)
            command([str(python), '-m', 'pip', 'check'], ROOT, env)
            for name in ('frontend', 'assets'):
                shutil.copytree(ROOT / name, work / name, ignore=shutil.ignore_patterns('node_modules', 'dist', 'test-results', 'playwright-report'))
            env['npm_config_cache'] = str(work / 'npm-cache')
            print('{"stage":"clean_frontend_install_and_build"}', flush=True)
            command(['npm', 'ci', '--no-audit', '--no-fund'], work / 'frontend', env, timeout=180)
            command(['npm', 'run', 'build'], work / 'frontend', env)
            runtime = work / 'runtime'
            manifest = package(runtime, work / 'frontend/dist')
            hook = work / 'instrumentation'; hook.mkdir()
            (hook / 'sitecustomize.py').write_text('''import os, socket, sys
from pathlib import Path
path = Path(os.environ["CLEARMESSAGE_TEST_NETWORK_EVENTS"])
def audit(event, args):
    if event == "socket.getaddrinfo" and args[0] in ("127.0.0.1", "0.0.0.0"):
        return
    if event in ("socket.connect", "socket.getaddrinfo", "socket.gethostbyname", "socket.gethostbyaddr", "socket.getnameinfo", "socket.sendto", "socket.sendmsg"):
        with path.open("a") as stream:
            stream.write(event + "\\n")
        raise OSError("verification_network_blocked")
sys.addaudithook(audit)
''')
            print('{"stage":"real_runtime_http_and_browser"}', flush=True)
            actual = run_server(runtime, python, env, hook, 'real-model')
            actual.update(run_server.observations)
            print('{"stage":"offline_restart_same_assets"}', flush=True)
            restart = run_server(runtime, python, env, hook, 'offline-restart', benchmark=False, browser=False)
            restart.update(run_server.observations)
            require(all(hashlib.sha256((runtime / name).read_bytes()).hexdigest() == value for name, value in manifest['files'].items()), 'runtime_assets_changed')
            # Corrupt only the throwaway packaged model. The canonical artifact stays untouched.
            (runtime / CONFIG['artifact_path']).write_bytes(b'{"verification":"invalid-hash"}')
            print('{"stage":"corrupt_model_negative_case"}', flush=True)
            failed = run_server(runtime, python, env, hook, 'failed-model')
            failed.update(run_server.observations)
            require(all(result['outgoing_network_attempts'] == 0 for result in (actual, restart, failed)), 'analysis_egress_attempted')
            versions = json.loads(command([str(python), '-c', 'import importlib.metadata,json,sys; print(json.dumps({"python":sys.version.split()[0],**{name:importlib.metadata.version(name) for name in ("fastapi","pydantic","uvicorn","scikit-learn","numpy","scipy","tldextract")}}))'], runtime, env))
            report = {'goal': 'Goal 05', 'executed_at_utc': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                      'execution': 'Fresh locked Python venv and clean npm ci/build, isolated whitelisted runtime, real loopback HTTP and Chromium; NOT Docker',
                      'platform': {'system': platform.system(), 'architecture': platform.machine()}, 'versions': versions,
                      'node': command(['node', '--version'], ROOT, env).decode().strip(),
                      'runtime_file_count': len(manifest['files']), 'model_sha256': CONFIG['sha256'],
                      'selection_report_sha256': CONFIG['selection_report_sha256'], 'model_bytes': (ROOT / CONFIG['artifact_path']).stat().st_size,
                      'real_model': actual, 'offline_restart': restart, 'runtime_assets_unchanged_after_analysis_and_restart': True, 'genuine_inference_without_runtime_errors_verified': True, 'failed_model': failed, 'container_tested': False, 'public_url': None,
                      'blockers': ['No Docker CLI or daemon/alternative container runtime', 'No authorized existing public destination or hosting configuration'],
                      'memory_scope': 'Sampled process RSS via ps (KiB), including startup and load; no cgroup enforcement or image-size measurement',
                      'cpu_scope': 'One numerical thread and one inference slot; host CPU count is not constrained by a container quota',
                      'privacy_scope': 'Application stdout/stderr, responses, browser requests/console and blocked outgoing socket/DNS attempts verified locally; proxy/hosting unverified',
                      'passed': True}
            args.report.parent.mkdir(parents=True, exist_ok=True)
            args.report.write_text(json.dumps(report, indent=2, sort_keys=True) + '\n')
            print(json.dumps({'status': 'passed', 'execution': 'clean_local_not_docker', 'startup_seconds': actual['startup_to_http_health_seconds'], 'sampled_peak_rss_mib': actual['sampled_peak_rss_mib'], 'latency': actual['sequential_latency'], 'egress_attempts': 0}))
            return 0
    except VerificationFailure as failure:
        print(json.dumps({'status':'blocked_or_failed', 'code':str(failure), 'observations':getattr(run_server, 'observations', None), 'container_tested':False, 'public_url':None}))
        return 2
    except Exception:
        print('{"status":"blocked_or_failed","code":"release_verification_incomplete","container_tested":false,"public_url":null}')
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
