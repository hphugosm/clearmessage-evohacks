import { test, expect } from '@playwright/test';

async function screenshot(page: import('@playwright/test').Page, mime = 'image/png') {
  const data = await page.evaluate(type => {
    const canvas = document.createElement('canvas'); canvas.width=1100; canvas.height=340;
    const context=canvas.getContext('2d')!; context.fillStyle='white'; context.fillRect(0,0,canvas.width,canvas.height);
    context.fillStyle='#111827'; context.font='36px Arial';
    ['Please send me your login code.', 'Pay the invoice immediately.', 'Keep this secret.', 'Fictional demo message.'].forEach((line,index)=>context.fillText(line,40,65+index*75));
    return canvas.toDataURL(type).split(',')[1];
  }, mime);
  return { name: mime === 'image/png' ? 'fictional.png' : 'fictional.jpg', mimeType: mime, buffer: Buffer.from(data,'base64') };
}
async function monitorWorkers(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const NativeWorker=window.Worker;
    const counts={created:0,terminated:0};
    (window as unknown as {ocrWorkers:typeof counts}).ocrWorkers=counts;
    window.Worker=class extends NativeWorker {
      stopped=false;
      constructor(url: string | URL, options?: WorkerOptions) { super(url,options); counts.created++; }
      terminate() { if (!this.stopped) { counts.terminated++; this.stopped=true; } super.terminate(); }
    };
  });
}

test('real local PNG OCR → editable review → explicit confirmation → actual approved model → neutral help', async ({page,context,baseURL})=>{
  test.setTimeout(90_000); await monitorWorkers(page);
  const requests:string[]=[]; const logs:string[]=[]; const errors:string[]=[]; let posts=0;
  page.on('request',request=>{requests.push(request.url()); if(request.method()==='POST') posts++;});
  page.on('console',message=>logs.push(message.text())); page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/'); const image=await screenshot(page);
  await page.getByRole('button',{name:'Upload a screenshot'}).click();
  await page.getByLabel('Choose screenshot',{exact:true}).setInputFiles(image);
  const field=page.getByLabel('Review the extracted text',{exact:true});
  await expect(field).toBeVisible({timeout:60_000});
  await expect(field).toHaveValue(/Please send me your login code/); await expect(field).toBeFocused();
  expect(posts).toBe(0); await expect(page.locator('.result')).toHaveCount(0);
  await page.getByRole('button',{name:'Check message',exact:true}).click();
  await expect(page.getByRole('alert')).toHaveText('Review and confirm the extracted text first. Analysis was not performed.'); expect(posts).toBe(0);
  const extracted=await field.inputValue(); await field.fill(extracted+'\nAn editable fictional note.');
  await page.getByLabel('I reviewed this text and removed sensitive details.').check();
  // Editing revokes confirmation instead of silently approving changed OCR output.
  await field.fill(extracted); await expect(page.getByLabel('I reviewed this text and removed sensitive details.')).not.toBeChecked();
  await page.getByLabel('I reviewed this text and removed sensitive details.').check();
  await page.getByLabel('Message language',{exact:true}).selectOption('en');
  const responsePromise=page.waitForResponse(response=>response.url().endsWith('/api/analyze'));
  await page.getByRole('button',{name:'Check message',exact:true}).click(); const response=await responsePromise; const result=await response.json();
  expect(response.request().postDataJSON()).toEqual({text:extracted,message_language:'en'});
  expect(result.model_version).toBe('clearmessage-sparse-v1:b6e56c3f1d34'); expect(result.analysis_complete).toBe(false);
  expect(result.evidence.map((item:{key:string})=>item.key)).toContain('request_for_secret');
  await expect(page.locator('.result')).toBeVisible();
  await page.getByRole('button',{name:'Ask someone for help'}).click();
  expect(await page.getByLabel('Help request preview').inputValue()).not.toMatch(/login|invoice|secret|https?:/);
  expect(requests.every(url=>new URL(url).origin===new URL(baseURL!).origin)).toBe(true);
  expect(requests.some(url=>url.endsWith('/assets/ocr/eng.traineddata.gz'))).toBe(true);
  expect(await page.evaluate(()=>[localStorage.length,sessionStorage.length])).toEqual([0,0]);
  expect(await page.evaluate(async()=> (await indexedDB.databases()).length)).toBe(0); expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(()=>(window as unknown as {ocrWorkers:unknown}).ocrWorkers)).toEqual({created:1,terminated:1});
  expect(errors).toEqual([]); expect(logs.join(' ')).not.toContain('Please send me');
});

test('real JPEG OCR works through drag and drop without automatically checking',async({page})=>{
  test.setTimeout(90_000); let posts=0; page.on('request',request=>{if(request.method()==='POST') posts++;});
  await page.goto('/'); const image=await screenshot(page,'image/jpeg');
  await page.getByRole('button',{name:'Upload a screenshot'}).click();
  const transfer=await page.evaluateHandle(({data})=>{const bytes=Uint8Array.from(atob(data),char=>char.charCodeAt(0));const transfer=new DataTransfer();transfer.items.add(new File([bytes],'fictional.jpg',{type:'image/jpeg'}));return transfer;},{data:image.buffer.toString('base64')});
  await page.locator('.drop-area').dispatchEvent('drop',{dataTransfer:transfer}); await transfer.dispose();
  await expect(page.getByLabel('Review the extracted text',{exact:true})).toHaveValue(/Pay the invoice immediately/,{timeout:60_000}); expect(posts).toBe(0);
});

test('invalid, oversized and corrupt images preserve text fallback',async({page})=>{
  await page.goto('/'); await page.getByRole('button',{name:'Upload a screenshot'}).click();
  const header=Buffer.alloc(33);header.set([137,80,78,71,13,10,26,10]);header.writeUInt32BE(13,8);header.write('IHDR',12);header.writeUInt32BE(100,16);header.writeUInt32BE(100,20);
  const oversized=Buffer.from(header);oversized.writeUInt32BE(4000,16);oversized.writeUInt32BE(4000,20);
  const cases=[
    {name:'fake.png',mimeType:'image/png',buffer:Buffer.from('<svg>fictional</svg>'),error:'Choose one actual PNG'},
    {name:'huge.jpg',mimeType:'image/jpeg',buffer:Buffer.alloc(10*1024*1024+1),error:'This image exceeds 10 MB'},
    {name:'broken.png',mimeType:'image/png',buffer:Buffer.from([137,80,78,71,13,10,26,10]),error:'We could not read this image'},
    {name:'empty.png',mimeType:'image/png',buffer:Buffer.alloc(0),error:'This file is empty'},
    {name:'decoded-broken.png',mimeType:'image/png',buffer:header,error:'We could not read this image'},
    {name:'pixel-limit.png',mimeType:'image/png',buffer:oversized,error:'This image exceeds the supported dimensions'},
  ];
  for(const {error,...image} of cases){await page.getByLabel('Choose screenshot',{exact:true}).setInputFiles(image);await expect(page.getByRole('alert')).toContainText(error);await expect(page.locator('.result')).toHaveCount(0);}
  await page.getByRole('button',{name:'Paste a message instead'}).click();
  await page.getByLabel('Message text',{exact:true}).fill('A fictional ordinary lunch plan for tomorrow.');
  await page.getByRole('button',{name:'Check message',exact:true}).click();await expect(page.locator('.result')).toHaveAttribute('data-status','review');
});

test('real long OCR stays editable and cannot submit an over-limit message',async({page,browserName})=>{
  test.setTimeout(90_000);await monitorWorkers(page);let posts=0;page.on('request',request=>{if(request.method()==='POST') posts++;});
  await page.setViewportSize({width:360,height:800});await page.goto('/');
  const data=await page.evaluate(()=>{
    const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=2800;
    const context=canvas.getContext('2d')!;context.fillStyle='white';context.fillRect(0,0,canvas.width,canvas.height);context.fillStyle='#111827';context.font='34px Arial';
    for(let index=0;index<48;index++) context.fillText('Fictional meeting note for tomorrow afternoon.',30,55+index*56);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  const upload=page.getByRole('button',{name:'Upload a screenshot',exact:true});await upload.focus();await page.keyboard.press('Enter');
  const choosing=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Choose screenshot',exact:true}).focus();await page.keyboard.press('Enter');
  await (await choosing).setFiles({name:'fictional-long.png',mimeType:'image/png',buffer:Buffer.from(data,'base64')});
  const field=page.getByLabel('Review the extracted text',{exact:true});await expect(field).toBeVisible({timeout:60_000});await expect(field).toBeFocused();
  const output=await field.inputValue();expect([...output].length).toBeGreaterThan(2000);expect(posts).toBe(0);
  // WebKit on macOS uses Option+Tab to include controls in native navigation.
  const confirmation=page.getByLabel('I reviewed this text and removed sensitive details.');
  for(let step=0;step<12;step++){
    await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
    if(await confirmation.evaluate(element=>element===document.activeElement)) break;
  }
  await expect(confirmation).toBeFocused();await page.keyboard.press('Space');
  await page.getByRole('button',{name:'Check message',exact:true}).click();await expect(page.getByRole('alert')).toContainText('The text exceeds 2,000 characters');expect(posts).toBe(0);await expect(field).toHaveValue(output);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await field.fill('Please send me your login code. Fictional demonstration.');await expect(page.getByLabel('I reviewed this text and removed sensitive details.')).not.toBeChecked();
  await page.getByLabel('I reviewed this text and removed sensitive details.').check();await page.getByLabel('Message language',{exact:true}).selectOption('en');
  await page.getByRole('button',{name:'Check message',exact:true}).click();await expect(page.locator('.result')).toHaveAttribute('data-status','suspicious');
  expect(posts).toBe(1);expect(await page.evaluate(()=>(window as unknown as {ocrWorkers:unknown}).ocrWorkers)).toEqual({created:1,terminated:1});
});

test('real blank screenshot has a readable error and no reassuring result at 200% text',async({page})=>{
  test.setTimeout(90_000);await monitorWorkers(page);let posts=0;page.on('request',request=>{if(request.method()==='POST') posts++;});
  await page.setViewportSize({width:640,height:900});await page.goto('/');await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
  const data=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=800;canvas.height=250;const context=canvas.getContext('2d')!;context.fillStyle='white';context.fillRect(0,0,800,250);return canvas.toDataURL('image/png').split(',')[1];});
  await page.getByRole('button',{name:'Upload a screenshot'}).click();await page.getByLabel('Choose screenshot',{exact:true}).setInputFiles({name:'fictional-blank.png',mimeType:'image/png',buffer:Buffer.from(data,'base64')});
  await expect(page.getByRole('alert')).toContainText('No readable text was found',{timeout:60_000});await expect(page.locator('.result')).toHaveCount(0);expect(posts).toBe(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.evaluate(()=>(window as unknown as {ocrWorkers:unknown}).ocrWorkers)).toEqual({created:1,terminated:1});
  await page.getByRole('button',{name:'Paste a message instead'}).click();await expect(page.getByLabel('Message text',{exact:true})).toBeVisible();
});

test('OCR initialization failure terminates the worker and offers paste input',async({page})=>{
  await monitorWorkers(page);await page.route('**/assets/ocr/worker.min.js',route=>route.fulfill({status:404,body:''}));
  await page.goto('/');const image=await screenshot(page);await page.getByRole('button',{name:'Upload a screenshot'}).click();await page.getByLabel('Choose screenshot',{exact:true}).setInputFiles(image);
  await expect(page.getByRole('alert')).toContainText('Local text recognition could not start');
  expect(await page.evaluate(()=>(window as unknown as {ocrWorkers:unknown}).ocrWorkers)).toEqual({created:1,terminated:1});
  await page.getByRole('button',{name:'Paste a message instead'}).click();await expect(page.getByLabel('Message text',{exact:true})).toBeVisible();
});

test('changing input method during initialization cancels extraction and ignores late text',async({page})=>{
  await monitorWorkers(page);let release!:()=>void;const wait=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/assets/ocr/eng.traineddata.gz',async route=>{await wait;await route.continue().catch(()=>{});});
  await page.goto('/');const image=await screenshot(page);await page.getByRole('button',{name:'Upload a screenshot'}).click();await page.getByLabel('Choose screenshot',{exact:true}).setInputFiles(image);
  await expect(page.getByRole('button',{name:'Cancel text recognition'})).toBeVisible();
  // Exercise worker-initialization cancellation, rather than racing image decode
  // and expecting termination of a worker that has not been created yet.
  await expect.poll(()=>page.evaluate(()=>(window as unknown as {ocrWorkers:{created:number}}).ocrWorkers.created)).toBe(1);
  await page.getByRole('button',{name:'Paste a message',exact:true}).click();release();
  await page.getByLabel('Message text',{exact:true}).fill('A different fictional message.');
  await expect(page.getByLabel('Message text',{exact:true})).toHaveValue('A different fictional message.');
  expect(await page.evaluate(()=>(window as unknown as {ocrWorkers:{created:number;terminated:number}}).ocrWorkers.terminated)).toBe(1);
  await expect(page.getByRole('alert')).toHaveCount(0);await expect(page.locator('.result')).toHaveCount(0);
});

test('keyboard cancellation announces no analysis, restores focus and permits a fresh real extraction', async ({page}) => {
  test.setTimeout(90_000); await monitorWorkers(page); let posts=0;
  page.on('request',request=>{if(request.method()==='POST') posts++;});
  let release!:()=>void; const blocked=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/assets/ocr/eng.traineddata.gz',async route=>{await blocked;await route.continue().catch(()=>{});});
  await page.goto('/'); const image=await screenshot(page);
  await page.getByRole('button',{name:'Upload a screenshot'}).click();
  await page.getByLabel('Choose screenshot',{exact:true}).setInputFiles(image);
  await expect.poll(()=>page.evaluate(()=>(window as unknown as {ocrWorkers:{created:number}}).ocrWorkers.created)).toBe(1);
  const cancel=page.getByRole('button',{name:'Cancel text recognition',exact:true});
  await cancel.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('status').filter({hasText:'Text recognition was cancelled. No analysis was performed.'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Choose screenshot',exact:true})).toBeFocused();
  await expect(page.getByLabel('Review the extracted text',{exact:true})).toHaveCount(0);
  await expect(page.locator('.result')).toHaveCount(0); expect(posts).toBe(0);
  expect(await page.evaluate(()=>(window as unknown as {ocrWorkers:unknown}).ocrWorkers)).toEqual({created:1,terminated:1});
  release(); await page.unroute('**/assets/ocr/eng.traineddata.gz');
  await page.getByLabel('Choose screenshot',{exact:true}).setInputFiles(image);
  await expect(page.getByLabel('Review the extracted text',{exact:true})).toHaveValue(/Please send me your login code/,{timeout:60_000});
  expect(posts).toBe(0);
  expect(await page.evaluate(()=>(window as unknown as {ocrWorkers:unknown}).ocrWorkers)).toEqual({created:2,terminated:2});
});
