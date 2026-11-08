import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getFirestore,collection,query,where,onSnapshot,getDoc,doc} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const auth=getAuth(getApp()),db=getFirestore(getApp());
const $=id=>document.getElementById(id);
function h(tag,text,cls){
const e=document.createElement(tag);
if(text!=null)e.textContent=text;
if(cls)e.className=cls;
return e;
}
const money=i=>Number(i.price).toLocaleString('fr-FR')+' FCFA'+(i.unit?' '+i.unit:'');
const base=SITE_URL;
const sid=new URLSearchParams(location.search).get('v');

const st=document.createElement('style');
st.textContent='#xprof{display:none}'+
'body.xprofmode #xprof{display:flex}'+
'body:not([data-tab="home"]) #xprof{display:none!important}'+
'body.xprofmode :is(#q,main>.row,#list,#tl,#terms){display:none!important}'+
'#xprof .g{display:grid;grid-template-columns:1fr 1fr;gap:10px}';
document.head.append(st);

/* bouton de partage dans Mon compte */
let me=null,items=[];
const card=h('button',null,'card');card.type='button';
card.append(h('b','📤 Partager mon profil'));
card.onclick=()=>{
if(!me){alert('Connecte-toi pour partager ton profil.');return;}
if(!items.some(x=>x.uid===me.uid)){
alert('Ton profil sera vide tant qu’une annonce n’est pas validée.');
}
const link=base+'?v='+me.uid;
window.open('https://wa.me/?text='+encodeURIComponent('Découvre ce que je vends sur Zarakoustra 👉 '+link),'_blank');
};
$('xgrid').append(card);

onAuthStateChanged(auth,u=>{me=u;});
onSnapshot(query(collection(db,'products'),where('ok','==',true)),s=>{
items=s.docs.map(d=>({id:d.id,...d.data()}));
},()=>{});

/* page profil vendeur */
if(sid){
document.body.classList.add('xprofmode');
const sec=h('section');sec.id='xprof';
$('detail').before(sec);
sec.append(h('h2','Profil vendeur'),h('p','Chargement…','mu'));

let isVerified=false;
getDoc(doc(db,'verified',sid)).then(d=>{isVerified=d.exists();}).catch(()=>{});

function photo(i){
const a=(Array.isArray(i.photos)&&i.photos.length?i.photos:(i.photo?[i.photo]:[]))
.filter(s=>String(s).startsWith('data:image/'));
if(a.length){
const m=document.createElement('img');
m.src=a[0];m.alt=i.title||'';
m.style.cssText='width:100%;height:120px;object-fit:cover;border-radius:8px';
return m;
}
const d=h('div','Pas de photo','mu');
d.style.cssText='height:120px;display:flex;align-items:center;justify-content:center;background:var(--bd);border-radius:8px';
return d;
}

onSnapshot(query(collection(db,'products'),where('uid','==',sid),where('ok','==',true)),s=>{
const l=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.t||0)-(a.t||0));
sec.replaceChildren();
const back=h('button','← Voir tout le site','btn2');back.type='button';
back.onclick=()=>document.body.classList.remove('xprofmode');
sec.append(back);
sec.append(h('h2','👤 '+(l[0]?l[0].seller:'Vendeur')));
if(isVerified)sec.append(h('p','✓ Vendeur vérifié','ok'));
if(!l.length){
sec.append(h('p','Ce vendeur n’a pas encore d’annonce en ligne.','mu'));
return;
}
sec.append(h('p',l.length+' annonce(s) en ligne','mu'));
const g=h('div',null,'g');
l.forEach(i=>{
const b=h('button',null,'card');b.type='button';
b.append(photo(i),h('b',money(i)),h('span',i.title),h('span',(i.city||'')+' · '+(i.cat||''),'mu'));
b.onclick=()=>{
document.body.classList.remove('xprofmode');
const c=[...$('list').children].find(x=>x.textContent.includes(i.title)&&x.textContent.includes(money(i)));
if(c)c.click();
};
g.append(b);
});
sec.append(g);
},()=>{
sec.replaceChildren(h('h2','Profil vendeur'),h('p','Impossible de charger ce profil.','mu'));
});

document.querySelectorAll('#xnav button').forEach(b=>{
b.addEventListener('click',()=>document.body.classList.remove('xprofmode'));
});
  }
