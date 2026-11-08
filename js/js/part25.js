import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getFirestore,collection,collectionGroup,query,where,getDocs,getDoc,setDoc,updateDoc,deleteDoc,doc,onSnapshot} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
const auth=getAuth(getApp()),db=getFirestore(getApp());
const $=id=>document.getElementById(id);
const ADMIN='rBxaE8OltfeNwvpUivDdqZqhxjl1';
const DOM='@zarakoustra.app';
function h(tag,text,cls){const e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e;}

const st=document.createElement('style');
st.textContent='#xfus{display:none}body[data-tab="acc"][data-sub="xadm"] #xfus:not([hidden]){display:flex}#xfus .lg{white-space:pre-wrap;font-size:13px}';
document.head.append(st);

/* espace admin */
const sec=h('section');sec.id='xfus';sec.hidden=true;
const box=h('div');box.style.cssText='display:flex;flex-direction:column;gap:8px';
const a=document.createElement('input');a.placeholder='Ancien code (A)';
const b=document.createElement('input');b.placeholder='Nouveau code (B)';
const go=h('button','Fusionner A vers B (manuel)','btn2');go.type='button';
const lg=h('p',null,'mu lg');
sec.append(h('h2','Fusion de comptes'),
h('b','Demandes en attente'),box,
h('b','Fusion manuelle'),a,b,go,lg);
$('adm').after(sec);
const log=t=>{lg.textContent+=t+'\n';};

async function merge(A,B){
const ps=await getDocs(query(collection(db,'products'),where('uid','==',A)));
for(const d of ps.docs){
await updateDoc(d.ref,{uid:B});
try{await updateDoc(doc(db,'productContacts',d.id),{uid:B});}catch(e){}
}
log('Annonces déplacées : '+ps.size);

const rv=(await getDocs(collectionGroup(db,'reviews'))).docs.filter(d=>d.data().sellerUid===A);
for(const d of rv)await updateDoc(d.ref,{sellerUid:B});
log('Avis déplacés : '+rv.length);

const s1=await getDocs(query(collection(db,'sales'),where('sellerUid','==',A)));
for(const d of s1.docs)await updateDoc(d.ref,{sellerUid:B});
const s2=await getDocs(query(collection(db,'sales'),where('buyerUid','==',A)));
for(const d of s2.docs){const x=d.data();await setDoc(doc(db,'sales',x.productId+'_'+B),{...x,buyerUid:B});await deleteDoc(d.ref);}
log('Ventes et achats : '+(s1.size+s2.size));

let c=0;
for(const f of ['buyerUid','sellerUid']){
const q=await getDocs(query(collection(db,'chats'),where(f,'==',A)));
for(const d of q.docs){await updateDoc(d.ref,{[f]:B});c++;}
}
log('Conversations : '+c);

const f1=await getDocs(query(collection(db,'follows'),where('sellerUid','==',A)));
for(const d of f1.docs){const x=d.data();await setDoc(doc(db,'follows',B+'_'+x.followerUid),{...x,sellerUid:B});await deleteDoc(d.ref);}
const f2=await getDocs(query(collection(db,'follows'),where('followerUid','==',A)));
for(const d of f2.docs){const x=d.data();await setDoc(doc(db,'follows',x.sellerUid+'_'+B),{...x,followerUid:B});await deleteDoc(d.ref);}
log('Abonnés / abonnements : '+(f1.size+f2.size));

const v=await getDoc(doc(db,'verified',A));
if(v.exists()){await setDoc(doc(db,'verified',B),{t:Date.now()});await deleteDoc(v.ref);log('Badge vérifié déplacé');}
log('✅ Fusion terminée');
}
const errTxt=e=>e&&e.code==='permission-denied'?'règles Firestore non publiées ou incomplètes.':(e&&e.message)||'inconnue';

go.onclick=async()=>{
const A=a.value.trim(),B=b.value.trim();
if(!A||!B||A===B){lg.textContent='Écris deux codes différents.';return;}
if(!confirm('Fusionner tout ce qui est à A vers B ?'))return;
go.disabled=true;lg.textContent='';
try{await merge(A,B);}catch(e){log('❌ Erreur : '+errTxt(e));}
go.disabled=false;
};

function drawReq(docs){
box.replaceChildren();
if(!docs.length){box.append(h('p','Aucune demande pour le moment.','mu'));return;}
docs.forEach(d=>{
const r=d.data(),B=d.id;
const c=h('div',null,'mod');
c.append(h('b','Numéro : '+r.phone),h('span','Nouveau code B : '+B,'mu'));
const run=h('button','Fusionner','btn');run.type='button';
run.onclick=async()=>{
const p=await getDoc(doc(db,'phones',r.phone));
if(!p.exists()){alert('Ancien code introuvable.');return;}
const A=p.data().uid;
if(!confirm('Fusionner l’ancien compte vers le nouveau ?'))return;
run.disabled=true;lg.textContent='';
try{await merge(A,B);await updateDoc(p.ref,{uid:B});await deleteDoc(d.ref);}
catch(e){log('❌ Erreur : '+errTxt(e));run.disabled=false;}
};
const ig=h('button','Ignorer','btn2');ig.type='button';
ig.onclick=()=>deleteDoc(d.ref);
c.append(run,ig);box.append(c);
});
}

let unsub=null;
onAuthStateChanged(auth,async u=>{
if(unsub){unsub();unsub=null;}
const adm=!!(u&&u.uid===ADMIN);
sec.hidden=!adm;
if(adm)unsub=onSnapshot(collection(db,'mergeRequests'),s=>drawReq(s.docs),()=>{});

/* enregistre le numéro, ou crée une demande de fusion */
if(!u||!u.email||!u.email.endsWith(DOM))return;
const n=u.email.slice(0,-DOM.length);
try{await setDoc(doc(db,'phones',n),{uid:u.uid,t:Date.now()});return;}catch(e){}
const fresh=Date.now()-new Date(u.metadata.creationTime).getTime()<120000;
if(fresh){try{await setDoc(doc(db,'mergeRequests',u.uid),{phone:n,t:Date.now()});}catch(e){}}
});
