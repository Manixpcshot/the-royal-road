import {cities,commission,decide,freightRoute,forecast,linked} from './rules.mjs';
import {contracts,streets,voices,residents,receipts} from './stories.mjs';
import {paintStreet} from './streetscape.mjs';

const el=id=>document.getElementById(id);
const cityName=i=>cities[i][1]+' / '+cities[i][0];
function bilingual(pair){
 const box=document.createElement('div'),fa=document.createElement('div'),en=document.createElement('div');
 fa.lang='fa';fa.dir='rtl';fa.textContent=pair[0];en.lang='en';en.className='translation';en.textContent=pair[1];box.append(fa,en);return box;
}
function button(label,run,id){
 const b=document.createElement('button');b.id=id;b.append(bilingual(label));b.onclick=run;return b;
}
export function renderCaravan(s,selected,commit,play){
 const [,, , ,kind]=cities[selected];
 paintStreet(el('streetArt'),selected,kind,s.turn,s.owners[selected],s.walls[selected],s.freight?.city===selected);
 el('streetName').textContent=cityName(selected);
 const detail=el('streetText');detail.replaceChildren(bilingual(streets[selected]));
 let local;
 if(s.freight?.city===selected)local=['زنگوله‌های این کاروان را از میدان می‌شنوی.','Your caravan bells carry across the square.'];
 else if(forecast(s)===selected)local=['دیده‌بان چراغ برج را دو بار پوشاند؛ رقیب به سوی این شهر می‌آید.','The lookout covers the lamp twice. The rival is heading here.'];
 else if(s.owners[selected]===1&&!linked(s).has(selected))local=['جای پیک شوش کنار آتش خالی مانده است.','The seat by the fire reserved for the Susa courier is empty.'];
 if(local)detail.append(bilingual(local));
 detail.append(button(['شنیدن روایت '+voices[residents[selected]][0],'Listen · '+voices[residents[selected]][1]],()=>play('street-'+selected,streets[selected]),'hearCity'));
 const body=el('freightBody'),f=s.freight;body.replaceChildren();
 const delivered=s.deliveries||[];
 el('ledger').textContent='تحویل‌ها / Delivered · '+delivered.length+' / '+contracts.length;
 if(!f){
  for(const [id,c] of contracts.entries()){
   const done=delivered.includes(id),card=document.createElement('section');
   card.append(bilingual(c.title));
   const fee=id===0?'3–5':String(c.fee);
   card.append(bilingual(done?[cities[c.to][1],cities[c.to][0]]:[cities[c.to][1]+' · دستمزد '+fee+' سکه',cities[c.to][0]+' · Fee '+fee+' gold']));
   const b=button(done?['تحویل شد','Delivered']:['قبول بار · ۱ فرمان','Accept · 1 order'],()=>commit(()=>commission(s,id)),'load-'+id);
   b.disabled=!!s.result||!s.ap||done;card.append(b);if(done)card.append(bilingual(receipts[id]));body.append(card);
  }
  return;
 }
 const c=contracts[f.id],pending=f.choice===null,role=pending?c.speaker:c.answer[f.choice];
 const row=document.createElement('section');row.className='conversation';row.append(bilingual(c.title));
 const speaker=document.createElement('small');speaker.textContent=voices[role].join(' / ');row.append(speaker);
 const words=pending?c.opening:c.replies[f.choice];
 row.append(bilingual(words),button(['شنیدن دیالوگ','Hear dialogue'],()=>play(pending?'scene-'+f.id:'reply-'+f.id+'-'+f.choice,words),'hearStory'));
 const actions=document.createElement('div');actions.className='choices';
 if(s.result){actions.append(bilingual(['لشکرکشی پایان یافت؛ این بار تحویل نشد.','Campaign ended with this cargo undelivered.']))}
 else if(pending){
  for(const [j,option] of c.options.entries()){
   const b=button(option,()=>{if(commit(()=>decide(s,j)))play('reply-'+f.id+'-'+j,c.replies[j])},'choice-'+j);
   const capped=f.id===0&&j===0&&s.walls[11]===3;
   b.append(bilingual(capped?['دژ شوش در بالاترین سطح است؛ پاداش تحویل ۳ سکه','Susa fort already at maximum; delivery pays 3']:c.effects[j]));b.disabled=!!s.result||(f.id!==0&&j===0&&s.gold<2);actions.append(b);
  }
 }else{
  const path=freightRoute(s,f.city,c.to);
  const pace=f.id===1&&f.choice===0?2:1;
  const eta=f.delay+Math.ceil((path.length-1)/pace);
  const status=path.length?['با وضعیت فعلی راه، '+eta+' نوبت تا تحویل','At current road conditions, '+eta+' turn(s) to delivery']:['راه بسته است؛ شهرهای مسیر را با پیمان به هم وصل کن.','Road closed. Secure a connected chain of friendly cities.'];
  actions.append(bilingual(status));
 }
 row.append(actions);
 const locate=button(['یافتن کاروان روی نقشه','Locate on map'],()=>{
  const pin=el('pins').children[f.city];pin.click();el('pins').children[f.city].scrollIntoView({block:'center',inline:'center'});
 },'locateCaravan');row.append(locate);
 const location=document.createElement('p');location.textContent=cityName(f.city)+' → '+cityName(c.to);row.append(location);
 body.append(row);
}
