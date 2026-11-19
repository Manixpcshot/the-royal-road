import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,order,advance,valid,linked} from '../public/rules.mjs';
test('remote claims and overspending leave state untouched',()=>{
 const s=fresh(),before=structuredClone(s);assert.equal(order(s,0,'join'),false);assert.deepEqual(s,before);
 s.gold=0;assert.equal(order(s,9,'join'),false);
});
test('tolls, guards and exhausted orders',()=>{
 const s=fresh();order(s,11,'toll');assert.equal(s.gold,11);order(s,11,'guard');assert.equal(s.walls[11],2);
 assert.equal(order(s,11,'toll'),false);advance(s);assert.equal(s.ap,2);assert.equal(s.turn,2);
});
test('a legal campaign reaches Sardis and ends',()=>{
 const s=fresh();
 for(const i of [7,6,3,1,0]){
  if(!s.ap)advance(s);
  if(s.gold<4&&s.owners[i]===2){order(s,11,'toll');if(!s.ap)advance(s)}
  assert.equal(order(s,i,'join'),true,'claim '+i);
 }
 assert.ok(linked(s).has(0));assert.equal(s.result,'win');const gold=s.gold;advance(s);assert.equal(s.gold,gold);
});
test('passive campaign terminates and save data survives round trip',()=>{
 const s=fresh();for(let i=0;i<18;i++)advance(s);assert.equal(s.result,'loss');
 assert.ok(valid(JSON.parse(JSON.stringify(s))));assert.equal(valid({...s,owners:[]}),false);assert.equal(valid(null),false);
});

import {forecast,income,itinerary,modes,nearby,cost,legal} from '../public/rules.mjs';
test('v1 saves resume and acquire a chronicle on the next action',()=>{
 const s=fresh();delete s.mode;delete s.history;assert.ok(valid(s));order(s,7,'join');assert.equal(s.history[0].city,7);assert.ok(valid(s));
});
test('isolated garrisons cannot collect tolls',()=>{
 const s=fresh();s.owners[1]=1;assert.ok(!legal(s,1,'toll'));assert.ok(legal(s,11,'toll'));
});
test('cheapest itinerary uses roads and pays each unsigned treaty',()=>{
 const s=fresh();const r=itinerary(s);assert.equal(r.path[0],11);assert.equal(r.path.at(-1),0);
 assert.equal(r.gold,12);
 r.path.slice(1).forEach((i,k)=>assert.ok(nearby(r.path[k]).includes(i)));
 assert.equal(r.gold,r.path.reduce((v,i)=>v+(s.owners[i]===1?0:cost(s,i)),0));
});
test('siege attacks a connected garrison and its fort absorbs the attack',()=>{
 const s=fresh('siege');s.owners[9]=2;s.walls[11]=2;assert.equal(forecast(s),11);advance(s);
 assert.equal(s.walls[11],1);assert.equal(s.owners[11],1);assert.equal(s.history[0].event,'siege');
});
test('450 reproducible campaigns terminate with valid state at every step',()=>{
 for(const mode of modes)for(let seed=1;seed<=150;seed++){
  let n=seed;const random=()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);
  const s=fresh(mode);
  while(!s.result){
   const moves=[];for(let i=0;i<12;i++)for(const a of ['join','toll','guard'])if(legal(s,i,a))moves.push([i,a]);
   if(moves.length&&random()>.15){order(s,...moves[Math.floor(random()*moves.length)])}else advance(s);
   assert.ok(valid(s));assert.ok(s.turn<=15);
  }
 }
 assert.ok(income(fresh('scout'))>income(fresh()));
});

import {commission,decide,freightRoute} from '../public/rules.mjs';
import {storyClips} from '../public/stories.mjs';
test('mill contract raises one fort level and pays the smaller fee just once',()=>{
 const s=fresh();assert.ok(commission(s,0));assert.equal(s.ap,1);
 assert.equal(commission(s,1),false);assert.ok(decide(s,0));assert.equal(s.walls[11],2);assert.equal(decide(s,1),false);
 advance(s);assert.deepEqual(s.deliveries,[0]);assert.equal(s.gold,8+income(s)+3);
 assert.equal(commission(s,0),false);assert.ok(valid(JSON.parse(JSON.stringify(s))));
});
test('a closed route holds cargo until the owner opens a road; mounted courier crosses two legs',()=>{
 const s=fresh();commission(s,1);decide(s,0);assert.equal(s.gold,6);advance(s);
 assert.equal(s.freight.city,11);assert.ok(order(s,7,'join'));assert.deepEqual(freightRoute(s,11,7),[11,10,7]);
 advance(s);assert.deepEqual(s.deliveries,[1]);assert.ok(valid(s));
});
test('cash shortage leaves the choice open, a free ferry waits, captured freight is lost',()=>{
 const s=fresh();commission(s,2);s.gold=1;assert.ok(!decide(s,0));assert.equal(s.freight.choice,null);decide(s,1);
 advance(s);assert.equal(s.freight.delay,0);assert.equal(s.freight.city,11);
 s.freight.city=1;s.owners[1]=2;advance(s);assert.equal(s.freight,undefined);
 assert.ok(s.history.some(e=>e.event==='lost'));assert.deepEqual(s.deliveries??[],[]);
});
test('commission and story input validation; every performance has bilingual copy',()=>{
 const s=fresh();s.ap=0;assert.equal(commission(s,1),false);s.result='loss';s.ap=2;assert.equal(commission(s,0),false);
 assert.ok(!valid({...fresh(),freight:{}}));assert.ok(!valid({...fresh(),deliveries:[0,0]}));
 const clips=storyClips();assert.equal(clips.length,21);assert.equal(new Set(clips.map(c=>c.id)).size,21);
 for(const clip of clips)assert.ok(clip.text.every(Boolean));
});

import {dispatch,deadlineText,lines} from '../public/rules.mjs';
test('legacy expired saves get the deadline line; losing Susa on the last turn reports its capture',()=>{
 const expired={...fresh(),turn:15,result:'loss',last:'loss'};assert.ok(valid(expired));assert.deepEqual(dispatch(expired),{id:'deadline',text:deadlineText});
 expired.owners[11]=2;assert.deepEqual(dispatch(expired),{id:'loss',text:lines.loss});
 assert.ok(!valid({...fresh(),last:['start']}));
});
test('all six contract responses survive reload and pay exactly once',()=>{
 for(let id=0;id<3;id++)for(let choice=0;choice<2;choice++){
  let s=fresh();s.owners.fill(1);s.owners[0]=0;assert.ok(commission(s,id));assert.ok(decide(s,choice));
  s=JSON.parse(JSON.stringify(s));assert.ok(valid(s));assert.equal(s.freight.choice,choice);
  let roadIncome=0;const before=s.gold;
  for(let n=0;n<10&&s.freight;n++){roadIncome+=income(s);advance(s)}
  assert.deepEqual(s.deliveries,[id]);assert.equal(s.gold-before-roadIncome,[choice===0?3:5,8,11][id]);
  assert.equal(commission(s,id),false);assert.ok(valid(s));
 }
});
