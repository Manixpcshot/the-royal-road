import {cities,lines,fresh,legal,order,advance,linked,cost,valid,income,itinerary,forecast,nearby} from './rules.mjs';
import {draw} from './atlas.mjs';
const $=id=>document.getElementById(id), key='royal-road/1'+location.pathname;
let planned=false,undoState=null;
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
const events={join:'پیمان / Treaty',guard:'تقویت / Fortified',toll:'عوارض / Toll',siege:'آسیب دژ / Fort damaged',capture:'تصرف رقیب / Rival claimed'};
const cityName=i=>cities[i][1]+' / '+cities[i][0];
function render(){
 const route=itinerary(s);
 draw($('atlas'),s,selected,planned?route.path:[]);
 $('plan').setAttribute('aria-pressed',planned);
 $('estimate').textContent=planned?'هزینهٔ فعلی پیمان‌ها / Current treaty cost · '+route.gold:'';
 const target=forecast(s);
 $('forecast').textContent=target===undefined?'—':cityName(target);
 $('income').textContent='+'+income(s)+' سکه / gold';
 $('undo').disabled=!undoState||!!s.result;
 $('history').replaceChildren(...(s.history||[]).slice().reverse().map(entry=>{
  const row=document.createElement('li');
  row.textContent=entry.turn+' · '+events[entry.event]+' · '+cityName(entry.city);return row;
 }));
 if(!$('history').children.length)$('history').textContent='هنوز رویدادی ثبت نشده / No entries yet';
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
 $('orders').replaceChildren(...actions.map(([id,fa,en])=>{const b=document.createElement('button');b.innerHTML=fa+' <em>'+en+'</em>';b.disabled=!legal(s,selected,id);b.onclick=()=>{const snapshot=JSON.stringify(s);if(order(s,selected,id)){undoState=snapshot;after()}};return b}));
 let hint='';
 if(!s.result){
  if(!s.ap)hint='فرمان‌ها تمام شد / End your turn';
  else if(s.owners[selected]!==1){
   if(!nearby(selected).some(i=>linked(s).has(i)))hint='از شهر متصل پیشروی کن / Reach from your supply line';
   else if(s.gold<cost(s,selected))hint='سکه کافی نیست / Collect tolls first';
  }else if(!linked(s).has(selected))hint='راه شوش قطع است / Reconnect to collect tolls';
 }
 $('hint').textContent=hint;
 $('next').disabled=!!s.result;$('dialogue').innerHTML=lines[s.last][0]+'<span>'+lines[s.last][1]+'</span>';
 $('saved').textContent=storageOK?'ذخیرهٔ خودکار / Autosave':'ذخیره در دسترس نیست / Save unavailable';
}
function after(){save();render();speak();if(s.result)endScreen()}
function modal(html){$('modalBody').innerHTML=html;if(!$('modal').open)$('modal').showModal()}
function endScreen(){
 const outcome=s.result==='loss'&&s.owners[11]===1?'مهلت ۱۴ نوبت تمام شد. / The 14-turn deadline passed.':lines[s.result].join('<br>');
 modal('<h2>'+(s.result==='win'?'شاهراه متحد شد / Victory':'پایان لشکرکشی / Defeat')+'</h2><p>'+outcome+'</p>')}
$('plan').onclick=()=>{planned=!planned;render()};
$('undo').onclick=()=>{if(!undoState||s.result)return;stop();s=JSON.parse(undoState);undoState=null;save();render()};
$('next').onclick=()=>{undoState=null;advance(s);after()};
$('voice').onclick=speak;$('lang').value=voice;$('lang').onchange=e=>{voice=e.target.value;try{localStorage.setItem(key+'/voice',voice)}catch{}speak()};
$('close').onclick=()=>$('modal').close();
$('restart').onclick=()=>{modal('<h2>لشکرکشی تازه؟ / New campaign?</h2><p>ذخیرهٔ این لشکرکشی جایگزین می‌شود.<br>Your current campaign save will be replaced.</p><label>درجهٔ سختی / Difficulty <select id="difficulty"><option value="scout">دیده‌بان / Scout</option><option selected value="classic">کلاسیک / Classic</option><option value="siege">محاصره / Siege</option></select></label><button id="confirm">شروع / Start</button>');$('confirm').onclick=()=>{$('modal').close();s=fresh($('difficulty').value);undoState=null;planned=false;selected=11;after();scroller.scrollLeft=scroller.scrollWidth}};
$('help').onclick=()=>modal('<h2>راهنمای شاهراه <i>Field guide</i></h2><p dir="rtl">پیش از پایان نوبت ۱۴، شوش را از راه شهرهای خودت به سارد وصل کن. از دست رفتن شوش به معنی شکست است. نقشه و رقابت این بازی خیالی و الهام‌گرفته از ایران هخامنشی است.</p><p>Connect Susa to Sardis through your cities by turn 14. Losing Susa ends the campaign. This fictional contest is inspired by Achaemenid Persia.</p><p dir="rtl">هر نوبت دو فرمان داری. از شهر متصل به پایتخت پیمان ببند، عوارض بگیر یا دژ بساز. رقیب پس از پایان نوبت یک شهر مرزی را تصرف می‌کند یا یک سطح از دژ آن می‌کاهد. سپس درآمد راه به خزانه می‌رسد.</p><p>Spend two orders per turn. Claim a neighbour of your connected network, collect tolls or fortify a city. Each turn the rival expands or weakens a frontier fort. Road income follows.</p><p dir="rtl">دیده‌بان با خزانه و درآمد بیشتر شروع می‌کند. در محاصره، رقیب به شهرهای متصل حمله می‌کند. دیدبانی هدف حرکت بعدی او را با وضعیت فعلی نقشه نشان می‌دهد.</p><p>Scout grants extra gold and income. In Siege the rival prioritises your supply line. Lookout predicts the next target on the current board.</p>');
render();if(s.result)endScreen();
const scroller=document.querySelector('.scroll');scroller.scrollLeft=scroller.scrollWidth;
