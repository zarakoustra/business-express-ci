import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getFirestore,collection,query,where,onSnapshot,deleteDoc,doc} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const auth=getAuth(getApp()),db=getFirestore(getApp());
const $=id=>document.getElementById(id);
function h(tag,text,cls){
const e=document.createElement(tag);
if(text!=null)e.textContent=text;
if(cls)e.className=cls;
return e;
}
const money=i=>Number(i.price).toLocaleString('fr-FR')+' FCFA'+(i.unit?' '+i.unit:'');

const st=document.createElement('style');
st.textContent='#xgrid{display:none;grid-template-columns:1fr 1fr;gap:10px}'+
'body[data-tab="acc"] #xgrid{display:grid}'+
'body:not([data-tab="acc"]) #xmine{display:none!important}';
document.head.append(st);

const grid=h('div');grid.id='xgrid';
const mine=h('section');mine.id='xmine';mine.hidden=true;
$('xacc').after(grid,mine);

const card=h('button',null,'card');card.type='button';
const cardTitle=h('b','📋 Mes annonces');
card.append(cardTitle);
card.onclick=()=>{mine.hidden=!mine.hidden;if(!mine.hidden)mine.scrollIntoView();};
grid.append(card);

let unsub=null;
function draw(list,user){
mine.replaceChildren(h('h2','Mes annonces'));
cardTitle.textContent='📋 Mes annonces ('+list.length+')';
if(!user){mine.append(h('p','Connecte-toi pour voir tes annonces.','mu'));return;}
if(!list.length){mine.append(h('p','Tu n’as pas encore publié d’annonce.','mu'));return;}
list.forEach(i=>{
const c=h('div',null,'mod');
c.append(
h('b',i.title||'Sans titre'),
h('span',money(i)),
h('span',(i.city||'')+' · '+(i.cat||''),'mu'),
h('span',i.ok===true?'✅ En ligne':'⏳ En attente de validation',i.ok===true?'ok':'mu')
);
const del=h('button','Supprimer','btn2');del.type='button';
del.onclick=async()=>{
if(!confirm('Supprimer cette annonce ?'))return;
try{await deleteDoc(doc(db,'products',i.id));}catch(e){alert('Suppression impossible.');return;}
try{await deleteDoc(doc(db,'productContacts',i.id));}catch(e){}
};
c.append(del);
mine.append(c);
});
}

onAuthStateChanged(auth,u=>{
if(unsub){unsub();unsub=null;}
draw([],u);
if(!u)return;
unsub=onSnapshot(query(collection(db,'products'),where('uid','==',u.uid)),s=>{
draw(s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.t||0)-(a.t||0)),u);
},()=>{mine.append(h('p','Impossible de charger tes annonces.','mu'));});
});
