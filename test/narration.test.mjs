import test from 'node:test';
import assert from 'node:assert/strict';
import {createNarrator} from '../public/narration.mjs';
function setup(){
 const clips=[],utterances=[],notices=[];
 class Audio{
  constructor(url){this.url=url;clips.push(this)}
  play(){return new Promise((resolve,reject)=>{this.reject=reject})}
  pause(){this.paused=true}
 }
 class Utterance{constructor(text){this.text=text}}
 const env={Audio,SpeechSynthesisUtterance:Utterance,speechSynthesis:{
  getVoices:()=>[{lang:'fa_IR'},{lang:'en-US'}],
  speak:u=>utterances.push(u),cancel:()=>{}
 }};
 const narrator=createNarrator(env,'fa',message=>notices.push(message));
 const line={scope:'city',text:['شوش','Susa'],file:l=>l+'-susa.mp3'};
 return {clips,utterances,notices,env,narrator,line};
}
test('switching language keeps the same active line; idle, muted and ended tracks stay silent',()=>{
 const {clips,narrator,line}=setup();
 narrator.setLanguage('en');assert.equal(clips.length,0);
 narrator.play(line);narrator.setLanguage('fa');assert.deepEqual(clips.map(c=>c.url),['en-susa.mp3','fa-susa.mp3']);assert.ok(clips[0].paused);
 clips[0].onended();narrator.setLanguage('en');assert.equal(clips.length,3);
 clips[2].onended();narrator.setLanguage('fa');assert.equal(clips.length,3);
 narrator.play(line);narrator.setLanguage('off');narrator.play(line);assert.equal(clips.length,4);
});
test('rejected starts and late errors cannot resurrect narration after leaving a city',async()=>{
 const {clips,narrator,utterances,line}=setup();narrator.play(line);narrator.leaveCity();
 clips[0].onerror();clips[0].reject(new Error('interrupted'));await Promise.resolve();assert.equal(utterances.length,0);
 narrator.play({...line,scope:'contract'});narrator.leaveCity();assert.ok(!clips[1].paused);
});
test('media failure falls back once in the selected language and respects mute',async()=>{
 const {clips,narrator,utterances,line}=setup();narrator.play(line);clips[0].onerror();
 clips[0].reject(new Error('decode'));await Promise.resolve();
 assert.equal(utterances.length,1);assert.equal(utterances[0].lang,'fa_IR');assert.equal(utterances[0].text,'شوش');
 narrator.setLanguage('off');utterances[0].onerror();assert.equal(utterances.length,1);
});
test('missing or failed device voices leave a bilingual playback error',()=>{
 const {notices,env,narrator,line}=setup();env.speechSynthesis.getVoices=()=>[];
 narrator.play({...line,file:()=>null});assert.match(notices.at(-1),/Audio unavailable/);
});
