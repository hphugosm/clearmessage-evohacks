// Every decision here is fictional and confined to a disposable test workspace.
import { chromium } from '../frontend/node_modules/@playwright/test/index.mjs';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=path.resolve(import.meta.dirname,'..');
const directory=await mkdtemp(path.join(tmpdir(),'clearmessage-validation-browser-'));
const setup=spawnSync(path.join(root,'.venv/bin/python'),['-c',
  "import importlib.util,json,sys;from pathlib import Path;s=importlib.util.spec_from_file_location('fixture','tests/test_review_validation.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);print(json.dumps([str(p) for p in m.make_fixture(Path(sys.argv[1]))]))", directory],{cwd:root,encoding:'utf8'});
if(setup.status!==0)throw Error('Fictional validation fixture setup failed: '+setup.stderr);
const [review,source,candidate,hints]=JSON.parse(setup.stdout);
const protectedBytes=await Promise.all([review,source,candidate].map(p=>readFile(p)));
const origin='http://127.0.0.1:8768';
const server=spawn(path.join(root,'.venv/bin/python'),['scripts/review_tool.py','--port','8768','--review',review,'--source',source,'--candidate',candidate,'--validation-hints',hints],{cwd:root,stdio:['ignore','pipe','pipe']});
let browser, output='';server.stdout.on('data',b=>output+=b);server.stderr.on('data',b=>output+=b);
try {
  for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/validation')).ok)break;}catch{}if(i===99||server.exitCode!==null)throw Error('Fictional validation server failed');await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const external=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{
    if(!route.request().url().startsWith(origin+'/')){external.push('blocked');return route.abort();}
    if(route.request().url()===origin+'/api/validation'){
      const response=await route.fetch();const value=await response.json();
      // Test-only untrusted markup; never inserted into the source corpus.
      value.records[0].text='<img src="https://image.invalid/private" onerror="window.untrustedRan=true"><script>window.untrustedRan=true</script> Fictional message.';
      return route.fulfill({response,json:value});
    }
    return route.continue();
  });
  await page.goto(origin);await page.locator('tr[data-row-id]').first().waitFor();
  await page.screenshot({path:'/tmp/clearmessage-validation-fictional.png',fullPage:false});
  assert.equal(await page.locator('tr[data-row-id]').count(),29);
  assert.equal(await page.locator('#submit').isDisabled(),true);
  await page.locator('#scope').selectOption('all');assert.equal(await page.locator('tr[data-row-id]').count(),45);
  assert.equal(await page.locator('td img,td a,td script').count(),0);assert.equal(await page.evaluate(()=>window.untrustedRan),undefined);
  await page.locator('#scope').selectOption('changed');await page.locator('#label').selectOption('ham');assert.equal(await page.locator('tr[data-row-id]').count(),14);
  await page.locator('#select-visible').check();await page.locator('#batch').selectOption('original');await page.locator('#apply').click();
  await page.locator('#cancel-confirm').click();
  assert.equal((await (await fetch(origin+'/api/validation')).json()).records.filter(r=>r.label_rechecked).length,0);
  await page.locator('#apply').click();await page.locator('#accept-confirm').click();
  await page.waitForFunction(()=>document.querySelectorAll('tr[data-row-id]').length===0);
  assert.equal(JSON.parse(await readFile(review)).records.filter(r=>r.decision==='disagreed').length,29);
  await page.locator('#scope').selectOption('all');await page.locator('#label').selectOption('all');
  assert.match(await page.locator('#selection').textContent(),/^0 selected/);
  await page.locator('#select-visible').check();await page.locator('#batch').selectOption('current');await page.locator('#apply').click();await page.locator('#accept-confirm').click();
  await page.waitForFunction(()=>document.getElementById('counters').textContent.includes('0Labels to recheck'));
  const english=page.getByRole('button',{name:'Confirm this group as English',exact:true});
  await english.click();await page.locator('#cancel-confirm').click();
  assert.equal((await (await fetch(origin+'/api/validation')).json()).records.filter(r=>r.language_confirmed).length,0);
  await english.click();await page.locator('#accept-confirm').click();
  await page.waitForFunction(()=>document.getElementById('counters').textContent.includes('0Languages to confirm'));
  await page.locator('#reviewer').fill('fictional-browser-owner');await page.locator('#metadata').click();
  assert.match(await page.locator('#confirm-description').textContent(),/historical timestamp remains unknown/);
  await page.locator('#accept-confirm').click();await page.waitForFunction(()=>document.getElementById('metadata').disabled);
  await page.locator('#quarantine').click();await page.locator('#accept-confirm').click();
  await page.waitForFunction(()=>!document.getElementById('submit').disabled);
  await page.locator('#submit').click();await page.locator('#cancel-confirm').click();
  assert.equal((await readdir(path.dirname(review))).filter(n=>n.startsWith('review.approval-draft-')).length,0);
  await page.locator('#submit').click();await page.locator('#accept-confirm').click();
  await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Draft submitted for separate final approval'));
  const draftName=(await readdir(path.dirname(review))).find(n=>n.startsWith('review.approval-draft-'));
  const draft=JSON.parse(await readFile(path.join(path.dirname(review),draftName)));
  assert.equal(draft.final_approval_given,false);assert.equal(draft.status,'draft_awaiting_final_owner_approval');
  assert.equal(draft.records.filter(r=>r.metadata_confirmation?.historical_date_unknown).length,4);
  assert.equal(draft.effect.quarantined_rows,2);
  assert.equal(draft.records.every(r=>r.label_rechecked&&r.language_confirmed),true);
  for(let i=0;i<3;i++)assert.deepEqual(await readFile([review,source,candidate][i]),protectedBytes[i]);
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.reload();await page.locator('tr[data-row-id]').first().waitFor();
  assert.equal((await (await fetch(origin+'/api/validation')).json()).draft_submitted,true);
  assert.deepEqual(external,[]);assert.deepEqual(errors,[]);assert.equal(output.includes('Fictional validation ham'),false);
  console.log('PASS: 29 changed / 45 total, bulk cancel/confirm, no inferred languages, explicit language group and metadata, quarantine proposal, separate draft submission, inert markup/URLs, server-memory reload, narrow layout, canonical/source/candidate unchanged, no approval/freeze/training/egress.');
} finally {
  if(browser)await browser.close();server.kill('SIGTERM');await new Promise(r=>server.exitCode!==null?r():server.once('exit',r));await rm(directory,{recursive:true,force:true});
}
