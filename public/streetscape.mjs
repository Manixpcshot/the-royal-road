// Layered, deterministic pixel scenery for each stop on the campaign board.
export function paintStreet(canvas,city,kind,turn,owner,walls,convoy){
 const w=480,h=128;
 canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d');
 const dusk=turn%4===0||turn%4===1;
 let seed=city*917+51;
 const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const rect=(x,y,a,b,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.floor(x),Math.floor(y),a,b)};
 function shape(points,color){
  ctx.fillStyle=color;ctx.beginPath();for(const [i,[x,y]] of points.entries())i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  ctx.closePath();ctx.fill();
 }
 const gradient=ctx.createLinearGradient(0,0,0,105);
 gradient.addColorStop(0,dusk?'#384661':'#76a8af');gradient.addColorStop(.68,dusk?'#df9873':'#ead8a2');gradient.addColorStop(1,'#f2be87');rect(0,0,w,h,gradient);
 const sx=dusk?363:103,sy=dusk?57:29;
 ctx.fillStyle=dusk?'#ffdfaa':'#fff4c6';ctx.beginPath();ctx.arc(sx,sy,13,0,2*Math.PI);ctx.fill();
 if(dusk)for(let i=0;i<26;i++)rect(random()*w,random()*26,1,1,'#ffffd9');
 for(let n=0;n<2;n++){let ridge=[[0,100],[0,82]];for(let x=0;x<510;x+=17)ridge.push([x,50+random()*20+n*12]);ridge.push([w,112]);shape(ridge,n?'#a7816e':'#c69e83')}
 const warm=dusk?'#ac7658':'#bc956a',shade=dusk?'#684e4b':'#7c6956',lit=dusk?'#dc9b6e':'#e5bb80';
 for(let x=-5;x<w;x+=16+random()*14){const top=67+random()*16,b=14+random()*16;rect(x,top,b,99-top,warm);rect(x+b-5,top,5,99-top,shade);rect(x,top-2,b,3,lit);rect(x+3,top+5,3,4,shade)}
 function tower(x,y,b,height){rect(x,y,b,height,warm);rect(x+b-9,y,9,height,shade);
  for(let z=0;z<b;z+=7)rect(x+z,y-4,4,5,lit);
  rect(x,y+1,b,2,lit);for(let j=0;j<height;j+=7)rect(x+4+(j%3)*4,y+5+j,5,1,shade);
  rect(x+b/2-1,y+9,3,9,'#4e4843')}
 if(kind==='tower'){for(let i=0;i<4;i++){rect(198+i*11,68-i*9,103-i*22,14,warm);rect(198+i*11,67-i*9,103-i*22,3,lit);rect(276-i*10,69-i*9,25-i*4,10,shade)}}
 else if(kind==='palace'){rect(172,80,156,10,warm);for(let i=0;i<9;i++){rect(179+i*16,48,6,32,lit);rect(183+i*16,48,3,32,shade);rect(176+i*16,46,12,5,warm)}rect(172,42,157,5,shade);rect(169,39,163,5,lit)}
 else if(kind==='fort'){rect(178,62,119,25,shade);tower(164,47,31,44);tower(284,47,31,45);rect(206,68,18,24,'#4a4143')}
 else{for(let i=0;i<5;i++){let x=159+i*25;rect(x,69,2,19,shade);shape([[x-3,69],[x+10,60],[x+23,69]],i%2?'#b76a4c':'#dbbc83')}}
 const gateX=55+city%4*15;tower(gateX,57-walls*2,25,35+walls*2);rect(gateX+12,34,2,24,shade);shape([[gateX+14,34],[gateX+34,37],[gateX+14,43]],['#9b835a','#167367','#983e3c'][owner]);
 rect(0,94,w,34,'#aa8364');shape([[0,123],[180,95],[261,95],[100,128],[0,128]],'#d7ac7c');
 for(let i=0;i<130;i++)rect(random()*w,95+random()*36,1+random()*4,1,'#876c554d');
 function mule(x,y){const ink='#50473f';shape([[x,y],[x+11,y+1],[x+17,y-3],[x+18,y-10],[x+20,y-7],[x+22,y-10],[x+24,y-5],[x+20,y],[x+15,y+6],[x+2,y+5]],ink);
  for(const dx of [2,6,12,15])rect(x+dx,y+4,2,8,ink);
  rect(x+1,y-5,6,9,'#8d563c');rect(x+8,y-4,6,8,'#d5a862')}
 for(let i=0;i<(convoy?4:2);i++)mule(305+i*32,98+i%2*3);
 for(let i=0;i<6;i++){const x=42+random()*220,y=92+random()*12;rect(x,y-8,3,3,shade);shape([[x,y-5],[x+3,y-5],[x+5,y+2],[x-2,y+2]],i%2?shade:'#876354');rect(x,y+2,1,3,shade)}
}
