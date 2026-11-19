// Exercise the shipped media through real browser decoders and playback events.
// The listener observes HTMLMediaElement.play without replacing the native playback.
const assert = require('node:assert/strict');

async function verifyDialogue(browser, url, width){
 const page=await browser.newPage({viewport:{width,height:850}});
 const issues=[];
 page.on('pageerror',error=>issues.push(error.message));
 page.on('response',r=>{if(r.status()>=400)issues.push(r.url())});
 await page.addInitScript(()=>{
  const original=HTMLMediaElement.prototype.play;
  window.heard=[];window.clips=[];
  HTMLMediaElement.prototype.play=function(){
   window.clips.push(this);
   this.addEventListener('playing',()=>window.heard.push(new URL(this.src).pathname),{once:true});
   const result=original.call(this);
   result.catch(err=>{window.playError=err.name+': '+err.message});
   return result;
  };
 });
 async function verifyStopped(){
  // Some engines report ended media separately from a manually paused element.
  const stillPlaying=await page.evaluate(()=>window.clips.filter(c=>!c.ended&&!c.paused)
   .map(c=>[new URL(c.src).pathname,c.currentTime,c.duration,c.readyState]));
  assert.deepEqual(stillPlaying,[],await page.locator('#city').innerText()+' '+JSON.stringify(stillPlaying));
 }
 async function heard(suffix){
  try{await page.waitForFunction(end=>window.heard.at(-1)?.endsWith(end),suffix,{timeout:10000})}
  catch(error){
   const state=await page.evaluate(()=>{
    const a=window.clips.at(-1);
    return {heard:window.heard.slice(-5),src:a?.src,playing:!a?.paused,ended:a?.ended,time:a?.currentTime,
     mediaError:a?.error?.message,playError:window.playError,status:document.querySelector('#audioStatus').textContent,
     lang:document.querySelector('#lang').value,story:document.querySelector('.conversation')?.innerText.slice(0,160)};
   });
   throw new Error('Expected '+suffix+'; browser state '+JSON.stringify(state)+'; errors '+JSON.stringify(issues),{cause:error});
  }
 }
 const home=new URL('./',url).href,alias=new URL('index.html',home).href;
 await page.goto(home);await page.locator('#hearCity').waitFor();
 const tested=await page.evaluate(async()=>{
  const {storyClips}=await import('./stories.mjs');
  const {lines}=await import('./rules.mjs');
  const context=new AudioContext(),paths=[];
  for(const lang of ['fa','en']){
   for(const clip of storyClips())paths.push('story/'+lang+'-'+clip.id);
   for(const id of [...Object.keys(lines),'deadline'])paths.push((lang==='fa'?'fa-':'')+id);
  }
  try{
   for(const path of paths){
    const response=await fetch('./audio/'+path+'.mp3');
    if(!response.ok)throw Error('Missing '+path);
    const sample=await context.decodeAudioData(await response.arrayBuffer());
    if(sample.duration<0.45||!sample.getChannelData(0).some(v=>Math.abs(v)>0.01))throw Error('Empty or silent '+path);
   }
  }finally{await context.close()}
  return paths.length;
 });
 assert.equal(tested,60);

 const {contracts,streets,voices}=await page.evaluate(async()=>{
  const {contracts,streets,voices}=await import('./stories.mjs');return {contracts,streets,voices};
 });
 const pins=page.locator('.pin');
 for(let city=0;city<streets.length;city++){
  await pins.nth(city).click();
  assert.ok((await page.locator('#streetText').innerText()).includes(streets[city][0]));
  await page.locator('#hearCity').click();await heard('fa-street-'+city+'.mp3');
 }
 await pins.nth(0).click();
 await verifyStopped();
 await page.locator('#lang').selectOption('en');
 await verifyStopped();

 for(const [id,contract] of contracts.entries()){
  for(const choice of [0,1]){
   await page.locator('#restart').click();await page.locator('#confirm').click();
   await page.locator('#load-'+id).click();
   const scene=page.locator('.conversation');
   assert.ok((await scene.innerText()).includes(contract.opening[1]));
   await page.locator('#hearStory').click();await heard('en-scene-'+id+'.mp3');
   await page.locator('#lang').selectOption('fa');await heard('fa-scene-'+id+'.mp3');
   await page.locator('#choice-'+choice).click();await heard('fa-reply-'+id+'-'+choice+'.mp3');
   assert.equal(await scene.locator('small').innerText(),voices[contract.answer[choice]].join(' / '));
   assert.ok((await scene.innerText()).includes(contract.replies[choice][0]));
   await page.locator('#undo').click();assert.ok((await scene.innerText()).includes(contract.opening[0]));
   await page.locator('#choice-'+choice).click();
   await page.goto(alias);
   assert.ok((await scene.innerText()).includes(contract.replies[choice][1]));
   await page.locator('#hearStory').click();await heard('fa-reply-'+id+'-'+choice+'.mp3');
   await page.locator('#lang').selectOption('en');await heard('en-reply-'+id+'-'+choice+'.mp3');
   await page.locator('#lang').selectOption('off');
   const count=await page.evaluate(()=>window.clips.length);
   await page.locator('#hearStory').click();await page.locator('#lang').selectOption('en');
   assert.equal(await page.evaluate(()=>window.clips.length),count);
   await verifyStopped();
  }
 }
 // Old index.html saves, no remaining orders, max fort, and both defeat causes.
 await page.evaluate(async()=>{
  const {fresh}=await import('./rules.mjs');const s=fresh();s.walls[11]=3;s.gold=0;
  localStorage.clear();localStorage.setItem('royal-road/1'+location.pathname,JSON.stringify(s));
 });
 await page.goto(home);await page.locator('#load-0').click();assert.match(await page.locator('#choice-0').innerText(),/already at maximum/);
 await page.locator('#undo').click();await page.locator('#load-1').click();
 assert.ok(await page.locator('#choice-0').isDisabled());
 for(const expired of [true,false]){
  await page.evaluate(async expired=>{
   const {fresh}=await import('./rules.mjs');const s=fresh();s.result='loss';s.last='loss';s.turn=expired?15:7;
   s.owners[11]=expired?1:2;s.freight={id:2,city:10,delay:0,choice:null};
   localStorage.setItem('royal-road/1'+location.pathname,JSON.stringify(s));
  },expired);
  await page.reload();
  const match=expired?/Fourteen turns/:/rival seal/;
  assert.match(await page.locator('#modalBody').innerText(),match);
  await page.locator('#close').click();assert.match(await page.locator('#dialogue').innerText(),match);
  assert.match(await page.locator('.conversation').innerText(),/undelivered/);
  assert.equal(await page.locator('.choices button').count(),0);
  await page.locator('#lang').selectOption('en');await page.locator('#voice').click();await heard(expired?'/deadline.mp3':'/loss.mp3');
 }
 assert.deepEqual(issues,[]);
 console.log('Dialogue verified',browser.browserType().name(),width,url,tested,'decoded audio files');
 await page.close();
}
module.exports={verifyDialogue};
