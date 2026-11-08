import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getFirestore,collectionGroup,onSnapshot} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const auth=getAuth(getApp()),db=getFirestore(getApp());
const $=id=>document.getElementById(id);
function h(tag,text,cls){
const e=document.createElement(tag);
if(text!=null)e.textContent=text;
if(cls)e.className=cls;
return e;
}
const stars=n=>'★'.repeat(n)+'☆'.repeat(5-n);

const st=document.createElement('style');
st.textContent='body:not([data-tab="acc"]) #xrev{display:none!important}';
document.head.append(st);

const rev=h('section');rev.id='xrev';rev.hidden=true;
($('xmine')||$('xgrid')).after(rev);

const card=h('button',null,'card');card.type='button';
const cardTitle=h('b','⭐ Avis');
card.append(cardTitle);
card.onclick=()=>{
if($('xmine'))$('xmine').hidden=true;
rev.hidden=!rev.hidden;
if(!rev.hidden)rev.scrollIntoView();
};
$('xgrid').append(card);

let unsub=null;
function draw(list,user){
rev.replaceChildren(h('h2','Avis reçus'));
cardTitle.textContent='⭐ Avis ('+list.length+')';
if(!user){rev.append(h('p','Connecte-toi pour voir tes avis.','mu'));return;}
if(!list.length){rev.append(h('p','Aucun avis pour le moment. Les avis arrivent après une vente confirmée.','mu'));return;}
const avg=list.reduce((s,r)=>s+(r.rating||0),0)/list.length;
rev.append(h('p','Note moyenne : ★ '+avg.toFixed(1)+' / 5 ('+list.length+' avis)','ok'));
list.forEach(r=>{
const c=h('div',null,'mod');
c.append(h('b',stars(r.rating||0)));
if(r.comment)c.append(h('span',r.comment));
if(r.t&&r.t.seconds)c.append(h('span',new Date(r.t.seconds*1000).toLocaleDateString('fr-FR'),'mu'));
rev.append(c);
});
}

onAuthStateChanged(auth,u=>{
if(unsub){unsub();unsub=null;}
draw([],u);
if(!u)return;
unsub=onSnapshot(collectionGroup(db,'reviews'),s=>{
const l=s.docs.map(d=>({id:d.id,...d.data()}))
.filter(r=>r.sellerUid===u.uid)
.sort((a,b)=>(b.t?.seconds||0)-(a.t?.seconds||0));
draw(l,u);
},()=>{rev.append(h('p','Impossible de charger tes avis.','mu'));});
});
