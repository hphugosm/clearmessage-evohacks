/** Verify a separate actual production build with screenshot input disabled. */
import {chromium} from '@playwright/test';
import {spawn,spawnSync} from 'node:child_process';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {createServer} from 'node:net';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../',import.meta.url));
const temporary=await mkdtemp(path.join(tmpdir(),'clearmessage-ocr-flag-'));
let server,browser,output='';
try{
  const built=spawnSync('npm',['--prefix','frontend','run','build','--','--outDir',temporary],{cwd:root,env:{...process.env,VITE_ENABLE_OCR:'false'},encoding:'utf8',timeout:120000});
  assert.equal(built.status,0,'Flag build failed');
  const probe=createServer();await new Promise((resolve,reject)=>{probe.once('error',reject);probe.listen(0,'127.0.0.1',resolve);});
  const port=probe.address().port;await new Promise((resolve,reject)=>probe.close(error=>error?reject(error):resolve()));
  server=spawn(path.join(root,'.venv/bin/python'),['scripts/serve.py','--port',String(port)],{cwd:root,env:{...process.env,FRONTEND_DIST:temporary},stdio:['ignore','pipe','pipe']});
  server.stdout.on('data',value=>{output+=value.toString();});server.stderr.on('data',value=>{output+=value.toString();});
  let ready=false;for(let count=0;count<80;count++){
    assert.equal(server.exitCode,null,'Flag server exited');try{ready=(await fetch(`http://127.0.0.1:${port}/api/health`)).ok;}catch{}
    if(ready)break;await new Promise(resolve=>setTimeout(resolve,100));
  }assert(ready,'Flag server unavailable');
  browser=await chromium.launch();const page=await browser.newPage();await page.goto(`http://127.0.0.1:${port}`);
  await page.getByLabel('Message text',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Upload a screenshot',exact:true}).count(),0);assert.equal(await page.locator('input[type="file"]').count(),0);
  assert(!await page.locator('.intro').innerText().then(text=>text.includes('upload')));
  await page.getByLabel('Message text',{exact:true}).fill('We can meet for a fictional lunch tomorrow.');await page.getByLabel('Message language',{exact:true}).selectOption('en');
  const waiting=page.waitForResponse(response=>response.url().endsWith('/api/analyze'));await page.getByRole('button',{name:'Check message',exact:true}).click();const response=await waiting;const result=await response.json();
  assert.equal(result.model_version,'clearmessage-sparse-v1:b6e56c3f1d34');assert.equal(result.status,'review');assert.equal(result.analysis_complete,false);
  await page.locator('.result').waitFor();assert.equal(output,'');
  const report={goal:'Goal 09',executed_at_utc:new Date().toISOString(),passed:true,flag:'VITE_ENABLE_OCR=false',actual_separate_production_build:true,screenshot_controls_absent:true,paste_actual_model_verified:true,analysis_complete:false,server_logs_empty:true};
  await writeFile(path.join(root,'docs/data/goal09-ocr-disabled.json'),JSON.stringify(report,null,2)+'\n');console.log('OCR-disabled production build and real paste analysis passed.');
}finally{await browser?.close();if(server){server.kill('SIGTERM');await new Promise(resolve=>server.once('exit',resolve));}await rm(temporary,{recursive:true,force:true});}
