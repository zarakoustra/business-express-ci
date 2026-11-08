import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getFirestore,collection,query,where,onSnapshot} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const auth=getAuth(getApp()),db=getFirestore(getApp());
const $=id=>document.getElementById(id);
function h(tag,text,cls){
const e=document.createElement(tag);
if(text!=null)e.textContent=text;
if(cls)e.className=cls;
return e;
}

const st=document.createElement('style');
st.textContent='body:not([data-tab="acc"]) #xnotif{display:none!important}'+
'#xgrid .card{position:relative}'+
'#xgrid .nbadge{position:absolute;top:6px;right:6px;min-width:20px;height:20px;padding:0 5px;border-radius:10px;background:#E53935;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center}';
document.head.append(st);

const box=h('section');box.id='xnotif';box.hidden=true;
($('xfaq')||$('xrev')||$('xmine')||$('xgrid')).after(box);

const card=h('button',null,'card');card.type='button';
card.append(h('b','🔔 Notifications'));
card.onclick=()=>{
['xmine','xrev','xfaq'].forEach(k=>{if($(k))$(k).hidden=true;});
box.hidden=!box.hidden;
if(!box.hidden){draw();box.scrollIntoView();}
};
$('xgrid').append(card);

let uid=null,buyer=[],seller=[],subs=[];

function mine(){
return [...new Map([...buyer,...seller].map(x=>[x.id,x])).values()];
}
function unreadCount(){
try{return Object.keys(JSON.parse(localStorage.getItem('xunread_'+uid))||{}).length;}
catch(e){return 0;}
}
function items(){
const l=[];
const n=unreadCount();
if(n)l.push({txt:'💬 '+n+' conversation(s) avec un nouveau message',act:'Ouvrir les messages',fn:()=>document.querySelector('#xnav button[data-k="msg"]').click(),urgent:n});
mine().forEach(s=>{
if(s.sellerUid===uid&&s.status==='pending')
l.push({txt:'🛒 Demande de confirmation de vente : '+(s.productTitle||'annonce'),act:'Voir mes ventes',fn:()=>document.getElementById('salesPanel').scrollIntoView(),urgent:1});
if(s.buyerUid===uid&&s.status==='confirmed')
l.push({txt:'✅ Vente confirmée : '+(s.productTitle||'annonce')+'. Tu peux noter le vendeur.',urgent:0});
});
return l;
}
function draw(){
box.replaceChildren(h('h2','Notifications'));
const old=card.querySelector('.nbadge');if(old)old.remove();
if(!uid){box.append(h('p','Connecte-toi pour voir tes notifications.','mu'));return;}
const l=items();
const u=l.reduce((s,x)=>s+(x.urgent||0),0);
if(u){card.append(h('i',String(u),'nbadge'));}
if(!l.length){box.append(h('p','Rien de nouveau pour le moment.','mu'));return;}
l.forEach(x=>{
const c=h('div',null,'mod');
c.append(h('span',x.txt));
if(x.act){const b=h('button',x.act,'btn2');b.type='button';b.onclick=x.fn;c.append(b);}
box.append(c);
});
}

onAuthStateChanged(auth,u=>{
subs.forEach(f=>f());subs=[];
buyer=[];seller=[];uid=u?u.uid:null;
draw();
if(!u)return;
subs.push(
onSnapshot(query(collection(db,'sales'),where('buyerUid','==',u.uid)),s=>{buyer=s.docs.map(d=>({id:d.id,...d.data()}));draw();},()=>{}),
onSnapshot(query(collection(db,'sales'),where('sellerUid','==',u.uid)),s=>{seller=s.docs.map(d=>({id:d.id,...d.data()}));draw();},()=>{})
);
});

/* met à jour le badge quand les messages changent */
new MutationObserver(draw).observe($('xnav'),{childList:true,subtree:true});
