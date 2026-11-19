import {mkdirSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {storyClips} from '../public/stories.mjs';
const dir=new URL('../public/audio/story/',import.meta.url);
const temp=mkdtempSync(join(tmpdir(),'royal-road-voice-'));
const actors={rota:['rms',42,151],ard:['awb',63,175],mina:['slt',59,148],dara:['rms',33,133]};
mkdirSync(dir,{recursive:true});
try{
 for(const {id,role,text} of storyClips()){
  const [voice,pitch,speed]=actors[role];
  for(const lang of ['fa','en']){
   const wave=join(temp,'line.wav');
   if(lang==='fa'){
    execFileSync('espeak-ng',['-v','fa','-s',String(speed),'-p',String(pitch),'-w',wave,text[0]]);
   }else{
    const script=join(temp,'line.txt');writeFileSync(script,text[1]);
    execFileSync('ffmpeg',['-nostdin','-v','error','-y','-f','lavfi','-i','flite=textfile='+script+':voice='+voice,wave]);
   }
   const out=new URL(lang+'-'+id+'.mp3',dir).pathname;
   execFileSync('ffmpeg',['-nostdin','-v','error','-y','-i',wave,'-af','loudnorm=I=-17:LRA=8:TP=-2','-ar','24000','-b:a','48k',out]);
   execFileSync('ffmpeg',['-nostdin','-v','error','-i',out,'-f','null','-']);
  }
 }
 writeFileSync(new URL('../public/performance.mjs',import.meta.url),'export const recorded = true;\n');
}finally{rmSync(temp,{recursive:true,force:true})}
