import {cities,lines,fresh,legal,order,advance,linked,cost,valid} from './rules.mjs';
import {draw} from './atlas.mjs';
const $=id=>document.getElementById(id), key='royal-road/1'+location.pathname;
let s=fresh(),selected=11,audio,storageOK=true,voice='fa';
try{const data=JSON.parse(localStorage.getItem(key));if(valid(data))s=data;voice=localStorage.getItem(key+'/voice')||'fa'}catch{}
const fa=n=>n.toLocaleString('fa-IR');
const owners=['آزاد / Free','پارس / Persia','رقیب / Rival'];
function save(){try{localStorage.setItem(key,JSON.stringify(s));storageOK=true}catch{storageOK=false}}
function stop(){audio?.pause();window.speechSynthesis?.cancel()}
function speak(){
 stop();if(voice==='off')return;
 if(voice==='fa'){
  const synth=window.speechSynthesis,v=synth?.getVoices().find(v=>/^fa\b/i.test(v.lang));
  if(v){const u=new SpeechSynthesisUtterance(lines[s.last][0]);u.voice=v;u.lang=v.lang;synth.speak(u);return}

 }
 audio=new Audio('./audio/'+(voice==='fa'?'fa-':'')+s.last+'.mp3');audio.play().catch(()=>{});
}
function render(){
 draw($('atlas'),s,selected);
 const stat=(a,b,n)=>'<div><small>'+a+' / '+b+'</small><b>'+n+'</b></div>';
 $('stats').innerHTML=stat('نوبت','Turn',Math.min(14,s.turn)+'/14')+stat('فرمان','Orders',s.ap+'/2')+stat('سکه','Gold',s.gold);
 $('route').textContent='شهرهای متصل / Linked  '+linked(s).size+' / 12';
 $('pins').replaceChildren(...cities.map(([en,fa,x,y],i)=>{
  const b=document.createElement('button');b.className='pin';b.style.left=x/10.4+'%';b.style.top=(y+5)/5.7+'%';b.innerHTML=['○','◆','▲'][s.owners[i]]+' '+fa+'<span>'+en+'</span>';b.setAttribute('aria-pressed',i===selected);
  b.onclick=()=>{selected=i;render();$('pins').children[i].focus({preventScroll:true})};return b;
 }));
 const [en,name]=cities[selected];$('city').innerHTML=name+' <i>'+en+'</i>';
 $('detail').textContent=owners[s.owners[selected]]+' · دژ / Fort '+s.walls[selected]+'/3';
 const actions=s.owners[selected]===1?[['toll','عوارض +۳','Collect +3'],['guard','تقویت دژ −۲','Fortify −2']]:[['join','پیمان −'+fa(cost(s,selected)),'Claim −'+cost(s,selected)]];
 $('orders').replaceChildren(...actions.map(([id,fa,en])=>{const b=document.createElement('button');b.innerHTML=fa+' <em>'+en+'</em>';b.disabled=!legal(s,selected,id);b.onclick=()=>{if(order(s,selected,id))after()};return b}));
 $('next').disabled=!!s.result;$('dialogue').innerHTML=lines[s.last][0]+'<span>'+lines[s.last][1]+'</span>';
 $('saved').textContent=storageOK?'ذخیرهٔ خودکار / Autosave':'ذخیره در دسترس نیست / Save unavailable';
}
function after(){save();render();speak();if(s.result)endScreen()}
function modal(html){$('modalBody').innerHTML=html;if(!$('modal').open)$('modal').showModal()}
function endScreen(){modal('<h2>'+(s.result==='win'?'شاهراه متحد شد / Victory':'پایان لشکرکشی / Defeat')+'</h2><p>'+lines[s.result][0]+'<br>'+lines[s.result][1]+'</p>')}
$('next').onclick=()=>{advance(s);after()};
$('voice').onclick=speak;$('lang').value=voice;$('lang').onchange=e=>{voice=e.target.value;try{localStorage.setItem(key+'/voice',voice)}catch{}speak()};
$('close').onclick=()=>$('modal').close();
$('restart').onclick=()=>{modal('<h2>لشکرکشی تازه؟ / New campaign?</h2><p>ذخیرهٔ این لشکرکشی جایگزین می‌شود.<br>Your current campaign save will be replaced.</p><button id="confirm">شروع / Start</button>');$('confirm').onclick=()=>{$('modal').close();s=fresh();selected=11;after()}};
$('help').onclick=()=>modal('<h2>راهنمای شاهراه <i>Field guide</i></h2><p dir="rtl">پیش از پایان نوبت ۱۴، شوش را از راه شهرهای خودت به سارد وصل کن. از دست رفتن شوش به معنی شکست است. نقشه و رقابت این بازی خیالی و الهام‌گرفته از ایران هخامنشی است.</p><p>Connect Susa to Sardis through your cities by turn 14. Losing Susa ends the campaign. This fictional contest is inspired by Achaemenid Persia.</p><p dir="rtl">هر نوبت دو فرمان داری. از شهر متصل به پایتخت پیمان ببند، عوارض بگیر یا دژ بساز. رقیب پس از پایان نوبت یک شهر مرزی را تصرف می‌کند یا یک سطح از دژ آن می‌کاهد. سپس درآمد راه به خزانه می‌رسد.</p><p>Spend two orders per turn. Claim a neighbour of your connected network, collect tolls or fortify a city. Each turn the rival expands or weakens a frontier fort. Road income follows.</p>');
render();if(s.result)endScreen();
const scroller=document.querySelector('.scroll');scroller.scrollLeft=scroller.scrollWidth;
