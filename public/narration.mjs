// A request owns both its recording and its optional device-voice fallback.
// Late events from a paused recording must never start another utterance.
export function createNarrator(env,initialLanguage,notify){
 let language=initialLanguage,current=null,media=null,selectedLine=null;
 function releaseMedia(){
  if(!media)return;
  media.onended=null;media.onerror=null;
  media.pause();
  media.removeAttribute('src');
  media.load();
 }
 function stop(){
  const previous=current;
  current=null;selectedLine=null;
  releaseMedia();
  if(previous?.utterance)env.speechSynthesis?.cancel();
  notify('');
 }
 function play(line){
  stop();
  if(language==='off')return;
  selectedLine=line;
  const request={line};
  current=request;
  const complete=()=>{if(current===request)current=null};
  const fail=()=>{
   if(current!==request)return;
   complete();notify('پخش صدا در دسترس نیست / Audio unavailable');
  };
  function useDevice(){
   if(current!==request||request.utterance)return;
   releaseMedia();
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
  // Use a single transport so changing city or language cannot mix two voices.
  media??=new env.Audio();
  media.src=path;
  media.onended=()=>{if(media.ended)complete()};
  media.onerror=()=>{if(media.error)useDevice()};
  media.play().catch(useDevice);
 }
 function setLanguage(next){
  if(next===language)return;
  const line=selectedLine;
  stop();language=next;
  if(line&&next!=='off')play(line);
 }
 function leaveCity(){
  if(selectedLine?.scope==='city')stop();
 }
 return {play,stop,setLanguage,leaveCity};
}
