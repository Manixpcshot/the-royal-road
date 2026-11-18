// Coordinates belong to the campaign board, a stylised map.
export const cities = [
 ['Sardis','سارد',133,185,'palace'],['Gordium','گوردیون',305,110,'tower'],
 ['Celaenae','کلاینای',233,315,'market'],['Mazaca','مازاکا',443,202,'tower'],
 ['Tarsus','تارسوس',370,382,'market'],['Melitene','ملیتنه',569,116,'fort'],
 ['Carchemish','کرکمیش',543,328,'fort'],['Nisibis','نصیبین',697,235,'market'],
 ['Arbela','اربیل',815,134,'tower'],['Babylon','بابل',665,445,'tower'],
 ['Opis','اوپیس',817,337,'fort'],['Susa','شوش',919,448,'palace']
];
export const roads=[[0,1],[0,2],[1,3],[2,3],[2,4],[3,5],[3,6],[4,6],[5,7],[6,7],[6,9],[7,8],[7,10],[8,10],[9,10],[9,11],[10,11]];
export const nearby=i=>roads.filter(e=>e.includes(i)).map(e=>e[0]===i?e[1]:e[0]);
export const lines={
 start:['شاهراه از شوش آغاز می‌شود. مُهر ما را به سارد برسان.','The road begins in Susa. Carry our seal to Sardis.'],
 join:['فرستاده با پیمان بازگشت. این شهر اکنون همراه ماست.','Our envoy returns with a treaty. This city stands with us.'],
 guard:['نگهبانان تازه به دروازه رسیدند.','Fresh guards have reached the gates.'],
 toll:['کاروان رسید. عوارض راه به خزانه رفت.','The caravan has arrived. Its toll goes to our treasury.'],
 raid:['رقیب یکی از شهرهای ما را گرفت. راه دیگری باز کن.','Our rival has taken a city. Open another route.'],
 rest:['پیک‌ها بازگشتند. فرمان بعدی چیست؟','The couriers have returned. What are your orders?'],
 loss:['مهر رقیب بر دروازه نشست. این لشکرکشی به پایان رسید.','The rival seal is on the gate. Our campaign ends here.'],
 win:['از شوش تا سارد، پیک‌ها زیر یک پرچم می‌تازند.','From Susa to Sardis the couriers ride under one banner.']
};
export const fresh=()=>({v:1,turn:1,ap:2,gold:8,owners:[2,0,2,0,0,0,0,0,0,0,1,1],walls:Array(12).fill(1),last:'start',result:''});
export function linked(s) {
 const seen=new Set(),queue=s.owners[11]===1?[11]:[];
 while(queue.length){const i=queue.pop(); if(seen.has(i))continue;seen.add(i);for(const j of nearby(i))if(s.owners[j]===1&&!seen.has(j))queue.push(j)}
 return seen;
}
export const cost=(s,i)=>s.owners[i]===2?3+s.walls[i]:2;
export function legal(s,i,act){
 if(s.result||s.ap<1||!Number.isInteger(i)||i<0||i>=12)return false;
 if(act==='toll')return s.owners[i]===1;
 if(act==='guard')return s.owners[i]===1&&s.walls[i]<3&&s.gold>=2;
 return act==='join'&&s.owners[i]!==1&&nearby(i).some(j=>linked(s).has(j))&&s.gold>=cost(s,i);
}
function finish(s){
 if(linked(s).has(0))s.result='win';
 else if(s.owners[11]!==1||s.turn>14)s.result='loss';
 if(s.result)s.last=s.result;
}
export function order(s,i,act){
 if(!legal(s,i,act))return false;
 if(act==='join'){s.gold-=cost(s,i);s.owners[i]=1;s.walls[i]=1}
 if(act==='guard'){s.gold-=2;s.walls[i]++}
 if(act==='toll')s.gold+=3;
 s.ap--;s.last=act;finish(s);return true;
}
export function advance(s){
 if(s.result)return;
 const front=cities.map((_,i)=>i).filter(i=>s.owners[i]!==2&&nearby(i).some(j=>s.owners[j]===2));
 const priority=i=>s.owners[i]===1?2+s.walls[i]*1.7:3;
 front.sort((a,b)=>priority(a)-priority(b)||cities[b][2]-cities[a][2]);
 const target=front[0];s.last='rest';
 if(target!==undefined){
  if(s.owners[target]===1&&s.walls[target]>1)s.walls[target]--;
  else {if(s.owners[target]===1)s.last='raid';s.owners[target]=2;s.walls[target]=1}
 }
 s.gold+=2+Math.floor(linked(s).size/3);s.ap=2;s.turn++;finish(s);
}
export function valid(s){
 const bounded=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
 return s?.v===1&&bounded(s.turn,1,15)&&bounded(s.ap,0,2)&&bounded(s.gold,0,1000)&&
 [s.owners,s.walls].every(a=>Array.isArray(a)&&a.length===12)&&s.owners.every(x=>bounded(x,0,2))&&s.walls.every(x=>bounded(x,1,3))&&
 Object.hasOwn(lines,s.last)&&['','win','loss'].includes(s.result);
}
