import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getFirestore,collection,query,where,onSnapshot,doc,getDoc,setDoc} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const auth=getAuth(getApp()),db=getFirestore(getApp());
const $=id=>document.getElementById(id);
const base=SITE_URL;
const money=i=>Number(i.price).toLocaleString('fr-FR')+' FCFA'+(i.unit?' '+i.unit:'');
const img=$('pfimg');
const DEF="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23fff'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%233E5C76'/%3E%3Cellipse cx='20' cy='36' rx='13' ry='10' fill='%233E5C76'/%3E%3C/svg%3E";

/* lecture d'une photo (avec mémoire) */
const cache=new Map();
async function avatar(uid){
if(cache.has(uid))return cache.get(uid);
try{
const d=await getDoc(doc(db,'avatars',uid));
const p=d.exists()?d.data().photo:null;
cache.set(uid,p);
return p;
}catch(e){return null;}
}

/* ma photo dans l'en-tête : celle du compte connecté */
onAuthStateChanged(auth,async u=>{
if(!u){
img.src=DEF;
try{localStorage.removeItem('pfphoto');}catch(e){}
return;
}
const p=await avatar(u.uid);
img.src=p||DEF;
});

/* il faut être connecté pour changer sa photo */
document.querySelector('.pf').addEventListener('click',e=>{
if(auth.currentUser)return;
e.preventDefault();e.stopPropagation();
alert('Connecte-toi pour ajouter ta photo de profil.');
const b=document.querySelector('#xnav button[data-k="acc"]');
if(b)b.click();
},true);

/* enregistrement en ligne quand on appuie sur Enregistrer */
$('pfok').addEventListener('click',async()=>{
const u=auth.currentUser;
if(!u)return;
let d=img.src;
if(!d.startsWith('data:image/jpeg'))return;
const cv=$('pfcv');
for(const q of [0.6,0.4]){
if(d.length<=55000)break;
d=cv.toDataURL('image/jpeg',q);
}
img.src=d;
try{
await setDoc(doc(db,'avatars',u.uid),{photo:d,t:Date.now()});
cache.set(u.uid,d);
}catch(e){
alert('Ta photo n’a pas pu être enregistrée en ligne. Réessaie.');
}
});

/* annonces (pour retrouver le vendeur) */
let items=[];
onSnapshot(query(collection(db,'products'),where('ok','==',true)),s=>{
items=s.docs.map(d=>({id:d.id,...d.data()}));
},()=>{});

/* photo du vendeur dans le détail d'une annonce */
const det=$('detail');
new MutationObserver(()=>{
if(det.hidden||det.querySelector('.xsel'))return;
const t=[...det.children].find(e=>e.tagName==='B');
const m=det.querySelector(':scope>h2');
if(!t||!m)return;
const i=items.find(x=>x.title===t.textContent&&money(x)===m.textContent);
if(!i||!i.uid)return;
const a=document.createElement('a');a.className='xsel';
a.href=base+'?v='+encodeURIComponent(i.uid);
a.style.cssText='display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit';
const im=document.createElement('img');im.src=DEF;im.alt='';
im.style.cssText='width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid #000;background:#fff';
const tx=document.createElement('span');tx.textContent='Voir le profil du vendeur ›';
tx.style.cssText='font-weight:700;font-size:14px';
a.append(im,tx);
m.before(a);
avatar(i.uid).then(p=>{if(p)im.src=p;});
}).observe(det,{childList:true});

/* photo sur la page du profil vendeur */
const sid=new URLSearchParams(location.search).get('v');
const sec=$('xprof');
if(sid&&sec){
let av=null;
const put=()=>{
if(!av||sec.querySelector('.xav'))return;
const h2=[...sec.children].find(e=>e.tagName==='H2'&&e.textContent.startsWith('👤'));
if(!h2)return;
const im=document.createElement('img');im.className='xav';im.src=av;im.alt='';
im.style.cssText='width:96px;height:96px;border-radius:50%;object-fit:cover;border:3px solid #000;align-self:center';
h2.before(im);
};
avatar(sid).then(p=>{av=p;put();});
new MutationObserver(put).observe(sec,{childList:true});
  }
