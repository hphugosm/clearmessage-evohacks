import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const facts=JSON.parse(readFileSync(new URL('../src/model-facts.json',import.meta.url),'utf8'));

test('Behind the AI route and reload expose report-verified values and adjacent limitations',async({page})=>{
  await page.goto('/');await page.getByRole('link',{name:'Behind the AI',exact:true}).click();
  await expect(page).toHaveURL(/\/how-it-works$/);await expect(page.getByRole('heading',{name:'How ClearMessage works',exact:true})).toBeVisible();
  await expect(page.locator('.metrics dd')).toHaveText([facts.macroF1.toFixed(3),facts.perClass.smishing.recall.toFixed(3)]);
  await expect(page.getByText('5,873',{exact:true})).toBeVisible();await expect(page.getByText('4,844 HAM',{exact:true})).toBeVisible();await expect(page.getByText('439 SPAM',{exact:true})).toBeVisible();await expect(page.getByText('590 SMISHING',{exact:true})).toBeVisible();
  await expect(page.getByText('These metrics were measured on a previously evaluated test set and are not an independent blind validation.',{exact:true})).toBeVisible();
  await expect(page.getByText(/74 of 88 SMISHING annotations matched; 14 were missed/)).toBeVisible();await expect(page.getByText(/Independently verified language-specific benchmarks are unavailable for English and Czech/)).toBeVisible();
  await expect(page.getByText(/every assessment remains incomplete/)).toBeVisible();await expect(page.getByText(/not a validated public fraud detector/)).toBeVisible();await expect(page.getByText(/image is not uploaded/)).toBeVisible();
  await page.getByText('View class results and confusion matrix',{exact:true}).click();await expect(page.getByRole('table')).toHaveCount(2);const measured=facts.perClass.smishing;await expect(page.getByRole('table').first().locator('tbody tr').nth(2).locator('th,td')).toHaveText(['SMISHING',measured.precision.toFixed(3),measured.recall.toFixed(3),measured['f1-score'].toFixed(3),String(measured.support),String(measured.false_positives),String(measured.false_negatives)]);
  await page.reload();await expect(page.getByRole('heading',{name:'How ClearMessage works',exact:true})).toBeVisible();await page.getByRole('link',{name:'Back to checking a message'}).click();await expect(page.getByLabel('Message text',{exact:true})).toBeVisible();
});

test('transparency reflows at 360px and 200% text enlargement with keyboard-operable details',async({page})=>{
  await page.setViewportSize({width:360,height:800});await page.goto('/how-it-works');await page.getByText('View class results and confusion matrix',{exact:true}).focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('table').first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const region=page.getByRole('region',{name:'Classifier results by dataset label',exact:true});await region.focus();await page.keyboard.press('ArrowRight');await expect.poll(()=>region.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
  await page.keyboard.press('ArrowLeft');await expect.poll(()=>region.evaluate(element=>element.scrollLeft)).toBe(0);
  await page.setViewportSize({width:640,height:900});await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.getByRole('link',{name:'Back to checking a message'})).toBeVisible();
});
