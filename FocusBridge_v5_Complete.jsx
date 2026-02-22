import { useState, useEffect, useCallback, useMemo } from "react";

/* ══════════════════════════════════════════════════════════════════
   FocusBridge v5 — Complete Islamic ADHD Companion
   Quest Engine + Garden + Salah + Food + Focus + Collection
   Age-adaptive: Kids (7-14) ↔ Adults (15+)
   ══════════════════════════════════════════════════════════════════ */

// ── DESIGN TOKENS ──
const C = {
  bg:"#0A1312",bg2:"#0E1918",glass:"rgba(255,255,255,0.032)",border:"rgba(255,255,255,0.05)",
  mint:"#4ADE80",mintD:"#1A6B3A",gold:"#F5C842",goldD:"#B8941F",
  teal:"#2DD4BF",purple:"#A78BFA",rose:"#FB7185",orange:"#FB923C",sky:"#7DD3FC",
  text:"#EDE8DF",mid:"#8A9490",dim:"#4A5553",
};
const spr="cubic-bezier(0.34,1.56,0.64,1)";

// ── QURAN DB ──
const Q=[
  {id:1,s:"Al-Fatiha",v:"1:1",ar:"بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",en:"In the name of Allah, the Most Gracious",r:"common",c:"begin"},
  {id:2,s:"Al-Baqarah",v:"2:153",ar:"اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",en:"Seek help through patience and prayer",r:"common",c:"patience"},
  {id:3,s:"Al-Baqarah",v:"2:186",ar:"فَإِنِّي قَرِيبٌ",en:"Indeed I am near",r:"rare",c:"tawakkul"},
  {id:4,s:"Al-Baqarah",v:"2:286",ar:"لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",en:"Allah does not burden a soul beyond what it can bear",r:"common",c:"mercy"},
  {id:5,s:"Ash-Sharh",v:"94:5-6",ar:"فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",en:"With hardship comes ease",r:"epic",c:"hope"},
  {id:6,s:"Ar-Ra'd",v:"13:28",ar:"أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",en:"In Allah's remembrance do hearts find rest",r:"rare",c:"focus"},
  {id:7,s:"Az-Zumar",v:"39:53",ar:"لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",en:"Do not despair of Allah's mercy",r:"epic",c:"mercy"},
  {id:8,s:"Ibrahim",v:"14:7",ar:"لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",en:"If you are grateful, I will increase you",r:"rare",c:"gratitude"},
  {id:9,s:"Al-Ankabut",v:"29:69",ar:"وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",en:"Those who strive for Us, We guide them",r:"common",c:"strength"},
  {id:10,s:"At-Talaq",v:"65:3",ar:"وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",en:"Whoever relies on Allah, He is sufficient",r:"rare",c:"tawakkul"},
  {id:11,s:"An-Nahl",v:"16:69",ar:"فِيهِ شِفَاءٌ لِّلنَّاسِ",en:"In it is healing for people",r:"legendary",c:"healing"},
  {id:12,s:"Al-Asr",v:"103:1-3",ar:"وَالْعَصْرِ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ",en:"By time, indeed mankind is in loss",r:"common",c:"time"},
  {id:13,s:"Ar-Rahman",v:"55:13",ar:"فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ",en:"Which favors of your Lord would you deny?",r:"rare",c:"gratitude"},
  {id:14,s:"Al-Imran",v:"3:173",ar:"حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",en:"Sufficient for us is Allah",r:"epic",c:"tawakkul"},
  {id:15,s:"Al-Isra",v:"17:82",ar:"وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ",en:"We send down of the Quran that which is healing",r:"legendary",c:"healing"},
];
const RC={common:C.mid,rare:C.teal,epic:C.purple,legendary:C.gold};
const rv=(cat)=>{const f=Q.filter(q=>q.c===cat);return f.length?f[Math.floor(Math.random()*f.length)]:Q[0];};

// ── QUEST POOL (23 quests) ──
const QP=[
  {id:"fajr",cat:"salah",t:"The Fajr Warrior",d:"Pray Fajr today",tk:"Pray Fajr — catch the sunrise!",i:"🌅",xp:30,df:"medium"},
  {id:"dhuhr",cat:"salah",t:"Noon Anchor",d:"Pray Dhuhr on time",tk:"Pray Dhuhr — you got this!",i:"☀️",xp:20,df:"easy"},
  {id:"five",cat:"salah",t:"The Full Five",d:"Log all 5 prayers today",tk:"Pray ALL five — superhero mode!",i:"🕌",xp:80,df:"hard"},
  {id:"onetask",cat:"task",t:"One-Thing Hero",d:"Complete your #1 priority",tk:"Finish your biggest task!",i:"☝️",xp:35,df:"medium"},
  {id:"triple",cat:"task",t:"Triple Threat",d:"Finish 3 tasks today",tk:"Do 3 tasks — power combo!",i:"⚡",xp:50,df:"hard"},
  {id:"dump",cat:"task",t:"Empty the Vault",d:"Brain dump 3+ thoughts",tk:"Write down 3 ideas!",i:"💭",xp:15,df:"easy"},
  {id:"f25",cat:"focus",t:"Deep Diver",d:"25-minute focus session",tk:"Focus for 25 minutes!",i:"🎯",xp:30,df:"medium"},
  {id:"f45",cat:"focus",t:"Ultra Focus",d:"45-minute focus session",tk:"Focus for 45 whole minutes!",i:"🔥",xp:60,df:"hard"},
  {id:"park",cat:"focus",t:"Thought Parker",d:"Park 3 distracting thoughts",tk:"Catch 3 random thoughts!",i:"🅿️",xp:20,df:"easy"},
  {id:"protein",cat:"food",t:"Brain Fuel Champion",d:"Eat protein before noon",tk:"Eat eggs or nuts this morning!",i:"🥚",xp:20,df:"easy"},
  {id:"sunnah",cat:"food",t:"Sunnah Snacker",d:"Eat a Prophetic food today",tk:"Eat dates, honey, or olives!",i:"🫒",xp:15,df:"easy"},
  {id:"water",cat:"food",t:"Water Bearer",d:"Drink 6+ glasses of water",tk:"Drink lots of water today!",i:"💧",xp:20,df:"easy"},
  {id:"nosugar",cat:"food",t:"Sugar Slayer",d:"No refined sugar all day",tk:"Avoid candy and soda today!",i:"🍬",xp:45,df:"hard"},
  {id:"dhikr",cat:"well",t:"Dhikr Drop",d:"Say SubhanAllah 33x",tk:"Say SubhanAllah 33 times!",i:"📿",xp:15,df:"easy"},
  {id:"wudu",cat:"well",t:"Wudu Warrior",d:"Do mindful wudu",tk:"Do wudu step by step!",i:"💧",xp:20,df:"easy"},
  {id:"shukr",cat:"well",t:"Shukr Seeker",d:"Write 3 gratitudes",tk:"Write 3 things you're thankful for!",i:"✨",xp:20,df:"easy"},
  {id:"h1",cat:"habit",t:"Seed Planter",d:"Complete any 1 habit",tk:"Do 1 good habit today!",i:"🌱",xp:15,df:"easy"},
  {id:"h3",cat:"habit",t:"Garden Tender",d:"Complete 3 habits",tk:"Do 3 good habits!",i:"🌿",xp:40,df:"medium"},
  {id:"early",cat:"habit",t:"Early Bird",d:"Complete a habit before 9am",tk:"Do something BEFORE 9am!",i:"🐦",xp:35,df:"hard"},
  {id:"quran",cat:"well",t:"Quran Moment",d:"Read just 2 ayahs today",tk:"Read 2 lines of Quran!",i:"📖",xp:20,df:"easy"},
  {id:"walk",cat:"well",t:"Fresh Air",d:"Go outside for 10 minutes",tk:"Go outside and walk around!",i:"🚶",xp:20,df:"easy"},
  {id:"tidy",cat:"task",t:"Micro Clean",d:"Tidy one surface for 5 min",tk:"Clean one thing for 5 minutes!",i:"🧹",xp:15,df:"easy"},
  {id:"sleep",cat:"well",t:"Isha & Sleep",d:"Pray Isha, then devices off",tk:"Pray Isha and stop screens!",i:"😴",xp:35,df:"hard"},
];

// ── FOOD DB ──
const FOODS=[
  {id:"dates",em:"🫒",n:"Dates",h:true,tag:"🧠 Dopamine",sci:"Iron + magnesium → brain fuel",
    joke:"Brain on dates: 📈\nBrain on energy drinks: 📈📉💀",jokeK:"Dates = natural candy that makes your brain HAPPY! 🧠🎉",
    tip:"Eat 3-7 each morning"},
  {id:"honey",em:"🍯",n:"Honey",h:true,tag:"🦠 Gut hero",sci:"Prebiotic → feeds serotonin-producing gut bacteria",
    joke:"Honey: exists\nProphet ﷺ: 'It heals'\nScience 1400 yrs later: '…he's right'",jokeK:"Allah said honey heals. Scientists checked. Yep. Allah was right! 🍯✨",
    tip:"Replace sugar with honey"},
  {id:"olive",em:"🫒",n:"Olive Oil",h:true,tag:"🧬 Brain shield",sci:"Oleic acid crosses blood-brain barrier, reduces inflammation",
    joke:"Extra virgin olive oil: brain fats\nExtra virgin you: reading this 🫠",jokeK:"Olive oil = superhero juice for your brain! 🦸‍♂️",
    tip:"Cook with it, drizzle on everything"},
  {id:"blackseed",em:"⚫",n:"Black Seed",h:true,tag:"🛡️ Cure-all",sci:"Thymoquinone boosts BDNF (brain growth factor)",
    joke:"Black seed:\n✅ Cures everything except death\n❌ Doesn't cure opening the jar",jokeK:"Prophet ﷺ said it cures everything! Your brain cells are cheering! ⚫🎊",
    tip:"1 tsp daily with honey"},
  {id:"salmon",em:"🐟",n:"Salmon",h:true,tag:"🐟 Omega king",sci:"DHA+EPA = building blocks of brain cells",
    joke:"ADHD brain without omega-3: 🧠💨\nWith: 🧠✨",jokeK:"Fish makes your brain sparkle! Like glitter but useful! ✨🐟",
    tip:"2-3 servings per week"},
  {id:"eggs",em:"🥚",n:"Eggs",h:true,tag:"🎯 Focus fuel",sci:"Choline → acetylcholine (focus neurotransmitter)",
    joke:"Nutritionist: 'Protein breakfast'\nADHD at 11am: cold pizza from 3 days ago",jokeK:"Eggs = your brain's favorite breakfast! Even if you eat them at lunch 😄",
    tip:"Eat before noon!"},
  {id:"barley",em:"🌾",n:"Talbinah",h:true,tag:"💜 Comfort",sci:"Complex carbs + B-vitamins = sustained energy",
    joke:"Talbinah: a hug for your gut\nYour gut: finally someone understands 😭",jokeK:"Warm barley porridge = a warm hug for your tummy! 🤗",
    tip:"Barley flour + milk + honey"},
  {id:"pomegranate",em:"🍎",n:"Pomegranate",h:true,tag:"❤️ Blood flow",sci:"Punicalagins improve brain blood flow 30%",
    joke:"Pomegranate: $3\nSeeds on white shirt: priceless",jokeK:"Pomegranate = brain Gatorade! But way cooler! 🍎💪",
    tip:"Eat seeds or drink juice"},
  {id:"energy",em:"⚡",n:"Energy Drinks",h:false,tag:"💀 Fraud",sci:"Caffeine+sugar = fake dopamine → crash",
    joke:"*drinks Monster*\n2hrs: reorganized closet, 14 otter facts, forgot why I'm here",jokeK:"Energy drinks lie to your brain! They promise power then RUN AWAY! 🏃💨",
    tip:"Try green tea instead"},
  {id:"sugar",em:"🍬",n:"Refined Sugar",h:false,tag:"🎢 Crash",sci:"Spike → crash → brain fog → worse attention",
    joke:"Sugar: I'll give you energy!\n30 min later: angry AND sleepy",jokeK:"Sugar is a TRICKSTER! Gives energy then steals it back! 🍬😈",
    tip:"Swap for dates or honey"},
  {id:"junk",em:"🍟",n:"Ultra-Processed",h:false,tag:"🧪 Chemicals",sci:"Food coloring worsens hyperactivity (The Lancet)",
    joke:"47 ingredients you can't pronounce\nThe food: I'm technically edible!\nNarrator: it was not.",jokeK:"If great-grandma wouldn't recognize it, your brain won't either! 🤷‍♀️",
    tip:"Read labels!"},
  {id:"skip",em:"🚫",n:"Skipping Breakfast",h:false,tag:"⚠️ Empty",sci:"No fuel = impaired working memory + impulse control",
    joke:"7:00 Alarm\n8:45 PANIC\n10:30 Why can't I think\n…oh right, running on vibes",jokeK:"Your brain without breakfast = a phone at 1% battery! CHARGE IT! 🔋",
    tip:"Prep dates + eggs night before"},
];

const FOOD_CHECKS=[
  {id:"p",q:"Protein this morning?",qk:"Did you eat eggs or meat?",y:"🧠 Neurotransmitter factory: ONLINE",yk:"Your brain is POWERED UP! ⚡",n:"Your dopamine is hungry.",nk:"Brain says: feed me please! 🥺",ic:"🥚",co:C.mint},
  {id:"w",q:"Enough water?",qk:"Did you drink lots of water?",y:"Brain hydration: on point",yk:"Your brain is a happy sponge! 🧽💧",n:"Brain is 75% water. Currently 75% regret.",nk:"Your brain is thirsty! Go drink! 🏃💧",ic:"💧",co:C.teal},
  {id:"o",q:"Any omega-3?",qk:"Fish, seeds, or walnuts today?",y:"Brain cell membranes: thriving ✨",yk:"Brain cells doing a happy dance! 💃",n:"Neurons running on dry rubber.",nk:"Your brain wants fish! Or walnuts! 🐟",ic:"🐟",co:C.gold},
  {id:"s",q:"Sunnah food today?",qk:"Dates, honey, or olive oil?",y:"Following Prophet ﷺ AND neuroscience",yk:"Sunnah food + science = SUPER BRAIN! 🌟",n:"Prophet ﷺ ate dates for breakfast. Just saying.",nk:"The Prophet ﷺ would be proud! Eat dates! 🫒",ic:"🫒",co:C.purple},
  {id:"x",q:"Dodged refined sugar?",qk:"No candy or soda today?",y:"Blood sugar: stable. Vibes: immaculate.",yk:"You beat the Sugar Monster! 🏆",n:"Tomorrow is a new day. Drink water now.",nk:"It's OK! Try again tomorrow! You're still awesome! 💪",ic:"🍬",co:C.rose},
];

// ── GARDEN ──
const GI={sprout:{s:["🌱","🌿","🪴","🌳"],n:"Tree"},flower:{s:["🌱","🌿","🌷","🌸"],n:"Cherry"},
  palm:{s:["🌱","🌿","🌴","🌴"],n:"Palm"},rose:{s:["🌱","🌿","🥀","🌹"],n:"Rose"},
  sun:{s:["🌱","🌿","🌻","🌻"],n:"Sunflower"},herb:{s:["🌱","🌿","🍃","🍀"],n:"Herb"},
  fruit:{s:["🌱","🌿","🍊","🍎"],n:"Fruit"},cactus:{s:["🌱","🌵","🌵","🌵"],n:"Cactus"}};

// ── JOURNEY ──
const JS=[
  {n:"The Desert",l:"🏜️",xp:0,d:"Every journey begins with one step."},
  {n:"The Oasis",l:"🏝️",xp:200,d:"Rest, then continue."},
  {n:"The Garden",l:"🌿",xp:500,d:"Your efforts are blooming."},
  {n:"The Village",l:"🏘️",xp:1000,d:"Building something meaningful."},
  {n:"The Masjid",l:"🕌",xp:2000,d:"A place of peace."},
  {n:"The Mountain",l:"🏔️",xp:3500,d:"The view is breathtaking."},
  {n:"The Holy City",l:"🕋",xp:5500,d:"The journey never ends."},
];

const SURPRISES=[
  "🎁 Surprise! Say SubhanAllah 10x for a garden boost!",
  "💡 The Prophet ﷺ focused during 2-hour prayers. You showed up today — that counts!",
  "🌟 You opened this app. That's an act of intention. الحمد لله",
  "📿 Quick: 3 breaths, say Bismillah. Your garden just grew a little.",
  "🧠 Your prefrontal cortex says: 'thank you for caring about me!'",
  "🫒 Sunnah snack break? 3 dates. Your dopamine will celebrate.",
  "💧 Water check: your brain is 75% water. Is it happy?",
  "🌊 'Take benefit of five before five.' You're doing it right now.",
];

const dayH=()=>{const d=new Date(),s=`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}return Math.abs(h);};

// ── COMPONENTS ──
const Glass=({ch,s={},onClick,glow})=>{const[h,sH]=useState(false);return<div onClick={onClick} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)} style={{background:C.glass,backdropFilter:"blur(14px)",borderRadius:20,padding:15,border:`1px solid ${h&&glow?glow+"25":C.border}`,transition:"all 0.25s ease",transform:h&&onClick?"translateY(-2px)":"none",cursor:onClick?"pointer":"default",position:"relative",overflow:"hidden",...s}}>{ch}</div>;};
const Ring=({v,sz=44,sk=3,co=C.mint,ch})=>{const r=(sz-sk)/2,ci=2*Math.PI*r,off=ci-Math.min(v/100,1)*ci;return<div style={{position:"relative",width:sz,height:sz}}><svg width={sz} height={sz} style={{transform:"rotate(-90deg)"}}><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={sk}/><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={co} strokeWidth={sk} strokeDasharray={ci} strokeDashoffset={off} strokeLinecap="round" style={{transition:`stroke-dashoffset 0.8s ${spr}`,filter:`drop-shadow(0 0 5px ${co}30)`}}/></svg><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{ch}</div></div>;};
const Geo=({o=0.025,co=C.gold})=><svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:o,pointerEvents:"none"}} viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice"><defs><pattern id="gp" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M20 0L40 20L20 40L0 20Z" fill="none" stroke={co} strokeWidth="0.3"/><circle cx="20" cy="20" r="6" fill="none" stroke={co} strokeWidth="0.2"/></pattern></defs><rect width="200" height="200" fill="url(#gp)"/></svg>;

// ── LOOT DROP ──
const Loot=({show,rw,onClose})=>{const[vis,sV]=useState(false);useEffect(()=>{if(show){sV(true);const t=setTimeout(()=>{sV(false);onClose?.();},4500);return()=>clearTimeout(t);}},[show]);if(!vis||!rw)return null;const sp=Array.from({length:40},(_,i)=>({x:50+(Math.random()-0.5)*80,y:42+(Math.random()-0.5)*60,s:2+Math.random()*6,d:Math.random()*400,c:[C.gold,"#fff",C.mint,C.teal,C.purple][i%5],r:Math.random()>0.5}));const rc=rw.type==="ayah"?RC[rw.data?.r]||C.gold:C.gold;return<div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.92)",backdropFilter:"blur(24px)",animation:"fadeIn 0.3s ease"}} onClick={()=>{sV(false);onClose?.();}}>
  {sp.map((p,i)=><div key={i} style={{position:"absolute",left:`${p.x}%`,top:`${p.y}%`,width:p.s,height:p.s,background:p.c,borderRadius:p.r?"50%":"2px",transform:p.r?"none":"rotate(45deg)",animation:`confetti 1.5s ${spr} ${p.d}ms forwards`,opacity:0}}/>)}
  <div style={{textAlign:"center",zIndex:2,padding:28,maxWidth:320,animation:"popIn 0.5s ease 100ms both"}}>
    {rw.type==="ayah"?<><div style={{fontSize:13,fontWeight:800,color:rc,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{rw.data.r==="legendary"?"⭐ LEGENDARY":rw.data.r==="epic"?"💎 EPIC":"✨ "+rw.data.r.toUpperCase()} VERSE</div><div style={{background:"rgba(255,255,255,0.03)",borderRadius:22,padding:20,border:`1px solid ${rc}18`,marginBottom:12}}><p style={{fontFamily:"'Amiri',serif",fontSize:20,color:`${rc}bb`,direction:"rtl",textAlign:"right",lineHeight:1.9,marginBottom:8}}>{rw.data.ar}</p><p style={{fontSize:12,color:C.mid,fontStyle:"italic"}}>"{rw.data.en}"</p><p style={{fontSize:10,color:rc,fontWeight:800,marginTop:6}}>— {rw.data.s} {rw.data.v}</p></div></>:
    <><div style={{fontSize:52,marginBottom:8,filter:`drop-shadow(0 0 20px ${C.gold}40)`}}>{rw.icon||"🌟"}</div><h3 style={{fontSize:22,fontWeight:900,color:C.gold,margin:"0 0 6px"}}>{rw.title}</h3><p style={{fontSize:12,color:C.mid}}>{rw.desc}</p><div style={{marginTop:12,padding:"6px 16px",borderRadius:14,background:`${C.mint}12`,display:"inline-block"}}><span style={{fontSize:14,fontWeight:900,color:C.mint}}>+{rw.xp} XP</span></div></>}
  </div></div>;};

// ══════════════════════════════════
//  MAIN APP
// ══════════════════════════════════
export default function App(){
  const[mode,setMode]=useState(null); // null=choose, "adult", "kid"
  const[screen,setScreen]=useState("quest");
  const[xp,setXP]=useState(847);
  const[loot,setLoot]=useState(null);
  const[col,setCol]=useState([1,2,4,5,9,12]);
  const[garden,setGarden]=useState([{t:"sprout",g:3},{t:"flower",g:3},{t:"palm",g:2},{t:"rose",g:1},{t:"sun",g:2},{t:"herb",g:0},{t:"cactus",g:1},{t:"fruit",g:0},{t:null,g:0}]);
  const[qDone,setQD]=useState({});
  const[salah,setSalah]=useState({Fajr:0,Dhuhr:0,Asr:0,Maghrib:0,Isha:0});
  const[foodChecks,setFC]=useState({});
  const[foodCard,setFoodCard]=useState(0);
  const[foodFlip,setFoodFlip]=useState(false);
  const[bonusDone,setBD]=useState(false);
  const[bonusVis,setBV]=useState(false);
  const k=mode==="kid";
  const seed=useMemo(()=>dayH(),[]);
  const quests=useMemo(()=>{const e=QP.filter(q=>q.df==="easy"),m=QP.filter(q=>q.df==="medium"),h=QP.filter(q=>q.df==="hard");return[e[seed%e.length],m[(seed*7+3)%m.length],h[(seed*13+7)%h.length]];},[seed]);
  const bonus=useMemo(()=>QP.filter(q=>q.cat==="well")[seed%QP.filter(q=>q.cat==="well").length],[seed]);
  const surprise=useMemo(()=>SURPRISES[seed%SURPRISES.length],[seed]);
  const station=useMemo(()=>{let s=JS[0];for(const st of JS)if(xp>=st.xp)s=st;return s;},[xp]);
  const nextSt=useMemo(()=>{const i=JS.indexOf(station);return i<JS.length-1?JS[i+1]:null;},[station]);
  useEffect(()=>{const t=setTimeout(()=>setBV(true),6000);return()=>clearTimeout(t);},[]);

  const doQuest=(q)=>{if(qDone[q.id])return;setQD({...qDone,[q.id]:true});setXP(x=>x+q.xp);
    if(Math.random()<0.3){const unc=Q.filter(a=>!col.includes(a.id));if(unc.length>0){const wt=unc.map(a=>a.r==="legendary"?1:a.r==="epic"?3:a.r==="rare"?6:10);const tw=wt.reduce((s,w)=>s+w,0);let r=Math.random()*tw,pk=unc[0];for(let i=0;i<unc.length;i++){r-=wt[i];if(r<=0){pk=unc[i];break;}}setCol([...col,pk.id]);setTimeout(()=>setLoot({type:"ayah",data:pk}),400);return;}}
    setTimeout(()=>setLoot({type:"xp",icon:q.i,title:k?"Quest done! 🎉":"Quest Complete!",desc:q.t,xp:q.xp}),300);
    setGarden(gs=>{const ng=[...gs];const gw=ng.filter(s=>s.t&&s.g<3);if(gw.length>0)gw[Math.floor(Math.random()*gw.length)].g++;else{const em=ng.findIndex(s=>!s.t);if(em>=0){const types=Object.keys(GI);ng[em]={t:types[Math.floor(Math.random()*types.length)],g:0};}}return ng;});};
  const doBonus=()=>{if(bonusDone)return;setBD(true);setXP(x=>x+bonus.xp);setTimeout(()=>setLoot({type:"xp",icon:"🎁",title:k?"BONUS! 🎁":"Bonus Quest!",desc:bonus.t,xp:bonus.xp}),300);};
  const qdc=Object.keys(qDone).length+(bonusDone?1:0);
  const qt=quests.length+(bonusVis?1:0);
  const sdone=Object.values(salah).filter(v=>v>0).length;
  const cscore=Object.values(foodChecks).filter(Boolean).length;
  const cycleSalah=(p)=>{const nx=salah[p]===0?1:salah[p]===1?0.5:0;setSalah({...salah,[p]:nx});if(nx===1){setXP(x=>x+10);if(Math.random()<0.2){const unc=Q.filter(a=>!col.includes(a.id)&&a.c==="gratitude");if(unc.length>0){setCol([...col,unc[0].id]);setTimeout(()=>setLoot({type:"ayah",data:unc[0]}),300);}}}};

  // ── MODE SELECTOR ──
  if(!mode) return <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.bg,fontFamily:"'Nunito',system-ui,sans-serif",color:C.text,padding:32,maxWidth:430,margin:"0 auto"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Nunito:wght@600;700;800;900&display=swap');`}</style>
    <Geo o={0.04} co={C.gold}/>
    <div style={{textAlign:"center",position:"relative",zIndex:1,animation:"fadeIn 0.5s ease"}}>
      <p style={{fontFamily:"'Amiri',serif",fontSize:20,color:`${C.gold}60`,marginBottom:12}}>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
      <h1 style={{fontSize:32,fontWeight:900,margin:"0 0 4px"}}>FocusBridge 🌿</h1>
      <p style={{fontSize:14,color:C.mid,margin:"0 0 32px"}}>Your Islamic ADHD companion</p>
      <p style={{fontSize:13,color:C.mid,marginBottom:20}}>Who's using the app today?</p>
      <div style={{display:"flex",gap:14}}>
        <button onClick={()=>setMode("kid")} style={{flex:1,padding:"28px 16px",borderRadius:24,background:`${C.gold}08`,border:`2px solid ${C.gold}20`,cursor:"pointer",transition:`all 0.3s ${spr}`}}>
          <div style={{fontSize:44,marginBottom:8}}>🧒</div>
          <div style={{fontSize:16,fontWeight:900,color:C.gold}}>Kids</div>
          <div style={{fontSize:11,color:C.dim,marginTop:4}}>Age 7-14</div>
          <div style={{fontSize:10,color:C.dim,marginTop:2}}>Bigger icons · fun jokes</div>
        </button>
        <button onClick={()=>setMode("adult")} style={{flex:1,padding:"28px 16px",borderRadius:24,background:`${C.mint}06`,border:`2px solid ${C.mint}18`,cursor:"pointer",transition:`all 0.3s ${spr}`}}>
          <div style={{fontSize:44,marginBottom:8}}>🧑</div>
          <div style={{fontSize:16,fontWeight:900,color:C.mint}}>Adults</div>
          <div style={{fontSize:11,color:C.dim,marginTop:4}}>Age 15+</div>
          <div style={{fontSize:10,color:C.dim,marginTop:2}}>Refined · deeper content</div>
        </button>
      </div>
    </div>
  </div>;

  // ── QUEST SCREEN ──
  const QuestScr=()=>{
    const greet=[k?"Assalamu Alaikum champion! 🏆":"Assalamu Alaikum 🌿",k?"Bismillah — adventure time! ⚔️":"Bismillah — let's begin",k?"Your quests are ready! 🗺️":"Your quests await",k?"Hero mode: ON! 💪":"Time to level up"][seed%4];
    return <div style={{padding:"0 16px 100px",animation:"fadeIn 0.35s ease"}}>
      <div style={{position:"relative",margin:"0 -16px",padding:"16px 16px 20px",overflow:"hidden"}}>
        <Geo o={0.03} co={C.gold}/>
        <div style={{position:"relative",zIndex:1}}>
          <p style={{fontFamily:"'Amiri',serif",fontSize:k?15:17,color:`${C.gold}50`,textAlign:"center",marginBottom:6}}>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
          <h1 style={{fontSize:k?22:25,fontWeight:900,color:C.text,margin:"0 0 2px"}}>{greet}</h1>
          <p style={{fontSize:11,color:C.mid}}>{new Date().toLocaleDateString("en",{weekday:"long",month:"long",day:"numeric"})} · {station.l} {station.n}</p>
        </div>
      </div>
      {/* Journey bar */}
      <Glass s={{marginBottom:12,padding:"12px 14px"}} ch={<>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:k?28:22}}>{station.l}</span>
            <div><div style={{fontSize:11,fontWeight:800,color:C.gold}}>{station.n}</div><div style={{fontSize:9,color:C.dim}}>{station.d}</div></div>
          </div>
          <div style={{textAlign:"right"}}><div style={{fontSize:k?20:17,fontWeight:900,color:C.gold}}>{xp}</div><div style={{fontSize:8,color:C.dim,fontWeight:700}}>XP</div></div>
        </div>
        {nextSt&&<><div style={{height:5,borderRadius:3,background:"rgba(255,255,255,0.03)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${C.gold},${C.mint})`,width:`${Math.min(((xp-station.xp)/(nextSt.xp-station.xp))*100,100)}%`,transition:`width 0.8s ${spr}`}}/></div><p style={{fontSize:9,color:C.dim,marginTop:3,textAlign:"right"}}>{nextSt.xp-xp} XP → {nextSt.l} {nextSt.n}</p></>}
      </>}/>
      {/* Daily quests */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"0 0 10px"}}>
        <div><h2 style={{fontSize:k?16:17,fontWeight:900,color:C.text,margin:0}}>{k?"Today's Missions! ⚔️":"Today's Quests"}</h2><p style={{fontSize:10,color:C.mid,margin:"2px 0 0"}}>Different every day</p></div>
        <Ring v={qt>0?(qdc/qt)*100:0} sz={40} sk={3} co={qdc===qt&&qt>0?C.gold:C.mint} ch={<span style={{fontSize:11,fontWeight:900,color:qdc===qt&&qt>0?C.gold:C.mint}}>{qdc}</span>}/>
      </div>
      {quests.map((q,i)=>{const done=qDone[q.id];const dc=q.df==="hard"?C.rose:q.df==="medium"?C.gold:C.mint;
        return<Glass key={q.id} onClick={done?undefined:()=>doQuest(q)} glow={done?undefined:dc} s={{marginBottom:8,opacity:done?0.35:1,animation:`slideUp 0.3s ease ${i*60}ms both`,borderLeft:done?"none":`3px solid ${dc}35`,borderRadius:done?20:"4px 20px 20px 4px"}} ch={
          <div style={{display:"flex",alignItems:"center",gap:k?14:12}}>
            <div style={{width:k?52:46,height:k?52:46,borderRadius:k?18:14,flexShrink:0,background:done?`${C.mint}12`:`${dc}08`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:k?28:22,border:`1.5px solid ${done?C.mint:dc}18`}}>{done?<span style={{color:C.mint}}>✓</span>:q.i}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:1}}>
                <span style={{fontSize:k?14:13,fontWeight:800,color:done?C.dim:C.text,textDecoration:done?"line-through":"none"}}>{q.t}</span>
                <span style={{fontSize:8,fontWeight:800,padding:"2px 7px",borderRadius:6,background:`${dc}10`,color:dc}}>{q.df.toUpperCase()}</span>
              </div>
              <p style={{fontSize:k?11:10,color:C.dim,margin:0}}>{k?q.tk:q.d}</p>
            </div>
            <span style={{fontSize:13,fontWeight:900,color:done?C.dim:C.gold}}>+{q.xp}</span>
          </div>}/>;})}
      {/* Bonus */}
      {bonusVis&&<Glass onClick={bonusDone?undefined:doBonus} glow={bonusDone?undefined:C.purple} s={{marginBottom:12,opacity:bonusDone?0.35:1,animation:"popIn 0.5s ease",background:`${C.purple}05`,border:`1px solid ${C.purple}10`}} ch={
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:k?52:46,height:k?52:46,borderRadius:k?18:14,background:`${C.purple}10`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:k?26:22,border:`1.5px solid ${C.purple}15`}}>{bonusDone?"✓":"🎁"}</div>
          <div style={{flex:1}}><span style={{fontSize:k?14:13,fontWeight:800,color:bonusDone?C.dim:C.purple}}>BONUS: {bonus.t}</span><p style={{fontSize:10,color:C.dim,margin:"2px 0 0"}}>{k?bonus.tk:bonus.d}</p></div>
          <span style={{fontSize:13,fontWeight:900,color:bonusDone?C.dim:C.purple}}>+{bonus.xp}</span>
        </div>}/>}
      {/* Surprise */}
      <Glass s={{background:`${C.gold}03`,border:`1px solid ${C.gold}06`}} ch={<p style={{fontSize:k?12:11,color:C.mid,lineHeight:1.5,margin:0}}>{surprise}</p>}/>
    </div>;};

  // ── SALAH + FOOD SCREEN ──
  const PrayFoodScr=()=>{
    const[tab,setTab]=useState("salah");
    const prayers=["Fajr","Dhuhr","Asr","Maghrib","Isha"];const icons=["🌅","☀️","🌤️","🌆","🌙"];
    return<div style={{padding:"0 16px 100px",animation:"fadeIn 0.3s ease"}}>
      <div style={{padding:"14px 0 10px"}}><h2 style={{fontSize:k?22:23,fontWeight:900,color:C.text,margin:0}}>{k?"My Ibadah 🤲":"Salah & Nutrition"}</h2></div>
      {/* Tabs */}
      <div style={{display:"flex",gap:5,marginBottom:12}}>
        {[{id:"salah",l:k?"🤲 Prayers":"🤲 Salah"},{id:"food",l:k?"🧠 Brain Food":"🧠 Brain Fuel"},{id:"check",l:k?"✅ Check!":"✅ Daily Check"}].map(t=>
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"9px 8px",borderRadius:14,background:tab===t.id?`${C.mint}15`:"rgba(255,255,255,0.02)",border:`1.5px solid ${tab===t.id?C.mint:"rgba(255,255,255,0.04)"}`,color:tab===t.id?C.mint:C.dim,fontSize:k?12:11,fontWeight:800,cursor:"pointer"}}>{t.l}</button>)}
      </div>
      {/* SALAH TAB */}
      {tab==="salah"&&<>
        <Glass s={{marginBottom:12}} ch={<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div><p style={{fontSize:9,fontWeight:800,color:C.mid,letterSpacing:1.2,textTransform:"uppercase",margin:0}}>TODAY'S SALAH</p>
              <p style={{fontSize:12,color:sdone===5?C.gold:C.mint,fontWeight:700,margin:"3px 0 0"}}>{sdone===0?(k?"Tap to start logging!":"Tap to log"):sdone===5?(k?"ALL FIVE! You're a superstar! ⭐":"All five — ما شاء الله!"):`${sdone}/5 ${k?"— keep going champ!":"— every prayer counts"}`}</p></div>
            <Ring v={(sdone/5)*100} sz={42} sk={3} co={C.gold} ch={<span style={{fontSize:13,fontWeight:900,color:C.gold}}>{sdone}</span>}/>
          </div>
          <div style={{display:"flex",gap:5}}>
            {prayers.map((p,i)=>{const val=salah[p];return<button key={p} onClick={()=>cycleSalah(p)} style={{flex:1,padding:k?"12px 3px":"10px 3px",borderRadius:16,cursor:"pointer",background:val===1?`${C.mint}18`:val===0.5?`${C.gold}15`:"rgba(255,255,255,0.02)",border:`2px solid ${val===1?C.mint:val===0.5?C.gold:"rgba(255,255,255,0.04)"}`,transition:`all 0.3s ${spr}`}}><div style={{fontSize:k?24:20,marginBottom:2}}>{val===1?"✓":val===0.5?"½":icons[i]}</div><div style={{fontSize:k?10:8,fontWeight:800,color:val===1?C.mint:val===0.5?C.gold:C.dim}}>{p}</div></button>;})}
          </div>
          <p style={{fontSize:9,color:C.dim,margin:"8px 0 0",textAlign:"center"}}>✓ prayed · ½ late/shortened · tap to cycle</p>
        </>}/>
        {/* Guilt circuit breaker */}
        <Glass s={{background:`${C.rose}03`,border:`1px solid ${C.rose}06`}} ch={
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <span style={{fontSize:k?28:24,flexShrink:0}}>💚</span>
            <div><p style={{fontSize:k?13:12,fontWeight:800,color:C.rose,margin:"0 0 4px"}}>{k?"Missed a prayer? That's OK!":"Missed a prayer? Read this."}</p>
              <p style={{fontSize:11,color:C.mid,lineHeight:1.5,margin:0}}>{k?"ADHD makes it hard to keep track of time. Missing a prayer doesn't mean Allah is upset with you. He knows you're trying! 💪":"You are NOT a bad Muslim. ADHD affects working memory and time perception — missing prayers is a symptom, not a sin."}</p>
              <div style={{marginTop:8,padding:"8px 12px",borderRadius:14,background:`${C.gold}05`,border:`1px solid ${C.gold}08`}}>
                <p style={{fontFamily:"'Amiri',serif",fontSize:14,color:`${C.gold}90`,direction:"rtl",textAlign:"right",lineHeight:1.8,margin:"0 0 2px"}}>لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ</p>
                <p style={{fontSize:10,color:C.dim,fontStyle:"italic"}}>"Do not despair of Allah's mercy." — 39:53</p>
              </div>
            </div>
          </div>}/>
      </>}
      {/* FOOD CARDS TAB */}
      {tab==="food"&&<>{(()=>{const fd=FOODS[foodCard];const dc=fd.h?C.mint:C.rose;return<>
        <div onClick={()=>setFoodFlip(!foodFlip)} style={{background:fd.h?`linear-gradient(145deg,rgba(255,255,255,0.03),${dc}06)`:`linear-gradient(145deg,rgba(255,255,255,0.02),${dc}04)`,borderRadius:24,padding:k?22:20,minHeight:k?300:260,cursor:"pointer",border:`1px solid ${dc}12`,animation:"fadeIn 0.3s ease",marginBottom:10}}>
          <div style={{display:"inline-flex",padding:"3px 10px",borderRadius:12,background:`${fd.h?C.mint:C.rose}10`,marginBottom:10}}><span style={{fontSize:10,fontWeight:800,color:fd.h?C.mint:C.rose}}>{fd.h?"✅ BRAIN HERO":"🚫 BRAIN VILLAIN"}</span></div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontSize:k?42:36}}>{fd.em}</span><div><h3 style={{fontSize:k?18:16,fontWeight:900,color:C.text,margin:0}}>{fd.n}</h3><span style={{fontSize:10,color:dc,fontWeight:700}}>{fd.tag}</span></div></div>
          {!foodFlip?<div style={{animation:"fadeIn 0.25s ease"}}>
            <div style={{background:"rgba(255,255,255,0.03)",borderRadius:16,padding:14,marginBottom:8,border:`1px solid ${C.border}`}}>
              <p style={{fontSize:9,fontWeight:800,color:C.dim,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>😂 THE JOKE</p>
              <p style={{fontSize:k?13:12,color:C.text,lineHeight:1.7,whiteSpace:"pre-line",fontWeight:600}}>{k?fd.jokeK:fd.joke}</p>
            </div>
            <p style={{fontSize:10,color:C.dim,textAlign:"center",marginTop:8}}>Tap to flip → science</p>
          </div>:<div style={{animation:"fadeIn 0.25s ease"}}>
            <div style={{background:`${C.mint}05`,borderRadius:14,padding:12,marginBottom:8,border:`1px solid ${C.mint}08`}}>
              <p style={{fontSize:9,fontWeight:800,color:C.mint,letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>🔬 SCIENCE</p>
              <p style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{fd.sci}</p>
            </div>
            <div style={{background:`${C.gold}04`,borderRadius:12,padding:10,border:`1px solid ${C.gold}06`}}>
              <p style={{fontSize:9,fontWeight:800,color:C.gold,letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>💡 ACTION</p>
              <p style={{fontSize:11,color:C.mid}}>{fd.tip}</p>
            </div>
            <p style={{fontSize:10,color:C.dim,textAlign:"center",marginTop:8}}>Tap to flip → joke</p>
          </div>}
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={(e)=>{e.stopPropagation();setFoodFlip(false);setFoodCard((foodCard-1+FOODS.length)%FOODS.length);}} style={{width:42,height:42,borderRadius:21,background:C.glass,border:`1px solid ${C.border}`,cursor:"pointer",fontSize:16,color:C.text}}>←</button>
          <div style={{display:"flex",gap:3}}>{FOODS.map((_,i)=><div key={i} style={{width:i===foodCard?16:5,height:5,borderRadius:3,background:i===foodCard?(FOODS[i].h?C.mint:C.rose):"rgba(255,255,255,0.05)",transition:`all 0.3s ${spr}`}}/>)}</div>
          <button onClick={(e)=>{e.stopPropagation();setFoodFlip(false);setFoodCard((foodCard+1)%FOODS.length);}} style={{width:42,height:42,borderRadius:21,background:C.glass,border:`1px solid ${C.border}`,cursor:"pointer",fontSize:16,color:C.text}}>→</button>
        </div>
      </>;})()}</>}
      {/* DAILY CHECK TAB */}
      {tab==="check"&&<>
        <Glass s={{marginBottom:12,textAlign:"center",background:cscore===5?`linear-gradient(135deg,${C.goldD},#8B6914)`:C.glass,border:cscore===5?"none":`1px solid ${C.border}`}} ch={<>
          <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:cscore===5?"rgba(255,255,255,0.7)":C.dim,textTransform:"uppercase"}}>{cscore===5?(k?"BRAIN FUEL: MAXIMUM! 🚀":"BRAIN FUEL: OPTIMAL 🌟"):(k?"Today's Brain Check!":"BRAIN FUEL CHECK")}</div>
          <div style={{fontSize:42,fontWeight:900,color:cscore===5?"#fff":C.text,margin:"4px 0"}}>{cscore}/5</div>
          <div style={{fontSize:11,color:cscore===5?"rgba(255,255,255,0.85)":C.mid,fontWeight:600}}>
            {cscore===0?(k?"Let's power up that brain! 🔋":"Running on duas and hope."):cscore===1?(k?"Good start champion! 💪":"Small consistent deeds."):cscore===2?(k?"Getting stronger! 💪💪":"Neurons cautiously optimistic."):cscore===3?(k?"Brain is smiling! 😊":"Brain starting to believe."):cscore===4?(k?"SO CLOSE to perfection! 🤩":"One more for max power."):k?"ULTIMATE BRAIN POWER! 🧠⚡":"ما شاء الله — Premium halal fuel!"}</div>
        </>}/>
        {FOOD_CHECKS.map((it,i)=>{const ck=foodChecks[it.id]||false;return<div key={it.id} style={{background:ck?`${it.co}06`:C.glass,borderRadius:18,padding:k?14:12,marginBottom:7,border:`1px solid ${ck?`${it.co}12`:C.border}`,display:"flex",alignItems:"center",gap:12,animation:`slideUp 0.3s ease ${i*50}ms both`}}>
          <button onClick={()=>setFC({...foodChecks,[it.id]:!ck})} style={{width:k?46:40,height:k?46:40,borderRadius:k?23:20,flexShrink:0,background:ck?it.co:"rgba(255,255,255,0.02)",border:ck?"none":"2px solid rgba(255,255,255,0.06)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:k?22:18,color:ck?"#fff":C.text,transition:`all 0.3s ${spr}`,transform:ck?"scale(1.05)":"scale(1)"}}>{ck?"✓":it.ic}</button>
          <div style={{flex:1}}><p style={{fontSize:k?13:12,fontWeight:800,color:C.text,margin:"0 0 2px"}}>{k?it.qk:it.q}</p><p style={{fontSize:10,color:ck?it.co:C.dim,fontWeight:600,fontStyle:"italic",margin:0}}>{ck?(k?it.yk:it.y):(k?it.nk:it.n)}</p></div>
        </div>;})}
      </>}
    </div>;};

  // ── GARDEN SCREEN ──
  const GardenScr=()=><div style={{padding:"0 16px 100px",animation:"fadeIn 0.35s ease"}}>
    <div style={{padding:"14px 0 10px"}}><h2 style={{fontSize:k?22:23,fontWeight:900,color:C.text,margin:0}}>{k?"My Garden! 🌿":"Your Garden 🌿"}</h2><p style={{fontSize:11,color:C.mid,margin:"3px 0 0"}}>{k?"It grows when you do quests! It never dies! 💚":"Grows with you. Never dies. Just waits."}</p></div>
    <div style={{position:"relative",borderRadius:26,overflow:"hidden",marginBottom:14,background:"linear-gradient(180deg,#0A1820,#0E241E 40%,#132E1A)",border:`1px solid ${C.border}`,padding:k?"28px 14px 20px":"24px 14px 18px",minHeight:k?260:220}}>
      <Geo o={0.02} co={C.mint}/><div style={{position:"absolute",top:10,right:18,fontSize:18,opacity:0.35}}>🌙</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:k?12:10,position:"relative",zIndex:1}}>
        {garden.map((slot,i)=>{const item=slot.t?GI[slot.t]:null;const em=item?item.s[Math.min(slot.g,3)]:null;
          return<div key={i} style={{aspectRatio:"1",borderRadius:k?20:18,background:em?"rgba(255,255,255,0.025)":"rgba(255,255,255,0.012)",border:`1px dashed ${em?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.025)"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:`fadeIn 0.4s ease ${i*50}ms both`}}>
            {em?<><span style={{fontSize:k?40:34,filter:"drop-shadow(0 3px 6px rgba(0,0,0,0.3))",animation:slot.g>=3?"sway 3s ease infinite":"none"}}>{em}</span><span style={{fontSize:k?9:7,color:C.dim,fontWeight:700,marginTop:3}}>{item.n}</span></>:<span style={{fontSize:20,opacity:0.12}}>·</span>}
          </div>;})}
      </div>
    </div>
    <div style={{display:"flex",gap:7,marginBottom:14}}>
      {[{n:garden.filter(s=>s.t).length,l:"Plants",c:C.mint},{n:garden.filter(s=>s.g>=3).length,l:k?"Grown up!":"Fully grown",c:C.gold},{n:9-garden.filter(s=>s.t).length,l:"Empty",c:C.dim}].map((s,i)=>
        <Glass key={i} s={{flex:1,textAlign:"center",padding:"10px 5px"}} ch={<><div style={{fontSize:k?22:18,fontWeight:900,color:s.c}}>{s.n}</div><div style={{fontSize:8,color:C.dim,fontWeight:700}}>{s.l}</div></>}/>)}
    </div>
    <Glass s={{background:`${C.mint}03`,border:`1px solid ${C.mint}06`}} ch={<>
      <p style={{fontSize:11,fontWeight:800,color:C.mint,margin:"0 0 4px"}}>{k?"🌿 How does my garden grow?":"🌿 How it grows"}</p>
      <p style={{fontSize:10,color:C.mid,lineHeight:1.5,margin:0}}>{k?"Every quest you finish makes a plant grow! 🌱→🌿→🌷→🌸 When all spots are full, finish quests to grow baby plants bigger! Your garden NEVER dies — when you're away, it just sleeps and waits for you! 💚":"Quests water your garden. Plants grow through 4 stages. New seeds appear in empty plots. Your garden never dies — it simply waits. No guilt, no punishment."}</p>
    </>}/>
    {/* Ayah Collection mini */}
    <h3 style={{fontSize:k?15:14,fontWeight:800,color:C.text,margin:"18px 0 8px"}}>{k?"My Ayah Collection! 📿":"Ayah Collection 📿"}</h3>
    <Glass s={{marginBottom:10}} ch={<div style={{display:"flex",alignItems:"center",gap:12}}>
      <Ring v={(col.length/Q.length)*100} sz={48} sk={3.5} co={C.purple} ch={<span style={{fontSize:14,fontWeight:900,color:C.purple}}>{col.length}</span>}/>
      <div><div style={{fontSize:12,fontWeight:800,color:C.text}}>{col.length}/{Q.length} {k?"discovered!":"discovered"}</div>
        <div style={{display:"flex",gap:8,marginTop:3}}>{["common","rare","epic","legendary"].map(r=>{const ct=col.filter(id=>Q.find(a=>a.id===id)?.r===r).length;return ct>0&&<span key={r} style={{fontSize:9,color:RC[r],fontWeight:700}}>{ct} {r}</span>;})}</div>
        <p style={{fontSize:9,color:C.dim,marginTop:3}}>{k?"Finish quests to find rare verses!":"Complete quests for a chance to unlock verses"}</p>
      </div>
    </div>}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
      {Q.map((a,i)=>{const own=col.includes(a.id);const rc=RC[a.r];return<div key={a.id} style={{borderRadius:16,padding:own?10:8,background:own?`${rc}05`:"rgba(255,255,255,0.012)",border:`1px solid ${own?`${rc}12`:"rgba(255,255,255,0.025)"}`,animation:`slideUp 0.25s ease ${i*30}ms both`}}>
        {own?<><span style={{fontSize:7,fontWeight:800,color:rc,textTransform:"uppercase"}}>{a.r}</span><p style={{fontFamily:"'Amiri',serif",fontSize:k?13:11,color:`${rc}a0`,direction:"rtl",textAlign:"right",lineHeight:1.7,margin:"3px 0",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{a.ar}</p><p style={{fontSize:7,color:rc,fontWeight:700}}>{a.s}</p></>:
        <div style={{textAlign:"center",padding:"10px 0"}}><div style={{fontSize:k?22:18,opacity:0.12}}>🔒</div><p style={{fontSize:7,color:C.dim,margin:"3px 0 0"}}>{a.s}</p></div>}
      </div>;})}
    </div>
  </div>;

  // ── JOURNEY SCREEN ──
  const JourneyScr=()=><div style={{padding:"0 16px 100px",animation:"fadeIn 0.35s ease"}}>
    <div style={{padding:"14px 0 10px"}}><h2 style={{fontSize:k?22:23,fontWeight:900,color:C.text,margin:0}}>{k?"My Adventure! 🗺️":"The Journey 🕌"}</h2><p style={{fontSize:11,color:C.mid,margin:"3px 0 0"}}>{k?"Your path only goes FORWARD! Never back! 💪":"Never backward. Only forward, at your pace."}</p></div>
    <div style={{position:"relative",borderRadius:26,overflow:"hidden",marginBottom:14,padding:"24px 18px",textAlign:"center",background:`linear-gradient(145deg,rgba(255,255,255,0.025),${C.gold}05)`,border:`1px solid ${C.gold}08`}}>
      <Geo o={0.035} co={C.gold}/>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{fontSize:k?56:48,marginBottom:6}}>{station.l}</div>
        <h3 style={{fontSize:k?22:20,fontWeight:900,color:C.gold,margin:"0 0 4px"}}>{station.n}</h3>
        <p style={{fontSize:12,fontFamily:"'Amiri',serif",color:C.mid,fontStyle:"italic"}}>{station.d}</p>
        <div style={{marginTop:10,padding:"5px 14px",borderRadius:12,background:`${C.gold}10`,display:"inline-block"}}><span style={{fontSize:11,fontWeight:800,color:C.gold}}>{xp} XP</span></div>
      </div>
    </div>
    {JS.map((st,i)=>{const reached=xp>=st.xp;const cur=st===station;return<div key={i} style={{display:"flex",gap:12,position:"relative",animation:`slideUp 0.3s ease ${i*50}ms both`}}>
      <div style={{width:26,display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
        <div style={{width:26,height:26,borderRadius:13,background:cur?C.gold:reached?C.mint:"rgba(255,255,255,0.03)",border:`2px solid ${cur?C.gold:reached?C.mint:"rgba(255,255,255,0.05)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,boxShadow:cur?`0 0 14px ${C.gold}25`:"none"}}>{reached?<span>{st.l}</span>:<span style={{opacity:0.2}}>·</span>}</div>
        {i<JS.length-1&&<div style={{width:2,flex:1,minHeight:36,background:reached?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.02)"}}/>}
      </div>
      <div style={{flex:1,paddingBottom:14}}>
        <div style={{display:"flex",alignItems:"baseline",gap:5}}><span style={{fontSize:k?14:13,fontWeight:800,color:cur?C.gold:reached?C.text:C.dim}}>{st.n}</span><span style={{fontSize:9,color:C.dim}}>{st.xp} XP</span></div>
        <p style={{fontSize:10,color:reached?C.mid:C.dim,margin:"1px 0 0",fontStyle:"italic"}}>{st.d}</p>
      </div>
    </div>;})}
    {/* Mode switch */}
    <div style={{marginTop:16,textAlign:"center"}}>
      <button onClick={()=>setMode(null)} style={{padding:"8px 20px",borderRadius:14,background:C.glass,border:`1px solid ${C.border}`,color:C.mid,fontSize:11,fontWeight:700,cursor:"pointer"}}>Switch mode ({k?"Adults":"Kids"} ↔ {k?"Kids":"Adults"})</button>
    </div>
  </div>;

  // ── NAV ──
  const nav=[{id:"quest",i:"⚔️",l:k?"Quests":"Quests"},{id:"pray",i:"🤲",l:k?"Ibadah":"Salah"},{id:"garden",i:"🌿",l:k?"Garden":"Garden"},{id:"journey",i:"🕌",l:k?"Map":"Journey"}];

  return<div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.bg,maxWidth:430,margin:"0 auto",fontFamily:"'Nunito',system-ui,sans-serif",color:C.text,position:"relative"}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Nunito:wght@600;700;800;900&display=swap');
      @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      @keyframes popIn{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}
      @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
      @keyframes confetti{0%{transform:translateY(0)rotate(0)scale(1);opacity:1}100%{transform:translateY(-120px)rotate(720deg)scale(0);opacity:0}}
      @keyframes sway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
    `}</style>
    <Loot show={!!loot} rw={loot} onClose={()=>setLoot(null)}/>
    <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch"}}>
      {screen==="quest"&&<QuestScr/>}
      {screen==="pray"&&<PrayFoodScr/>}
      {screen==="garden"&&<GardenScr/>}
      {screen==="journey"&&<JourneyScr/>}
    </div>
    <div style={{height:k?82:76,display:"flex",alignItems:"flex-start",justifyContent:"space-around",background:"rgba(10,19,18,0.96)",backdropFilter:"blur(18px)",borderTop:`1px solid ${C.border}`,paddingTop:10,flexShrink:0}}>
      {nav.map(it=><button key={it.id} onClick={()=>setScreen(it.id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:`all 0.25s ${spr}`,transform:screen===it.id?"scale(1.12)":"scale(1)"}}>
        <div style={{width:k?46:42,height:k?46:42,borderRadius:k?16:14,background:screen===it.id?`${C.mint}14`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:k?22:20}}>{it.i}</div>
        <span style={{fontSize:k?11:10,fontWeight:screen===it.id?800:600,color:screen===it.id?C.mint:C.dim}}>{it.l}</span>
      </button>)}
    </div>
  </div>;
}
