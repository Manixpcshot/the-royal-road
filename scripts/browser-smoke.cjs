// CI provides playwright-core and Chrome. Both tests run against extracted ZIPs.
const assert = require('node:assert/strict');
const { chromium, firefox } = require('playwright-core');
const {verifyDialogue}=require('./dialogue-check.cjs');

async function check(browser, url, width) {
  const page = await browser.newPage({viewport:{width,height:900}});
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('response', r=>{if(r.status()>=400)errors.push(r.url())});
  await page.goto(url);
  const pins=page.locator('.pin');
  await pins.last().waitFor();
  assert.equal(await pins.count(),12);
  const initialWidth=await page.locator('#board').evaluate(el=>el.clientWidth);
  await page.locator('#zoomIn').click();
  assert.ok(await page.locator('#board').evaluate(el=>el.clientWidth)>initialWidth);
  await page.locator('#zoomOut').click();
  const overlay=page.locator('#territories');
  await overlay.click();assert.equal(await overlay.getAttribute('aria-pressed'),'false');
  await overlay.click();
  for(const asset of ['terrain','palace','fort','tower','market','caravan','daric','flour','letter','indigo']){
    const size=await page.evaluate(async name=>{
      const image=new Image();image.src='./art/'+name+'.webp';await image.decode();return image.naturalWidth;
    },asset);
    assert.ok(size>=100);
  }
  const gallery={
    city:'sardis gordium celaenae mazaca tarsus melitene carchemish nisibis arbela babylon opis susa',
    portrait:'rota ard mina dara',
    surface:'cedar linen leather bronze lapis papyrus clay basalt',
    scene:'victory defeat guide lookout income dispatch'
  };
  await page.evaluate(async groups=>{
    await Promise.all(Object.entries(groups).flatMap(([group,names])=>names.split(' ').map(async name=>{
      const image=new Image();image.src='./art/'+group+'/'+name+'.webp';await image.decode();
    })));
  },gallery);
  await page.locator('#cityScene').waitFor({state:'visible'});
  await pins.first().click();
  assert.ok((await page.locator('#cityScene').getAttribute('src')).endsWith('/sardis.webp'));
  await pins.last().click();
  assert.equal(await page.locator('.cargo-art').count(),3);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1));
  assert.ok(await page.locator('#council').isVisible());
  assert.ok(await page.locator('#cargo').isHidden());
  await page.locator('[data-zone=cargo]').click();
  assert.ok(await page.locator('#cargo').isVisible());
  assert.ok(await page.locator('#council').isHidden());
  await pins.last().click();
  assert.ok(await page.locator('#council').isVisible());
  if(browser.browserType().name()==='chromium'){
    await page.screenshot({path:'dist/royal-road-'+width+'.png'});
  }
  await page.locator('#fold').click();
  assert.ok(await page.locator('#panels').isHidden());
  await page.locator('[data-zone="sound"]').click();
  assert.ok(await page.locator('#panels').isVisible());
  await page.locator('#screen').click();
  await page.waitForSelector('#screen[aria-pressed="true"]');
  await page.locator('#screen').click();
  await page.waitForSelector('#screen[aria-pressed="false"]');
  await page.locator('[data-zone=sound]').click();await page.locator('#voice').click();
  await page.locator('[data-zone=sound]').click();await page.locator('#lang').selectOption('off');
  await page.locator('[data-zone=cargo]').click();await page.locator('#load-0').press('Enter');
  assert.equal(await page.locator(':focus').getAttribute('id'),'hearStory');
  await page.locator('[data-zone=sound]').click();await page.locator('#lang').selectOption('en');
  await page.locator('[data-zone=cargo]').click();await page.locator('#hearStory').click();
  await page.locator('[data-zone=cargo]').click();await page.locator('#choice-0').press('Enter');
  assert.equal(await page.locator(':focus').getAttribute('id'),'hearStory');
  await page.reload();
  assert.match(await page.locator('#freightBody').innerText(),/Opis/);
  await page.locator('#undo').click();
  assert.equal(await page.locator(':focus').getAttribute('id'),'hearStory');
  assert.ok(await page.locator('#choice-0').isVisible());
  await page.locator('[data-zone=cargo]').click();await page.locator('#choice-0').click();
  await page.locator('#next').click();
  assert.match(await page.locator('#ledger').innerText(),/1 \/ 3/);
  assert.match(await page.locator('#freightReport').innerText(),/Delivered/);
  await page.reload();
  assert.ok(await page.locator('#undo').isDisabled());
  for(const lang of ['en','fa']){
    const response=await page.request.get(new URL('./audio/story/'+lang+'-street-11.mp3',page.url()).href);
    assert.equal(response.status(),200);assert.ok((await response.body()).length>2000);
  }
  await page.locator('[data-zone=sound]').click();await page.locator('#restart').click();await page.locator('#confirm').click();
  await page.locator('[data-zone=sound]').click();await page.locator('#lang').selectOption('off');
  await page.locator('[data-zone=reports]').click();await page.locator('#plan').click();
  assert.match(await page.locator('#estimate').innerText(),/12/);
  await pins.nth(7).click();
  await page.locator('#orders button').click();
  await page.locator('#undo').click();
  assert.match(await page.locator('#detail').innerText(),/Free/);
  await page.locator('#orders button').click();
  await page.reload();
  assert.equal(await pins.nth(7).getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#plan').getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('#detail').innerText(),/Persia/);
  assert.ok(await pins.nth(7).evaluate(pin=>{
    const rect=pin.getBoundingClientRect(),map=pin.closest('.scroll').getBoundingClientRect();
    return rect.left>=map.left&&rect.right<=map.right;
  }));
  await page.locator('#undo').click();
  assert.match(await page.locator('#detail').innerText(),/Free/);
  assert.match(await page.locator('#stats').innerText(),/2\/2/);
  await page.reload();
  assert.ok(await page.locator('#undo').isDisabled());
  await page.locator('#orders button').press('Enter');
  assert.equal(await page.locator(':focus').getAttribute('id'),'order-toll');
  await page.locator('[data-zone=reports]').click();await page.locator('summary').click();
  assert.match(await page.locator('#history').innerText(),/Nisibis/);
  await page.locator('[data-zone=sound]').click();await page.locator('#restart').click();
  await page.locator('#difficulty').selectOption('scout');
  await page.locator('#confirm').click();
  await page.reload();
  assert.equal(await pins.nth(11).getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#plan').getAttribute('aria-pressed'),'false');
  assert.ok(await page.locator('#undo').isDisabled());
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
 const browser=process.env.TEST_BROWSER==='firefox'?await firefox.launch():await chromium.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox']});
 try{
  await check(browser,'http://127.0.0.1:3000',1280);
  await check(browser,'http://127.0.0.1:8765/game/',390);
  await verifyDialogue(browser,'http://127.0.0.1:3000/',1280);
  await verifyDialogue(browser,'http://127.0.0.1:8765/game/',390);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
