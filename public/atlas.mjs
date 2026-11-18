import {cities,roads} from './rules.mjs';
const colors=['#846e4a','#116d65','#923f33'];
// Polygon meshes in local XYZ coordinates. Back-to-front orthographic projection
// lets the map run on devices without WebGL.
function box(mesh,x,y,z,w,d,h,palette){
 const v=[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]];
 const top=v.map(([a,b,c])=>[a,b,c+h]);
 for(const [i,j,col] of [[1,2,1],[2,3,2]])mesh.push([[v[i],v[j],top[j],top[i]],palette[col]]);
 mesh.push([top,palette[0]]);
}
function cityModel(kind,flag,level){
 const m=[],stone=['#e7c790','#9b744e','#b48a5b'],light=['#f5dcac','#b28e66','#c5a079'];
 const block=(x,y,z,w,d,h,p=stone)=>box(m,x,y,z,w,d,h,p);
 block(-14,-11,0,28,22,3);
 if(kind==='tower'){
  for(let i=0;i<4;i++)block(-12+i*2.5,-10+i*2,3+i*4,24-5*i,20-4*i,4);
 }else if(kind==='palace'){
  block(-10,-8,3,21,16,3);
  for(const y of [-6,4])for(const x of [-8,-1,6])block(x,y,6,3,3,10,light);
  block(-11,-9,16,23,18,3);
 }else if(kind==='fort'){
  block(-10,-8,3,20,16,7);
  for(const y of [-8,4])for(const x of [-11,7])block(x,y,5,5,5,10,light);
 }else{
  for(const [x,y] of [[-10,-7],[2,-7],[-5,3]]){block(x,y,3,9,7,5);block(x-1,y-1,8,11,9,2,['#b56b4a','#824a36','#96553a'])}
 }
 if(level>1)block(8,6,0,5,5,level*5);
 block(0,0,17,1,1,11,['#6b553a','#614b30','#8d714b']);
 m.push([[[1,0,28],[12,0,26],[9,0,21],[1,0,23]],flag]);
 return m;
}
function polygon(c,points,fill,stroke){
 c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();
 if(stroke){c.strokeStyle=stroke;c.lineWidth=.65;c.stroke()}
}
function terrain(c){
 let seed=147;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const grad=c.createLinearGradient(0,0,900,570);grad.addColorStop(0,'#e0d1a3');grad.addColorStop(.5,'#e6cfa1');grad.addColorStop(1,'#cbb483');c.fillStyle=grad;c.fillRect(0,0,1040,570);
 const sea=[[0,372],[73,379],[107,403],[176,397],[200,422],[262,411],[305,424],[336,411],[387,433],[418,424],[453,447],[433,478],[443,505],[417,532],[430,570],[0,570]];
 polygon(c,sea,'#82a6a0','#647f73');
 c.save();c.clip();for(let i=0;i<700;i++){let x=rand()*520,y=360+rand()*220;c.fillStyle='#bed0b390';c.fillRect(x,y,4+rand()*16,.8)}c.restore();
 for(let i=0;i<8500;i++){let x=rand()*1040,y=rand()*570;c.fillStyle=i%2?'#78572912':'#fff7dc35';c.fillRect(x,y,rand()*2+1,1)}
 const ridges=[[50,64,31],[345,40,25],[615,42,19],[695,72,25],[822,240,23],[872,270,25],[381,255,12],[66,280,10]];
 for(const [bx,by,n] of ridges){const peaks=[];for(let i=0;i<n;i++)peaks.push([bx+rand()*125,by+rand()*45,5+rand()*14]);peaks.sort((a,b)=>a[1]-b[1]);for(const [x,y,h] of peaks){polygon(c,[[x-h,y],[x,y-h],[x+h*.8,y]],'#c7b48c','#aa9975');polygon(c,[[x,y-h],[x+h*.8,y],[x-2,y-2]],'#a99b79')}}
 for(const [x,y] of [[588,175],[668,129]]){c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+80,y+110,x-30,y+125,x+80,y+202);c.bezierCurveTo(x+140,y+266,x+62,y+290,x+150,570);c.strokeStyle='#81a79b';c.lineWidth=3;c.stroke()}
 c.textAlign='center';c.fillStyle='#4d716a';c.font='italic 18px Georgia';c.fillText('Mediterranean Sea',190,499);c.font='14px Tahoma';c.fillText('دریای مدیترانه',190,519);
 c.fillStyle='#806f51';c.font='italic 21px Georgia';c.fillText('Anatolia',256,64);c.fillText('Mesopotamia',717,390);c.font='12px Tahoma';c.fillText('آناتولی',256,80);c.fillText('میان‌رودان',717,406);
 for(let i=0;i<8;i++){const a=i*Math.PI/4,xx=967,yy=68;const point=(ang,r)=>[xx+Math.sin(ang)*r,yy-Math.cos(ang)*r];polygon(c,[point(a-.4,6),point(a,i%2?13:23),[xx,yy]],'#6d5c43');polygon(c,[[xx,yy],point(a,i%2?13:23),point(a+.4,6)],'#b49b73')}
 c.font='12px Georgia';c.fillText('N',967,37);
}
export function draw(canvas,s,selected){
 const c=canvas.getContext('2d');const scale=Math.min(2,window.devicePixelRatio||1);
 canvas.width=1040*scale;canvas.height=570*scale;c.scale(scale,scale);terrain(c);
 for(const [a,b] of roads){const A=cities[a],B=cities[b];c.beginPath();c.moveTo(A[2],A[3]);c.lineTo(B[2],B[3]);const held=s.owners[a]===1&&s.owners[b]===1;c.setLineDash(held?[]:[5,5]);c.lineWidth=held?4:2;c.strokeStyle=held?'#24756a':'#9b815e';c.stroke()}c.setLineDash([]);
 cities.forEach((city,i)=>{const [,,x,y,kind]=city,col=colors[s.owners[i]];c.beginPath();c.ellipse(x,y,24,10,0,0,Math.PI*2);c.fillStyle=i===selected?'#fff2bd':'#93764a55';c.fill();if(i===selected){c.strokeStyle='#237c71';c.lineWidth=2;c.stroke()}
 for(const [face,fill] of cityModel(kind,col,s.walls[i]))polygon(c,face.map(([a,b,z])=>[x+(a-b)*.98,y+(a+b)*.42-z]),fill,'#745e44');
 });
}
