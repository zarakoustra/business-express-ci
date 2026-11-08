import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getFirestore,collection,query,where,getDocs,getDoc,doc} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const auth=getAuth(getApp()),db=getFirestore(getApp());
const $=id=>document.getElementById(id);
const DISMISS='zk_onb_hidden';

const st=document.createElement('style');
st.textContent=`
#xonb{border:2px solid #000;border-radius:14px;background:#fff;box-shadow:4px 4px 0 #000}
#xonb .xstep{display:flex;align-items:center;gap:10px;font-size:15px}
#xonb .xdot{width:26px;height:26px;border-radius:50%;border:2px solid #000;display:flex;align-items:center;justify-content:center;font-size:14px;flex:none}
#xonb .xdot.ok{background:#5BB8EA}
#xonb .xbar{height:10px;border-radius:6px;background:var(--bd);overflow:hidden;border:1px solid #000}
#xonb .xbar i{display:block;height:100%;background:#0050FF;width:0}
body:not([data-tab="home"]) #xonb{display:none!important}
.xempty{text-align:center;padding:16px 8px}
`;
document.head.append(st);

const box=document.createElement('section');
box.id='xonb';box.hidden=true;
$('q').before(box);

let user=null;

async function check(u){
const [av,pr,ps]=await Promise.all([
getDoc(doc(db,'avatars',u.uid)).then(d=>d.exists()).catch(()=>false),
getDoc(doc(db,'profiles',u.uid)).then(d=>d.exists()&&!!d.data().name).catch(()=>false),
getDocs(query(collection(db,'products'),where('uid','==',u.uid))).then(s=>s.size>0).catch(()=>false)
]);
return [
{ok:av,txt:'Ajouter ta photo de profil'},
{ok:pr,txt:'Choisir ton nom'},
{ok:ps,txt:'Publier ta première annonce'}
];
}

async function draw(){
if(!user||localStorage.getItem(DISMISS)==='1'){box.hidden=true;return;}
const steps=await check(user);
const n=steps.filter(s=>s.ok).length;
if(n===steps.length){box.hidden=true;return;}
box.hidden=false;
box.replaceChildren();

const t=document.createElement('b');
t.textContent='Bienvenue sur ZARAKOUSTRA 👋';
const p=document.createElement('p');
p.className='mu';
p.textContent='Termine ces 3 étapes pour bien démarrer ('+n+'/3).';
const bar=document.createElement('div');bar.className='xbar';
const fill=document.createElement('i');fill.style.width=(n/3*100)+'%';
bar.append(fill);
box.append(t,p,bar);

steps.forEach(s=>{
const r=document.createElement('div');r.className='xstep';
const d=document.createElement('span');
d.className='xdot'+(s.ok?' ok':'');
d.textContent=s.ok?'✓':'';
const x=document.createElement('span');x.textContent=s.txt;
r.append(d,x);
box.append(r);
});

const hide=document.createElement('button');
hide.type='button';hide.className='btn2';hide.textContent='Masquer ce guide';
hide.onclick=()=>{localStorage.setItem(DISMISS,'1');box.hidden=true;};
box.append(hide);
}

onAuthStateChanged(auth,u=>{user=u;draw();});
new MutationObserver(()=>{
if(document.body.dataset.tab==='home')draw();
}).observe(document.body,{attributes:true,attributeFilter:['data-tab']});

/* message plus engageant quand une liste est vide */
new MutationObserver(()=>{
const p=[...$('list').children].find(e=>e.tagName==='P'&&e.textContent.startsWith('Aucune annonce pour'));
if(!p)return;
p.className='xempty mu';
p.replaceChildren();
const t=document.createElement('b');t.textContent='Pas encore d’annonce ici';
const s=document.createElement('p');s.className='mu';
s.textContent='Sois le premier à publier dans cette catégorie ou modifie tes filtres.';
const b=document.createElement('button');
b.type='button';b.className='btn';b.textContent='➕ Publier une annonce';
b.onclick=()=>$('top').click();
p.append(t,s,b);
}).observe($('list'),{childList:true});
