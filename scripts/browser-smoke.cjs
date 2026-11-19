// CI provides playwright-core and Chrome. Both tests run against extracted ZIPs.
const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

async function check(browser, url, width) {
  const page = await browser.newPage({viewport:{width,height:900}});
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('response', r=>{if(r.status()>=400)errors.push(r.url())});
  await page.goto(url);
  const pins=page.locator('.pin');
  await pins.last().waitFor();
  assert.equal(await pins.count(),12);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#voice').click();
  await page.locator('#lang').selectOption('off');
  await page.locator('#load-0').click();
  await page.locator('#lang').selectOption('en');
  await page.locator('#hearStory').click();
  await page.locator('#choice-0').click();
  await page.reload();
  assert.match(await page.locator('#freightBody').innerText(),/Opis/);
  await page.locator('#next').click();
  assert.match(await page.locator('#ledger').innerText(),/1 \/ 3/);
  assert.match(await page.locator('#freightReport').innerText(),/Delivered/);
  for(const lang of ['en','fa']){
    const response=await page.request.get(new URL('./audio/story/'+lang+'-street-11.mp3',page.url()).href);
    assert.equal(response.status(),200);assert.ok((await response.body()).length>2000);
  }
  await page.locator('#restart').click();await page.locator('#confirm').click();
  await page.locator('#lang').selectOption('off');
  await page.locator('#plan').click();
  assert.match(await page.locator('#estimate').innerText(),/12/);
  await pins.nth(7).click();
  await page.locator('#orders button').click();
  await page.locator('#undo').click();
  assert.match(await page.locator('#detail').innerText(),/Free/);
  await page.locator('#orders button').click();
  await page.reload();
  await pins.nth(7).click();
  assert.match(await page.locator('#detail').innerText(),/Persia/);
  await page.locator('summary').click();
  assert.match(await page.locator('#history').innerText(),/Nisibis/);
  await page.locator('#restart').click();
  await page.locator('#difficulty').selectOption('scout');
  await page.locator('#confirm').click();
  for(const [i,city] of [7,6,3,1,0].entries()){
    if(i&&i%2===0)await page.locator('#next').click();
    await pins.nth(city).click();
    await page.locator('#orders button').click();
  }
  assert.match(await page.locator('#modalBody').innerText(),/Victory/);
  assert.deepEqual(errors,[]);
  await page.close();
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox']});
 try{
  await check(browser,'http://127.0.0.1:3000',1280);
  await check(browser,'http://127.0.0.1:8765/game/',390);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
