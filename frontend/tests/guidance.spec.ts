import {test,expect} from '@playwright/test';

test('exact observed highlights escape HTML and never activate message URLs',async({page})=>{
  const text='😀 Please send <b>your</b> password. Pay me now. Keep this secret. https://notice.invalid/x';
  const destinations:string[]=[];page.on('request',request=>destinations.push(request.url()));
  await page.goto('/');await page.getByRole('button',{name:'Paste a message',exact:true}).click();await page.getByLabel('Message text',{exact:true}).fill(text);
  const waiting=page.waitForResponse(response=>response.url().endsWith('/api/analyze'));
  await page.getByRole('button',{name:'Check message',exact:true}).click();const result=await (await waiting).json();
  expect(result.evidence.map((item:{key:string})=>item.key)).toEqual(['request_for_secret','payment_pressure','secrecy_request']);
  await page.getByRole('button',{name:'Why this result?',exact:true}).click();
  const expected=['send <b>your</b> password','Pay me now','Keep this secret'];
  for(const [index,title] of ['A request for a password or code','Pressure to pay quickly','A request to keep things secret'].entries()){
    await page.locator('.evidence-item summary').filter({hasText:title}).click();const span=result.evidence[index].span;expect(Array.from(text).slice(span.start,span.end).join('')).toBe(expected[index]);
  }
  await expect(page.locator('.evidence-quote mark')).toHaveText(expected);await expect(page.locator('.evidence-quote b')).toHaveCount(0);
  await expect(page.locator('.result a')).toHaveCount(0);expect(destinations.some(url=>url.includes('notice.invalid'))).toBe(false);
});

test('negated notices and ordinary messages have no fabricated warning reasons',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Paste a message',exact:true}).click();await page.getByLabel('Message language',{exact:true}).selectOption('en');
  for(const [index,text] of ['Never share your password or verification code. We will never ask you to send it.','We can meet for a fictional lunch tomorrow.'].entries()){
    if(index) await page.getByRole('button',{name:'Edit message',exact:true}).click();
    await page.getByLabel('Message text',{exact:true}).fill(text);await page.getByRole('button',{name:'Check message',exact:true}).click();
    await expect(page.locator('.result')).toHaveAttribute('data-status','review');await page.getByRole('button',{name:'Why this result?',exact:true}).click();await expect(page.locator('.evidence-item')).toHaveCount(0);await expect(page.locator('.evidence-quote')).toHaveCount(0);await expect(page.getByText('Limited check · analysis is incomplete',{exact:true})).toBeVisible();
  }
});

test('legacy evidence and model-only findings never invent a highlighted phrase',async({page})=>{
  let modelOnly=false;
  await page.route('**/api/analyze',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({status:'suspicious',analysis_complete:false,headline_key:'suspicious_signals',evidence:[modelOnly?{key:'model_signal',basis:'classifier'}:{key:'request_for_secret',basis:'observed_text_signal'}],action_keys:['verify_independently'],limitations:['language_not_evaluated','not_a_safety_confirmation'],message_language:'en',model_version:'test-only-model',policy_version:'analysis-policy-2',contract_version:'1.1.0',share_summary_keys:['analysis_not_completed','help_verify_independently']})}));
  await page.goto('/');await page.getByRole('button',{name:'Paste a message',exact:true}).click();await page.getByLabel('Message language',{exact:true}).selectOption('en');
  for(const [index,title] of ['A request for a password or code','An experimental model pattern'].entries()){
    if(index) await page.getByRole('button',{name:'Edit message',exact:true}).click();
    await page.getByLabel('Message text',{exact:true}).fill('A fictional test-only API fixture.');await page.getByRole('button',{name:'Check message',exact:true}).click();await page.getByRole('button',{name:'Why this result?',exact:true}).click();await page.locator('.evidence-item summary').filter({hasText:title}).click();await expect(page.locator('.evidence-quote')).toHaveCount(0);modelOnly=true;
  }
  await expect(page.getByText('This finding comes from the experimental classifier. It cannot identify which words caused the prediction.',{exact:true})).toBeVisible();
});

test('ActionGuide selects appropriate curated steps, resets checkboxes and never sends choices',async({page})=>{
  let posts=0;page.on('request',request=>{if(request.method()==='POST')posts++;});await page.goto('/');await page.getByRole('button',{name:'Paste a message',exact:true}).click();
  await page.getByText('What have you already done?',{exact:true}).click();
  const cases=[['I haven’t interacted with the message.','Pause before replying, opening links or making a payment.'],['I opened the link.','Clicking alone does not tell us what happened.'],['I entered my password.','Change the affected password.'],['I shared payment information.','Contact your bank or payment provider promptly'],['I shared a verification code.','A code may allow account access or authorize a payment.']];
  for(const [situation,expected] of cases){await page.getByRole('radio',{name:situation,exact:true}).check();await expect(page.locator('.checklist')).toContainText(expected);expect(await page.locator('.checklist input:checked').count()).toBe(0);await page.locator('.checklist input').first().check();}
  expect(posts).toBe(0);await expect(page.locator('.action-guide textarea,.action-guide input[type="text"],.action-guide input[type="password"]')).toHaveCount(0);
  await page.getByLabel('Message text',{exact:true}).fill('A fictional ordinary message.');await expect(page.locator('.action-guide')).not.toHaveAttribute('open','');await page.getByText('What have you already done?',{exact:true}).click();await expect(page.getByRole('radio',{name:'I haven’t interacted with the message.',exact:true})).toBeChecked();
});

test('uncertain result guidance and copy keep source and selected situation private',async({page,context,browserName})=>{
  await context.grantPermissions(browserName === 'webkit' ? ['clipboard-read'] : ['clipboard-read','clipboard-write']);await page.goto('/');await page.getByRole('button',{name:'Paste a message',exact:true}).click();
  await page.getByLabel('Message text',{exact:true}).fill('PRIVATE_GUIDE_CANARY_987654 A fictional lunch plan.');await page.getByRole('button',{name:'Check message',exact:true}).click();await expect(page.locator('.result')).toHaveAttribute('data-status','review');
  await page.getByText('What have you already done?',{exact:true}).click();await page.getByRole('radio',{name:'I entered my password.',exact:true}).check();await expect(page.locator('.action-guide')).toContainText('even when the analysis is uncertain or unavailable');
  await page.getByRole('button',{name:'Ask someone for help'}).click();const preview=await page.getByLabel('Help request preview').inputValue();expect(preview).not.toMatch(/PRIVATE|987654|password|lunch/);await page.getByRole('button',{name:'Copy help request'}).click();await expect(page.getByText('Copied',{exact:true})).toBeVisible();expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(preview);
});
