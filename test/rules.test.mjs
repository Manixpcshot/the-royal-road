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
