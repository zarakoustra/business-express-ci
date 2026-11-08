import {initializeApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {
getAuth,onAuthStateChanged,signInWithEmailAndPassword,
createUserWithEmailAndPassword,signOut
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {
getFirestore,collection,collectionGroup,addDoc,setDoc,onSnapshot,query,where,
deleteDoc,updateDoc,doc,getDoc,serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const app=initializeApp({
apiKey:"AIzaSyC4DsEYJOfILmytTRfgaPr1QymJGgp-87o",
authDomain:"business-express-ci.firebaseapp.com",
projectId:"business-express-ci",
storageBucket:"business-express-ci.firebasestorage.app",
messagingSenderId:"45446517286",
appId:"1:45446517286:web:1aaf5de2d58429b61e4ce7"
});
const auth=getAuth(app),db=getFirestore(app);

/* ADMIN : même identifiant que dans les règles Firestore */
const ADMIN_UIDS=["rBxaE8OltfeNwvpUivDdqZqhxjl1"];

const CATS=['Téléphones','Électronique','Mode','Maison','Véhicules',
'Immobilier','Services','Livres & formations','Autres'];
const CITIES=['Abidjan','Bouaké','Yamoussoukro','Daloa','San-Pédro','Korhogo','Autre'];
const UNITS=[['','Prix fixe'],['par mois','Par mois'],['par nuit','Par nuit'],['par jour','Par jour']];

let items=[],all=[],reps=[],adm=false,unsubs=[],user=null,photos=[];
let verified=new Set(),blocked=new Set(),sales=[],buyerSales=[],sellerSales=[],revs=[];
const $=id=>document.getElementById(id);
const msg=t=>$('msg').textContent=t;

function el(tag,text,cls){
const e=document.createElement(tag);
if(text!=null)e.textContent=text;
if(cls)e.className=cls;
return e;
}
function opts(id,list,allText){
const s=$(id);
if(allText)s.append(new Option(allText,''));
list.forEach(v=>s.append(new Option(v,v)));
}
opts('fc',CATS,'Toutes les catégories');
opts('fv',CITIES,'Toutes les villes');
opts('ca',CATS);opts('vi',CITIES);
UNITS.forEach(u=>$('un').append(new Option(u[1],u[0])));

const money=i=>Number(i.price).toLocaleString('fr-FR')+' FCFA'+(i.unit?' '+i.unit:'');
function phone(p){
let d=p.replace(/\D/g,'');
if(d.startsWith('00'))d=d.slice(2);
if(d.length===10)d='225'+d;
return /^\d{11,13}$/.test(d)?d:null;
}
const stars=n=>'★'.repeat(n)+'☆'.repeat(5-n);
function rv(uid){
const a=revs.filter(r=>r.sellerUid===uid);
const n=a.length;
return {n,a,avg:n?a.reduce((s,r)=>s+r.rating,0)/n:0};
}

function shrink(file){
return new Promise((ok,ko)=>{
const r=new FileReader();
r.onload=()=>{
const im=new Image();
im.onload=()=>{
const s=Math.min(1,640/Math.max(im.width,im.height));
const c=document.createElement('canvas');
c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);
c.getContext('2d').drawImage(im,0,0,c.width,c.height);
ok(c.toDataURL('image/jpeg',0.6));
};
im.onerror=ko;im.src=r.result;
};
r.onerror=ko;r.readAsDataURL(file);
});
}
function pics(i){
return (Array.isArray(i.photos)&&i.photos.length?i.photos:(i.photo?[i.photo]:[]))
.filter(s=>String(s).startsWith('data:image/'));
}
function pic(i,h){
const a=pics(i);
if(a.length){
const m=document.createElement('img');m.src=a[0];m.alt=i.title||'';
m.style.cssText=`width:100%;height:${h}px;object-fit:cover;border-radius:8px`;
return m;
}
const d=el('div','Pas de photo','mu');
d.style.cssText=`height:${h}px;display:flex;align-items:center;justify-content:center;background:var(--bd);border-radius:8px`;
return d;
}

function render(){
const q=$('q').value.toLowerCase(),c=$('fc').value,v=$('fv').value,l=$('list');
l.replaceChildren();
const f=items.filter(i=>(!c||i.cat===c)&&(!v||i.city===v)&&
((i.title||'')+' '+(i.desc||'')).toLowerCase().includes(q));
if(!f.length){l.append(el('p','Aucune annonce pour l’instant.','mu'));return;}
f.forEach(i=>{
const k=el('button',null,'card');k.type='button';
k.append(pic(i,120),el('b',money(i)),el('span',i.title),
el('span',(i.city||'')+' · '+(i.cat||''),'mu'));
if(verified.has(i.uid))k.append(el('span','✓ Vendeur vérifié','ok'));
const R=rv(i.uid);
if(R.n)k.append(el('span','★ '+R.avg.toFixed(1)+' ('+R.n+' avis)','mu'));
k.onclick=()=>show(i);l.append(k);
});
}

function show(i){
const p=$('detail');p.hidden=false;p.replaceChildren();
const close=el('button','Fermer','btn2');close.type='button';close.onclick=()=>p.hidden=true;p.append(close);
const a=pics(i);
if(a.length>1){
const s=el('div',null,'strip');
a.forEach(u=>{const m=document.createElement('img');m.src=u;m.alt=i.title||'';s.append(m);});
p.append(s);
}else p.append(pic(i,240));

p.append(el('h2',money(i)),el('b',i.title),el('p',i.desc,'mu'),
el('p',(i.city||'')+' · '+(i.cat||'')+' · '+(i.seller||''),'mu'));
if(verified.has(i.uid))p.append(el('p','✓ Vendeur vérifié','ok'));

const R=rv(i.uid);
if(R.n){
p.append(el('p','Avis sur ce vendeur : ★ '+R.avg.toFixed(1)+' ('+R.n+' avis)','ok'));
R.a.slice().sort((x,y)=>(y.t?.seconds||0)-(x.t?.seconds||0)).slice(0,3).forEach(r=>{
const b=el('div',null,'mod');
b.append(el('span',stars(r.rating)));
if(r.comment)b.append(el('span',r.comment,'mu'));
if(adm){
const d=el('button','Supprimer l’avis','btn2');d.type='button';
d.onclick=async()=>{if(confirm('Supprimer cet avis ?'))await deleteDoc(doc(db,'products',r.pid,'reviews',r.id));};
b.append(d);
}
p.append(b);
});
}

if(/^https?:\/\//.test(i.link||'')){
const lk=el('a','Voir le lien','btn2 lnk');
lk.href=i.link;lk.target='_blank';lk.rel='noopener noreferrer';p.append(lk);
}

const contactBtn=el('button','Voir le numéro du vendeur','btn');contactBtn.type='button';
contactBtn.onclick=async()=>{
if(!user){alert('Connecte-toi pour voir le numéro.');$('authp').hidden=false;$('authp').scrollIntoView();return;}
try{
const c=await getDoc(doc(db,'productContacts',i.id));
if(!c.exists()){alert('Numéro indisponible.');return;}
const n=String(c.data().phone||'');
if(!/^\d{11,13}$/.test(n)){alert('Numéro invalide.');return;}
const call=el('a','Appeler','btn lnk');call.href='tel:+'+n;
const wa=el('a','WhatsApp','btn lnk');
wa.href='https://wa.me/'+n+'?text='+encodeURIComponent('Bonjour, je suis intéressé par ton annonce « '+i.title+' » sur ZARATHOUSTRA.');
wa.target='_blank';wa.rel='noopener noreferrer';
contactBtn.replaceWith(call,wa);
}catch(e){alert('Impossible de récupérer le numéro.');}
};
p.append(contactBtn);

if(user&&user.uid!==i.uid){
const buy=el('button','Demander la confirmation de vente','btn2');buy.type='button';
buy.onclick=async()=>{
if(!confirm('As-tu réellement acheté ce produit ? Cette demande sera envoyée au vendeur.'))return;
try{
const saleId=i.id+'_'+user.uid;
const old=await getDoc(doc(db,'sales',saleId));
if(old.exists()){alert('Une demande existe déjà pour cette annonce.');return;}
await setDoc(doc(db,'sales',saleId),{
productId:i.id,buyerUid:user.uid,sellerUid:i.uid,
productTitle:i.title,status:'pending',createdAt:Date.now()
});
alert('Demande envoyée au vendeur.');
}catch(e){alert('Impossible d’envoyer la demande.');}
};
p.append(buy);

const saleId=i.id+'_'+user.uid;
getDoc(doc(db,'sales',saleId)).then(s=>{
if(!s.exists()||s.data().status!=='confirmed')return;
getDoc(doc(db,'products',i.id,'reviews',user.uid)).then(existing=>{
if(existing.exists()){p.append(el('p','Tu as déjà noté cette annonce.','ok'));return;}
const box=el('div',null,'mod');
box.append(el('b','Évaluer le vendeur'));
const rating=document.createElement('select'
                                   );[5,4,3,2,1].forEach(n=>rating.add(new Option(stars(n),n)));
const comment=document.createElement('textarea');
comment.placeholder='Commentaire facultatif (300 caractères maximum)';
comment.maxLength=300;
const submit=el('button','Envoyer mon avis','btn');submit.type='button';
submit.onclick=async()=>{
try{
await setDoc(doc(db,'products',i.id,'reviews',user.uid),{
uid:user.uid,sellerUid:i.uid,rating:Number(rating.value),
comment:comment.value.trim(),t:serverTimestamp()
});
alert('Avis envoyé.');submit.disabled=true;
}catch(e){alert('Avis refusé. Vérifie que la vente est confirmée.');}
};
box.append(rating,comment,submit);p.append(box);
}).catch(()=>{});
}).catch(()=>{});
}

const rp=el('button','Signaler cette annonce','btn2');rp.type='button';
rp.onclick=async()=>{
if(!user){alert('Connecte-toi pour signaler.');return;}
if(!confirm('Signaler cette annonce ?'))return;
try{await addDoc(collection(db,'reports'),{pid:i.id,title:i.title,uid:user.uid,t:Date.now()});alert('Signalement envoyé.');}
catch(e){alert('Impossible d’envoyer le signalement.');}
};
p.append(rp);

if(user&&user.uid===i.uid){
const d=el('button','Supprimer mon annonce','btn2');d.type='button';
d.onclick=async()=>{
if(!confirm('Supprimer cette annonce ?'))return;
try{await deleteDoc(doc(db,'products',i.id));}catch(e){alert('Suppression impossible.');return;}
try{await deleteDoc(doc(db,'productContacts',i.id));}catch(e){}
p.hidden=true;
};
p.append(d);
}
p.append(el('p','⚠️ Vois le produit avant de payer et n’envoie jamais d’argent à l’avance.','safe'));
p.scrollIntoView();
}

function mergeSales(){
sales=[...new Map([...buyerSales,...sellerSales].map(x=>[x.id,x])).values()];
renderSales();
}
function renderSales(){
const panel=$('salesPanel'),list=$('salesList');
panel.hidden=!user;list.replaceChildren();
if(!user)return;
if(!sales.length){list.append(el('p','Aucune vente ou demande pour le moment.','mu'));return;}
sales.forEach(s=>{
const c=el('div',null,'mod');
c.append(el('b',s.productTitle||s.productId),
el('p','Statut : '+(s.status==='confirmed'?'Vente confirmée':'En attente'),'mu'));
if(s.sellerUid===user.uid&&s.status==='pending'){
const b=el('button','Confirmer la vente','btn');b.type='button';
b.onclick=async()=>{
if(!confirm('Confirmer que la vente a réellement eu lieu ?'))return;
try{await updateDoc(doc(db,'sales',s.id),{status:'confirmed',confirmedAt:Date.now()});alert('Vente confirmée.');}
catch(e){alert('Impossible de confirmer cette vente.');}
};
c.append(b);
}
if(s.buyerUid===user.uid&&s.status==='confirmed'){
c.append(el('p','Tu peux maintenant laisser un avis sur cette annonce.','ok'));
const b=el('button','Ouvrir l’annonce pour noter','btn2');b.type='button';
b.onclick=async()=>{
const d=await getDoc(doc(db,'products',s.productId));
if(d.exists())show({id:d.id,...d.data()});
};
c.append(b);
}
list.append(c);
});
}

async function delAd(id){
try{await deleteDoc(doc(db,'products',id));}catch(e){}
try{await deleteDoc(doc(db,'productContacts',id));}catch(e){}
}
function renderAdm(){
const a=$('adm');a.hidden=!adm;if(!adm)return;
a.replaceChildren(el('h2','Modération'));
const pend=all.filter(i=>i.ok!==true);
a.append(el('b','À valider ('+pend.length+')'));
pend.forEach(i=>{
const c=el('div',null,'mod');
c.append(pic(i,100),el('span',money(i)+' · '+i.title+' · '+(i.city||'')+' · '+(i.seller||'')),el('span',i.desc||'','mu'));
const ok=el('button','Approuver','btn');ok.type='button';
ok.onclick=()=>updateDoc(doc(db,'products',i.id),{ok:true});
const no=el('button','Supprimer','btn2');no.type='button';
no.onclick=()=>{if(confirm('Supprimer ?'))delAd(i.id);};
c.append(ok,no);a.append(c);
});
a.append(el('b','Signalements ('+reps.length+')'));
reps.forEach(r=>{
const c=el('div',null,'mod');c.append(el('span','Signalée : '+(r.title||r.pid)));
const del=el('button','Supprimer l’annonce','btn');del.type='button';
del.onclick=async()=>{if(confirm('Supprimer ?')){await delAd(r.pid);await deleteDoc(doc(db,'reports',r.id));}};
const ig=el('button','Ignorer','btn2');ig.type='button';ig.onclick=()=>deleteDoc(doc(db,'reports',r.id));
c.append(del,ig);a.append(c);
});
const sel=new Map();
all.forEach(i=>{if(!i.uid)return;const s=sel.get(i.uid)||{uid:i.uid,name:i.seller,n:0};s.n++;sel.set(i.uid,s);});
a.append(el('b','Vendeurs ('+sel.size+')'));
sel.forEach(s=>{
const c=el('div',null,'mod');
c.append(el('span',(s.name||'?')+' · '+s.n+' annonce(s)'+(verified.has(s.uid)?' · ✓ vérifié':'')+(blocked.has(s.uid)?' · BLOQUÉ':'')));
const v=el('button',verified.has(s.uid)?'Retirer le badge':'Vérifier ce vendeur','btn');v.type='button';
v.onclick=()=>verified.has(s.uid)?deleteDoc(doc(db,'verified',s.uid)):setDoc(doc(db,'verified',s.uid),{t:Date.now()});
const b=el('button',blocked.has(s.uid)?'Débloquer':'Bloquer cet utilisateur','btn2');b.type='button';
b.onclick=()=>{if(blocked.has(s.uid))deleteDoc(doc(db,'blocked',s.uid));else if(confirm('Bloquer cet utilisateur ?'))setDoc(doc(db,'blocked',s.uid),{t:Date.now()});};
c.append(v,b);a.append(c);
});
}

function err(e){
const c=e?.code||'';
$('amsg').textContent=c.includes('email-already')?'Cet e-mail a déjà un compte.':
c.includes('weak')?'Mot de passe trop court (6 minimum).':
c.includes('invalid')?'E-mail ou mot de passe incorrect.':'Une erreur est survenue.';
}

['q','fc','fv'].forEach(k=>$(k).oninput=render);
$('top').onclick=()=>user?($('sellp').hidden=!$('sellp').hidden):($('authp').hidden=!$('authp').hidden);
$('tl').onclick=()=>{$('terms').hidden=false;$('terms').scrollIntoView();};
$('tclose').onclick=()=>$('terms').hidden=true;
$('login').onclick=()=>signInWithEmailAndPassword(auth,$('em').value.trim(),$('pw').value).catch(err);
$('signup').onclick=()=>{
if(!$('cg').checked){$('amsg').textContent='Accepte les conditions pour créer un compte.';return;}
createUserWithEmailAndPassword(auth,$('em').value.trim(),$('pw').value).catch(err);
};
$('logout').onclick=()=>signOut(auth);

onAuthStateChanged(auth,u=>{
user=u;$('amsg').textContent='';
unsubs.forEach(f=>f());unsubs=[];
adm=!!(u&&ADMIN_UIDS.includes(u.uid));
all=[];reps=[];blocked=new Set();sales=[];buyerSales=[];sellerSales=[];
renderAdm();
$('top').textContent=u?'Vendre':'Connexion';
$('authp').hidden=true;$('sellp').hidden=!u;$('salesPanel').hidden=!u;
if(u){
$('who').textContent='Compte connecté ✓';$('uidp').textContent=u.uid;
unsubs.push(onSnapshot(query(collection(db,'sales'),where('buyerUid','==',u.uid)),s=>{
buyerSales=s.docs.map(d=>({id:d.id,...d.data()}));mergeSales();
},()=>{}));
unsubs.push(onSnapshot(query(collection(db,'sales'),where('sellerUid','==',u.uid)),s=>{
sellerSales=s.docs.map(d=>({id:d.id,...d.data()}));mergeSales();
},()=>{}));
if(adm){
unsubs.push(onSnapshot(collection(db,'reports'),s=>{reps=s.docs.map(d=>({id:d.id,...d.data()}));renderAdm();},()=>{}));
unsubs.push(onSnapshot(collection(db,'products'),s=>{all=s.docs.map(d=>({id:d.id,...d.data()}));renderAdm();},()=>{}));
unsubs.push(onSnapshot(collection(db,'blocked'),s=>{blocked=new Set(s.docs.map(d=>d.id));renderAdm();},()=>{}));
}
}
render();renderSales();
});

$('ph').onchange=async e=>{
photos=[];$('pv').replaceChildren();
const fl=Array.from(e.target.files);
if(fl.length>4)msg('4 photos maximum.');
for(const f of fl.slice(0,4)){
try{const d=await shrink(f);photos.push(d);const m=document.createElement('img');m.src=d;$('pv').append(m);}
catch(x){msg('Une photo est illisible.');}
}
};

$('go').onclick=async()=>{
const v=k=>$(k).value.trim(),price=parseInt(v('pr'),10),n=phone(v('tel')),lk=v('li');
if(!user)return;
if(!v('ti')||!(price>0)){msg('Mets un titre et un prix.');return;}
if(!n){msg('Numéro invalide (10 chiffres, ex : 0707070707).');return;}
if(lk&&!/^https?:\/\//.test(lk)){msg('Le lien doit commencer par https://');return;}
try{
const annonce=await addDoc(collection(db,'products'),{
title:v('ti'),desc:v('de'),price,unit:$('un').value,cat:$('ca').value,
city:$('vi').value,seller:v('se')||'Vendeur',link:lk,photos,photo:photos[0]||'',
uid:user.uid,ok:false,t:Date.now()
});
await setDoc(doc(db,'productContacts',annonce.id),{phone:n,uid:user.uid});
msg('Annonce envoyée ✓ Elle sera visible après validation.');
['ti','de','pr','se','tel','li'].forEach(k=>$(k).value='');
$('ph').value='';$('pv').replaceChildren();photos=[];
}catch(e){
msg(e&&e.code==='permission-denied'?'Ton compte ne peut pas publier. Contacte l’administrateur.':'Publication impossible. Essaie avec moins de photos.');
}
};

onSnapshot(collection(db,'verified'),s=>{verified=new Set(s.docs.map(d=>d.id));render();renderAdm();},()=>{});
onSnapshot(collectionGroup(db,'reviews'),s=>{
revs=s.docs.map(d=>({id:d.id,pid:d.ref.parent.parent.id,...d.data()}));render();
},()=>{});
onSnapshot(query(collection(db,'products'),where('ok','==',true)),s=>{
items=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.t||0)-(a.t||0));
render();
},()=>{$('list').replaceChildren(el('p','Impossible de charger les annonces.','mu'));});

render();
