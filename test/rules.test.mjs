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
