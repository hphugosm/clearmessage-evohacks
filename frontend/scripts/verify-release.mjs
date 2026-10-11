/** Actual packaged runtime walkthrough with real model/OCR and fictional inputs. */
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const facts=JSON.parse(readFileSync(new URL('../src/model-facts.json',import.meta.url),'utf8'));
const port=Number(process.argv[2]),mode=process.argv[3];
assert(Number.isInteger(port)&&port>0&&port<65536);
assert(['real-model','failed-model'].includes(mode));
const origin=`http://127.0.0.1:${port}`;
let browser,stage='startup';
try {
  browser=await chromium.launch();
  const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();
  const requests=[],logs=[],errors=[],external=[];
  let posts=0;
  await context.route('**/*',route=>{
    if(new URL(route.request().url()).origin!==origin){external.push(route.request().url());return route.abort();}
    return route.continue();
  });
  page.on('request',request=>{requests.push(request.url());if(request.method()==='POST'){
    posts++;const payload=request.postDataJSON();assert.deepEqual(Object.keys(payload).sort(),['message_language','text']);assert.equal(typeof payload.text,'string');
  }});
  page.on('console',message=>logs.push(message.text()));
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin);
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  assert.equal(await page.title(),'ClearMessage — Message guidance');
  assert((await page.locator('body').evaluate(element=>getComputedStyle(element).fontFamily)).includes('-apple-system'));
  const checks=[];
  async function resultCheck(response,expected,name){
    const result=await response.json();
    assert.equal(response.status(),200);assert.equal(response.headers()['cache-control'],'no-store');
    assert.equal(result.status,expected);assert.equal(result.analysis_complete,false);
    assert.equal(result.model_version,mode==='real-model'?'clearmessage-sparse-v1:b6e56c3f1d34':null);
    await page.locator(`.result[data-status="${expected}"]`).waitFor();
    assert(await page.getByText('Limited check · analysis is incomplete',{exact:true}).isVisible());
    if(mode==='failed-model'&&expected==='review')assert(await page.getByText('Analysis not performed',{exact:true}).isVisible());
    checks.push({case:name,status:result.status,analysis_complete:result.analysis_complete});
    return result;
  }
  for(const [name,text,language,expected] of [
    ['ordinary','We can meet for a fictional lunch tomorrow.','en','review'],
    ['observed-warning','Please send me your login code. Pay the invoice immediately. Keep this secret.','en','suspicious'],
    ['unsupported-scope','We can meet for a fictional lunch tomorrow.','other','review'],
  ]){
    stage=name;await page.getByLabel('Message text',{exact:true}).fill(text);
    await page.getByLabel('Message language',{exact:true}).selectOption(language);
    const waiting=page.waitForResponse(response=>response.url().endsWith('/api/analyze'));
    await page.getByRole('button',{name:'Check message',exact:true}).click();
    const result=await resultCheck(await waiting,expected,name);
    if(name==='ordinary')assert.equal(result.evidence.length,0);
    await page.getByRole('button',{name:'Ask someone for help',exact:true}).click();
    const preview=await page.getByLabel('Help request preview').inputValue();
    assert(!preview.includes(text));assert(!/https?:|login code|invoice|PRIVATE_RELEASE_CANARY/.test(preview));
  }
  // The image is generated only in this verification browser. Production has no fixture override.
  stage='ocr';const image=await page.evaluate(()=>{
    const canvas=document.createElement('canvas');canvas.width=1100;canvas.height=340;
    const draw=canvas.getContext('2d');draw.fillStyle='white';draw.fillRect(0,0,1100,340);draw.fillStyle='#111827';draw.font='36px Arial';
    ['Please send me your login code.','Pay the invoice immediately.','Keep this secret.','Fictional demo message.'].forEach((line,index)=>draw.fillText(line,40,65+index*75));
    return canvas.toDataURL('image/png').split(',')[1];
  });
  const beforeOcr=posts;
  await page.getByRole('button',{name:'Upload a screenshot',exact:true}).click();
  await page.getByLabel('Choose screenshot',{exact:true}).setInputFiles({name:'fictional-release.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});
  const field=page.getByLabel('Review the extracted text',{exact:true});
  await field.waitFor({timeout:60000});
  const extracted=await field.inputValue();assert(extracted.includes('Please send me your login code'));
  assert.equal(posts,beforeOcr);assert.equal(await page.locator('.result').count(),0);
  await field.fill(extracted+'\nAn editable fictional note.');
  await page.getByRole('button',{name:'Check message',exact:true}).click();
  assert(await page.getByRole('alert').isVisible());assert.equal(posts,beforeOcr);
  await page.getByLabel('I reviewed this text and removed sensitive details.').check();
  await page.getByLabel('Message language',{exact:true}).selectOption('en');
  const waiting=page.waitForResponse(response=>response.url().endsWith('/api/analyze'));
  await page.getByRole('button',{name:'Check message',exact:true}).click();
  stage='screenshot-analysis';const screenshotResult=await resultCheck(await waiting,'suspicious','real-screenshot-reviewed');
  assert(screenshotResult.evidence.some(item=>item.key==='request_for_secret'));
  stage='highlight';await page.locator('.evidence-item summary').first().click();
  assert.equal(await page.locator('.evidence-item mark').first().innerText(),'send me your login code');
  assert.equal(await page.locator('.result a[href]').count(),0);
  stage='guide';await page.getByText('What have you already done?',{exact:true}).click();
  await page.getByLabel('I entered my password.',{exact:true}).check();
  assert(await page.getByText('Change the affected password. Change it on other accounts where you reused it.',{exact:true}).isVisible());
  assert.equal(posts,beforeOcr+1);
  await page.getByRole('button',{name:'Ask someone for help',exact:true}).click();
  const preview=await page.getByLabel('Help request preview').inputValue();
  assert(!/login|invoice|secret|https?:|password|verification code/.test(preview));
  stage='copy';await page.getByRole('button',{name:'Copy help request',exact:true}).click();
  await page.getByText('Copied',{exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),preview);
  stage='transparency';await page.getByRole('link',{name:'Behind the AI',exact:true}).click();
  stage='transparency-url';assert.equal(new URL(page.url()).pathname,'/how-it-works');
  stage='transparency-title';await page.getByRole('heading',{name:'How ClearMessage works',exact:true}).waitFor();assert(await page.getByRole('heading',{name:'How ClearMessage works',exact:true}).isVisible());
  stage='transparency-disclosure';assert(await page.getByText('These metrics were measured on a previously evaluated test set and are not an independent blind validation.',{exact:true}).isVisible());
  stage='transparency-metrics';assert(await page.getByText(facts.datasetCount.toLocaleString('en-US'),{exact:true}).isVisible());assert.deepEqual(await page.locator('.metrics dd').allTextContents(),[facts.macroF1.toFixed(3),facts.perClass.smishing.recall.toFixed(3)]);
  stage='transparency-reload';await page.reload();await page.getByRole('heading',{name:'How ClearMessage works',exact:true}).waitFor();assert(await page.getByRole('heading',{name:'How ClearMessage works',exact:true}).isVisible());
  await page.getByRole('link',{name:'Home',exact:true}).click();assert.equal(await page.getByLabel('Message text',{exact:true}).inputValue(),'');
  stage='privacy';assert(requests.every(url=>new URL(url).origin===origin));assert.equal(external.length,0);assert.equal(errors.length,0);
  assert(!logs.join(' ').includes('PRIVATE_RELEASE_CANARY'));assert(!logs.join(' ').includes('Please send me'));
  assert.deepEqual(await page.evaluate(()=>[localStorage.length,sessionStorage.length]),[0,0]);
  assert.equal(await page.evaluate(async()=>(await indexedDB.databases()).length),0);assert.deepEqual(await context.cookies(),[]);
  console.log(JSON.stringify({passed:true,browser:await browser.version(),flows:checks,real_local_ocr:true,explicit_review_and_confirmation:true,exact_rule_highlight:true,curated_guidance:true,neutral_clipboard_copy:true,transparency_verified:true,external_requests:0,page_errors:0,local_assets_loaded:true,persistent_message_storage:false}));
}catch{
  console.log(JSON.stringify({passed:false,code:'release_browser_flow_failed',stage}));process.exitCode=1;
}finally{await browser?.close();}
