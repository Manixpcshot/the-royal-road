import {cities,dispatch,fresh,legal,order,advance,linked,cost,valid,income,itinerary,forecast,nearby} from './rules.mjs';
import {renderCaravan} from './caravan-ui.mjs';
import {receipts} from './stories.mjs';
import {recorded} from './performance.mjs';
import {createNarrator} from './narration.mjs';
import {draw,loadLandmarks} from './atlas.mjs';
const $=id=>document.getElementById(id);
const key='royal-road/1'+location.pathname.replace(/\/index\.html$/,'/');
let territories=true,zoom=1;
let planned=false,undoState=null,s=fresh(),selected=11,storageOK=true,voice='fa';
try{
 for(const candidate of [key,key+'index.html']){
  const raw=localStorage.getItem(candidate);
  if(!raw)continue;
  try{
   const data=JSON.parse(raw);
   const campaign=data?.campaign??data;
   if(!valid(campaign))continue;
   s=campaign;
   const undo=data.undo;
   if(!s.result&&valid(undo)&&!undo.result&&undo.turn===s.turn&&undo.mode===s.mode)undoState=undo;
   break;
  }catch{}
 }
 try{
  const view=JSON.parse(localStorage.getItem(key+'/map'));
  if(Number.isInteger(view?.selected)&&view.selected>=0&&view.selected<cities.length)selected=view.selected;
  planned=view?.planned===true;
  territories=view?.territories!==false;
  if([1,1.25,1.5,1.75,2].includes(view?.zoom))zoom=view.zoom;
 }catch{}
 const savedVoice=localStorage.getItem(key+'/voice')??localStorage.getItem(key+'index.html/voice');
 if(['en','fa','off'].includes(savedVoice))voice=savedVoice;
}catch{storageOK=false}
const narrator=createNarrator(window,voice,message=>{$('audioStatus').textContent=message});
const fa=n=>n.toLocaleString('fa-IR');
const owners=['آزاد / Free','پارس / Persia','رقیب / Rival'];
function save(){
 try{
  localStorage.setItem(key,JSON.stringify({campaign:s,undo:s.result?null:undoState}));
  storageOK=true;
 }catch{storageOK=false}
}
function saveMap(){
 try{localStorage.setItem(key+'/map',JSON.stringify({selected,planned,territories,zoom}))}catch{}
}
function showSelectedCity(){
 const scroller=document.querySelector('.scroll');
 const pin=$('pins').children[selected].getBoundingClientRect();
 scroller.scrollTop+=pin.top+pin.height/2-scroller.getBoundingClientRect().top-scroller.clientHeight/2;
 scroller.scrollLeft+=pin.left+pin.width/2-scroller.getBoundingClientRect().left-scroller.clientWidth/2;
}
function speak(){
 const {id,text}=dispatch(s);
 narrator.play({text,scope:'dispatch',file:lang=>{
  if(id==='deadline'&&!recorded)return null;
  return './audio/'+(lang==='fa'?'fa-':'')+id+'.mp3';
 }});
}
const events={commission:'بارگیری / Commissioned',travel:'عبور کاروان / In transit',lost:'بار از دست رفت / Cargo lost',delivery:'تحویل بار / Delivered',join:'پیمان / Treaty',guard:'تقویت / Fortified',toll:'عوارض / Toll',siege:'آسیب دژ / Fort damaged',capture:'تصرف رقیب / Rival claimed'};
const cityName=i=>cities[i][1]+' / '+cities[i][0];
function trade(action){
 const prior=structuredClone(s);
 if(!action())return false;
 undoState=prior;narrator.stop();save();render();return true;
}
function playStory(id,words){
 narrator.play({text:words,scope:id.startsWith('street-')?'city':'contract',
  file:lang=>recorded?'./audio/story/'+lang+'-'+id+'.mp3':null});
}
function render(){
 renderCaravan(s,selected,trade,playStory);
 const shipment=(s.history||[]).findLast(e=>['commission','delivery','lost','travel'].includes(e.event));
 $('freightReport').textContent=shipment?'نوبت / Turn '+shipment.turn+' · '+events[shipment.event]+' · '+cityName(shipment.city):'';
 const route=itinerary(s);
 draw($('atlas'),s,selected,planned?route.path:[],territories);
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
  const b=document.createElement('button');b.className='pin';b.dataset.owner=s.owners[i];b.style.left=x/10.4+'%';b.style.top=(y+5)/5.7+'%';b.innerHTML=['○','◆','▲'][s.owners[i]]+' '+fa+'<span>'+en+'</span>';b.setAttribute('aria-pressed',i===selected);
  b.onclick=()=>{if(selected!==i)narrator.leaveCity();selected=i;openZone('council');saveMap();render();$('pins').children[i].focus({preventScroll:true})};return b;
 }));
 const [en,name]=cities[selected];$('city').innerHTML=name+' <i>'+en+'</i>';
 $('detail').textContent=owners[s.owners[selected]]+' · دژ / Fort '+s.walls[selected]+'/3';
 const actions=s.owners[selected]===1?[['toll','عوارض +۳','Collect +3'],['guard','تقویت دژ −۲','Fortify −2']]:[['join','پیمان −'+fa(cost(s,selected)),'Claim −'+cost(s,selected)]];
 $('orders').replaceChildren(...actions.map(([id,fa,en])=>{
  const b=document.createElement('button');
  b.id='order-'+id;b.innerHTML=fa+' <em>'+en+'</em>';b.disabled=!legal(s,selected,id);
  b.onclick=()=>{
   const before=structuredClone(s);
   if(!order(s,selected,id))return;
   undoState=before;after();
   if(!s.result){
    const nextFocus=$('orders').querySelector('#order-'+id+':enabled')
     ||$('orders').querySelector('button:enabled')||$('undo');
    nextFocus.focus({preventScroll:true});
   }
  };
  return b;
 }));
 let hint='';
 if(!s.result){
  if(!s.ap)hint='فرمان‌ها تمام شد / End your turn';
  else if(s.owners[selected]!==1){
   if(!nearby(selected).some(i=>linked(s).has(i)))hint='از شهر متصل پیشروی کن / Reach from your supply line';
   else if(s.gold<cost(s,selected))hint='سکه کافی نیست / Collect tolls first';
  }else if(!linked(s).has(selected))hint='راه شوش قطع است / Reconnect to collect tolls';
 }
 $('hint').textContent=hint;
 $('next').disabled=!!s.result;$('dialogue').innerHTML=dispatch(s).text[0]+'<span lang="en">'+dispatch(s).text[1]+'</span>';
 $('saved').textContent=storageOK?'ذخیرهٔ خودکار / Autosave':'ذخیره در دسترس نیست / Save unavailable';
}
function after(){save();render();speak();if(s.result)endScreen()}
function modal(html,scene){
 $('modalBody').innerHTML=html;
 if(scene){const art=document.createElement('img');art.className='story-scene';art.alt='';art.src='./art/scene/'+scene+'.webp';$('modalBody').prepend(art)}
 if(!$('modal').open)$('modal').showModal()}
function endScreen(){
 const outcome=dispatch(s).text.join('<br>');
 const loads=s.deliveries||[];
 const cargo=loads.length?loads.map(id=>'<p dir="rtl">'+receipts[id][0]+'</p><p lang="en">'+receipts[id][1]+'</p>').join(''):'';
 const unfinished=s.freight?'<p>دفتر کاروان با یک محموله در راه بسته شد.<br>The ledger closed with a shipment still on the road.</p>':'';
 modal('<h2>'+(s.result==='win'?'شاهراه متحد شد / Victory':'پایان لشکرکشی / Defeat')+'</h2><p>'+outcome+'</p>'+cargo+unfinished,s.result==='win'?'victory':'defeat')}
$('plan').onclick=()=>{planned=!planned;saveMap();render()};
$('undo').onclick=()=>{
 if(!undoState||s.result)return;
 const previousFreight=s.freight;
 narrator.stop();s=undoState;undoState=null;save();render();
 const returnedContract=previousFreight&&!s.freight?$('load-'+previousFreight.id):null;
 const pendingReply=s.freight?.choice===null&&previousFreight?.choice!==null?$('hearStory'):null;
 const target=returnedContract||pendingReply||$('orders').querySelector('button:enabled')||$('next');
 if(returnedContract||pendingReply)openZone('cargo');
 target.focus({preventScroll:true});
};
$('next').onclick=()=>{undoState=null;advance(s);after()};
$('voice').onclick=speak;$('lang').value=voice;$('lang').onchange=e=>{voice=e.target.value;try{localStorage.setItem(key+'/voice',voice)}catch{}narrator.setLanguage(voice)};
$('close').onclick=()=>$('modal').close();
$('restart').onclick=()=>{modal('<h2>لشکرکشی تازه؟ / New campaign?</h2><p>ذخیرهٔ این لشکرکشی جایگزین می‌شود.<br>Your current campaign save will be replaced.</p><label>درجهٔ سختی / Difficulty <select id="difficulty"><option value="scout">دیده‌بان / Scout</option><option selected value="classic">کلاسیک / Classic</option><option value="siege">محاصره / Siege</option></select></label><button id="confirm">شروع / Start</button>');$('confirm').onclick=()=>{$('modal').close();s=fresh($('difficulty').value);undoState=null;planned=false;selected=11;openZone('council');saveMap();after();showSelectedCity()}};
$('help').onclick=()=>modal('<h2>راهنمای شاهراه <i>Field guide</i></h2><p dir="rtl">پیش از پایان نوبت ۱۴، شوش را از راه شهرهای خودت به سارد وصل کن. از دست رفتن شوش به معنی شکست است. نقشه و رقابت این بازی خیالی و الهام‌گرفته از ایران هخامنشی است.</p><p>Connect Susa to Sardis through your cities by turn 14. Losing Susa ends the campaign. This fictional contest is inspired by Achaemenid Persia.</p><p dir="rtl">هر نوبت دو فرمان داری. از شهر متصل به پایتخت پیمان ببند، عوارض بگیر یا دژ بساز. رقیب پس از پایان نوبت یک شهر مرزی را تصرف می‌کند یا یک سطح از دژ آن می‌کاهد. سپس درآمد راه به خزانه می‌رسد.</p><p>Spend two orders per turn. Claim a neighbour of your connected network, collect tolls or fortify a city. Each turn the rival expands or weakens a frontier fort. Road income follows.</p><p dir="rtl">دیده‌بان با خزانه و درآمد بیشتر شروع می‌کند. در محاصره، رقیب به شهرهای متصل حمله می‌کند. دیدبانی هدف حرکت بعدی او را با وضعیت فعلی نقشه نشان می‌دهد.</p><p>Scout grants extra gold and income. In Siege the rival prioritises your supply line. Lookout predicts the next target on the current board.</p><p dir="rtl">هر قرارداد یک فرمان می‌خواهد. در کاروان‌سرا به صاحب بار پاسخ بده. در پایان هر نوبت، پس از حرکت رقیب، کاروان از راه شهرهای خودی پیش می‌رود. قطع راه کاروان را متوقف می‌کند؛ تصرف محل استقرارش بار را از بین می‌برد. هر قرارداد یک بار دستمزد می‌دهد.</p><p>Accepting freight uses one order. Answer the speaker to send the load. After each rival move, freight travels through friendly cities. A broken route stalls it. Capture of its current stop loses the cargo. Each contract pays once.</p>','guide');
window.addEventListener('pagehide',()=>narrator.stop());
function applyMapScale(){
 $('board').style.setProperty('--map-scale',zoom);
 $('zoomValue').textContent=Math.round(zoom*100)+'%';
 $('zoomOut').disabled=zoom<=1;$('zoomIn').disabled=zoom>=2;
}
function changeZoom(step){
 zoom=Math.max(1,Math.min(2,zoom+step));
 applyMapScale();showSelectedCity();saveMap();
}
$('zoomIn').onclick=()=>changeZoom(.25);
$('zoomOut').onclick=()=>changeZoom(-.25);
$('territories').setAttribute('aria-pressed',territories);
$('territories').onclick=()=>{
 territories=!territories;
 $('territories').setAttribute('aria-pressed',territories);
 draw($('atlas'),s,selected,planned?itinerary(s).path:[],territories);saveMap();
};
applyMapScale();
render();if(s.result)endScreen();
loadLandmarks().then(()=>draw($('atlas'),s,selected,planned?itinerary(s).path:[],territories));
showSelectedCity();

const layout=document.querySelector('.layout'),panels=$('panels'),fold=$('fold');
function setPanelOpen(open){
 layout.classList.toggle('folded',!open);
 fold.setAttribute('aria-expanded',String(open));
 fold.setAttribute('aria-label',open?'بستن پنل / Collapse panel':'باز کردن پنل / Expand panel');
}
fold.onclick=()=>setPanelOpen(layout.classList.contains('folded'));
function openZone(zone){
 setPanelOpen(true);
 panels.dataset.active=zone;
 for(const button of document.querySelectorAll('[data-zone]')){
  button.setAttribute('aria-pressed',String(button.dataset.zone===zone));
 }
 panels.scrollTop=0;
}
document.querySelectorAll('[data-zone]').forEach(button=>{
 button.onclick=()=>openZone(button.dataset.zone);
});
openZone(s.freight?'cargo':'council');
const screenButton=$('screen');
function syncFullscreen(){
 const active=Boolean(document.fullscreenElement||document.webkitFullscreenElement||document.body.classList.contains('focus-view'));
 screenButton.setAttribute('aria-pressed',String(active));
 screenButton.innerHTML=active?'⛶ خروج <small>Exit fullscreen</small>':'⛶ تمام‌صفحه <small>Fullscreen</small>';
}

screenButton.onclick=async()=>{
 if(document.body.classList.contains('focus-view')){document.body.classList.remove('focus-view');syncFullscreen();return}
 try{
  if(document.fullscreenElement||document.webkitFullscreenElement)
   await (document.exitFullscreen||document.webkitExitFullscreen).call(document);
  else{
   const root=document.documentElement;
   await (root.requestFullscreen||root.webkitRequestFullscreen).call(root);
  }
 }catch{document.body.classList.add('focus-view');syncFullscreen()}
};
document.addEventListener('fullscreenchange',syncFullscreen);
document.addEventListener('webkitfullscreenchange',syncFullscreen);
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&document.body.classList.contains('focus-view')&&!$('modal').open){
  document.body.classList.remove('focus-view');syncFullscreen();
 }
});
