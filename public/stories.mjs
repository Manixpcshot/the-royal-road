// Original fictional scenes. Each pair is the Persian line and its English performance.
export const voices = {
 rota:['روتا، سرکاروان','Rota · Caravan master'],
 ard:['آردا، پیک','Arda · Courier'],
 mina:['مینا، آسیابان','Mina · Miller'],
 dara:['دارا، نگهبان','Dara · Gatekeeper']
};
export const contracts=[
 {to:10,title:['آردِ اوپیس','Flour for Opis'],fee:5, speaker:'mina',
  opening:['دستت را روی گونی بگذار. گرما را حس می‌کنی؟ آرد هنوز از سنگ آسیاب داغ است. اگر یک کیسه همین‌جا بماند، امشب نگهبان‌ها هم نان دارند.','Put your hand on the sack. Still warm from the millstone. Leave one here and the night watch can have bread too.'],
  options:[['یک کیسه برای نگهبان‌ها','Leave a sack for the watch'],['بار را کامل ببر','Deliver every sack']],
  effects:[['دژ شوش یک سطح قوی‌تر؛ پاداش تحویل ۳ سکه','Susa fort +1 (max 3); delivery pays 3'],['پاداش تحویل ۵ سکه','Delivery pays 5']],
  replies:[['تنور را روشن نگه دار. نوبت من که تمام شد، خمیر را خودم می‌گیرم.','Keep the oven lit. When my watch ends I will knead the dough myself.'],['گره کیسه‌ها را دوباره ببین. نمی‌خواهم تا اوپیس ردّ آرد پشت سرمان بماند.','Check those knots again. I would rather not leave a white trail all the way to Opis.']],
  answer:['dara','rota']},
 {to:7,title:['نامهٔ سرخ‌مهر','The red seal'],fee:8,speaker:'ard',
  opening:['لبهٔ مُهر را ببین؛ هنوز نرم است. اگر یک اسب تازه بگیریم، نامه پیش از آنکه سایهٔ برج روی دروازه بیفتد، به نصیبین می‌رسد.','Look at the edge of the seal. Still soft. Give me a fresh horse and I can reach Nisibis before the tower shadow crosses the gate.'],
  options:[['اسب تازه بگیر','Hire a relay horse'],['با کاروان بمان','Stay with the caravan']],
  effects:[['۲ سکه اکنون؛ تا دو مسیر در هر نوبت','Pay 2 now; up to two roads per turn'],['رایگان؛ یک مسیر در هر نوبت','Free; one road per turn']],
  replies:[['دهنه را بده به من. تو هنوز داری زین را می‌بندی که من به دروازه رسیده‌ام.','Hand me the reins. I will be at the gate before you finish buckling that saddle.'],['نامه زیر کمربند من می‌ماند. امشب همه با هم می‌رسیم.','The letter stays under my belt. Tonight we arrive together.']],answer:['ard','rota']},
 {to:4,title:['رنگ نیلی تارسوس','Indigo for Tarsus'],fee:11,speaker:'rota',
  opening:['آب تا خط سیاه بدنهٔ کلک بالا آمده. آن رنگ نیلی اگر خیس شود، دیگر هیچ‌کس پولش را نمی‌دهد. جا روی کلک بخریم یا صبر کنیم؟','The water is up to the black mark on the raft. If the indigo gets wet, no one will pay for it. Buy a place aboard or wait?'],
  options:[['کرایهٔ کلک را بده','Pay for the raft'],['یک نوبت صبر کن','Wait one turn']],
  effects:[['۲ سکه اکنون؛ اگر راه باز باشد، حرکت در پایان همین نوبت','Pay 2 now; travel this turn if connected'],['رایگان؛ یک نوبت توقف','Free; camp for one turn']],
  replies:[['بارها را وسط بگذار. این دفعه رنگ آستینم از کار است، نه از آب رودخانه.','Load the middle first. This time the blue on my sleeve comes from work, not river water.'],['طناب‌ها را شل نکن. صبح اگر آب پایین رفت، از همین‌جا راه می‌افتیم.','Keep the ropes tight. If the water drops by morning, we leave from here.']],answer:['rota','dara']}
];
export const streets=[
 ['از لای دروازه بوی چرم تازه می‌آید. کسی آن‌سوی دیوار مُهر شوش را به خاطر دارد.','Fresh leather scents the gate. Someone beyond these walls remembers the seal of Susa.'],
 ['ارابه‌ساز وسط حرف ساکت می‌شود تا صدای لقیِ چرخ را بشنود.','A wheelwright breaks off mid-sentence to listen for a loose spoke.'],
 ['آب از لبهٔ کوزه می‌چکد. فروشنده با انگشت خیس راه غرب را روی خاک می‌کشد.','Water drips from a jar. The seller traces the western road in the dust with a wet finger.'],
 ['پینه‌دوز نعلین پیک را بالا می‌گیرد. «این پا از کدام گردنه گذشته؟»','A cobbler holds up the courier’s sandal. “Which pass did this foot cross?”'],
 ['کنار طاقه‌ها، رنگرز ناخن آبی‌اش را روی رسید می‌گذارد.','Beside the bolts of cloth, a dyer presses a blue fingernail to the receipt.'],
 ['باد از شکاف برج می‌گذرد. نگهبان با آرنج جلوی لرزش چراغ را می‌گیرد.','Wind whistles through a crack in the tower. A guard shields the lamp with his elbow.'],
 ['کلک‌بان طناب خیس را روی شانه می‌اندازد و چشم از آب برنمی‌دارد.','The ferryman coils wet rope over one shoulder, his eyes still on the current.'],
 ['مُهردار برای آخرین نامه جای کوچکی روی میز باز می‌کند.','The keeper of seals clears a handspan of desk for the last letter.'],
 ['پسرک تیمارگر با شنیدن زنگوله‌ها پیش از همه به آبشخور می‌دود.','At the first bell, the stable boy races everyone else to the trough.'],
 ['صدای پیمانهٔ جو از حیاط می‌آید. کاتب دوباره می‌شمارد.','A barley measure knocks against the bin. The scribe starts his count again.'],
 ['نانوا خاکستر را کنار می‌زند و از نگهبان می‌پرسد چند نفر سرِ پست‌اند.','The baker rakes the ashes aside and asks how many guards are on watch.'],
 ['گِلِ مُهر هنوز به انگشت کاتب چسبیده. پای دروازه قاطرها برای راه غرب بار می‌گیرند.','Seal clay still clings to the scribe’s fingers. At the gate, the mules are being loaded for the western road.'],
 ["روی سنگفرش هگمتانه برف مانده. نگهبان نام پیک را می‌پرسد و چفت در را بالا می‌کشد.","Snow lingers on the paving stones of Ecbatana. The guard asks the courier’s name and lifts the latch."],
 ["سفالگر ری کاسه را به نور می‌گیرد. از ترک مویی آب خواهد گذشت؛ این یکی برای سفر خوب نیست.","The potter of Rhagae holds a bowl to the light. Water will find the hairline crack. This one cannot travel."],
 ["در پای پلکان، سنگ‌تراش گرد سفید را از چشم گاوِ حجاری‌شده پاک می‌کند.","At the foot of the stairway a sculptor brushes white dust from the eye of a carved bull."],
 ["باغبان پاسارگاد سنگی را از آبراه برمی‌دارد. آب دوباره به جوی انارها می‌رسد.","The gardener at Pasargadae lifts a stone from the channel. Water reaches the pomegranates again."],
 ["کنار چاه، پیک دو مشک را بلند می‌کند و سنگین‌تر را برای راه کویر برمی‌دارد.","Beside the well the courier lifts two waterskins and takes the heavier one for the desert crossing."],
 ["پشت دروازهٔ آرتاکوانا، بندِ زین را با نخ سرخ می‌دوزند تا پیک در راه پارگی را پیدا کند.","Behind the gate at Artacoana a saddler uses red thread so the courier can find the repair on the road."],
 ["در واحهٔ مرو، آب تا لبهٔ باغ بالا آمده. کاروان‌سالار بارها را به زمین خشک می‌برد.","At the oasis of Margiana the water has reached the orchard wall. The caravan master carries the bales to dry ground."],
 ["در بازار بلخ، دبیر برای نامهٔ شوش جای خالی گذاشته. هنوز چراغش روشن است.","In the market at Bactra a scribe has left room for the letter from Susa. His lamp is still lit."]
];
export const residents=['dara','rota','mina','ard','rota','dara','rota','ard','ard','mina','mina','dara','dara','mina','ard','mina','ard','dara','rota','ard'];
export function storyClips(){
 const clips=[];
 contracts.forEach((c,i)=>{
  clips.push({id:'scene-'+i,role:c.speaker,text:c.opening});
  c.replies.forEach((text,j)=>clips.push({id:'reply-'+i+'-'+j,role:c.answer[j],text}));
 });
 streets.forEach((text,i)=>clips.push({id:'street-'+i,role:residents[i],text}));
 return clips;
}

export const receipts=[
 ['نگهبان اوپیس نان را شکست و نیمه‌اش را برای نوبت بعد کنار گذاشت.','The Opis watchman broke his loaf and set half aside for the next shift.'],
 ['مُهردار نصیبین نامه را مقابل پیک گشود. مُهر سالم مانده بود.','The seal keeper of Nisibis opened the letter in front of the courier. The seal was intact.'],
 ['رنگرز تارسوس گره بقچه را باز کرد. حتی یک قطره آب به نیل نرسیده بود.','The Tarsus dyer undid the bundle. Not a drop of river water had touched the indigo.']
];
