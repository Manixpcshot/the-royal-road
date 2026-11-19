// A request owns both its recording and its optional device-voice fallback.
// Late events from a paused recording must never start another utterance.
export function createNarrator(env,initialLanguage,notify){
 let language=initialLanguage,current=null;
 function stop(){
  const previous=current;
  current=null;
  previous?.audio?.pause();
  if(previous?.utterance)env.speechSynthesis?.cancel();
  notify('');
 }
 function play(line){
  stop();
  if(language==='off')return;
  const request={line};
  current=request;
  const complete=()=>{if(current===request)current=null};
  const fail=()=>{
   if(current!==request)return;
   complete();notify('پخش صدا در دسترس نیست / Audio unavailable');
  };
  function useDevice(){
   if(current!==request||request.utterance)return;
   const synth=env.speechSynthesis;
   const voice=synth?.getVoices().find(v=>v.lang.toLowerCase().split(/[-_]/)[0]===language);
   if(!voice||!env.SpeechSynthesisUtterance){fail();return}
   const utterance=new env.SpeechSynthesisUtterance(line.text[language==='fa'?0:1]);
   request.utterance=utterance;utterance.voice=voice;utterance.lang=voice.lang;
   utterance.onend=complete;utterance.onerror=fail;
   try{synth.speak(utterance)}catch{fail()}
  }
  const path=line.file(language);
  if(!path){useDevice();return}
  const clip=new env.Audio(path);request.audio=clip;
  clip.onended=complete;clip.onerror=useDevice;
  clip.play().catch(useDevice);
 }
 function setLanguage(next){
  const line=current?.line;
  stop();language=next;
  if(line&&next!=='off')play(line);
 }
 function leaveCity(){
  if(current?.line.scope==='city')stop();
 }
 return {play,stop,setLanguage,leaveCity};
}
