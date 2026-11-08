import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getFirestore,collection,query,where,onSnapshot,setDoc,deleteDoc,doc} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const auth=getAuth(getApp()),db=getFirestore(getApp());
const $=id=>document.getElementById(id);
function h(tag,text,cls){
const e=document.createElement(tag);
if(text!=null)e.textContent=text;
if(cls)e.className=cls;
return e;
}
const money=i=>Number(i.price).toLocaleString('fr-FR')+' FCFA'+(i.unit?' '+i.unit:'');
function mask(e){
const p=String(e||'').split('@');
return p[1]?p[0].slice(0,2)+'***@'+p[1]:'Abonné';
}

const st=document.createElement('style');
st.textContent='body:not([data-tab="acc"]) #xfol{display:none!important}';
document.head.append(st);

const box=h('section');box.id='xfol';box.hidden=true;
($('xnotif')||$('xfaq')||$('xrev')||$('xmine')||$('xgrid')).after(box);

const card=h('button',null,'card');card.type='button';
const cardTitle=h('b','👥 Abonnés');
card.append(cardTitle);
card.onclick=()=>{
['xmine','xrev','xfaq','xnotif'].forEach(k=>{if($(k))$(k).hidden=true;});
box.hidden=!box.hidden;
if(!box.hidden)box.scrollIntoView();
};
$('xgrid').append(card);

let user=null,items=[],followers=[],myFollows=new Set(),subs=[];

function draw(){
box.replaceChildren(h('h2','Mes abonnés'));
cardTitle.textContent='👥 Abonnés ('+followers.length+')';
if(!user){box.append(h('p','Connecte-toi pour voir tes abonnés.','mu'));return;}
if(!followers.length){box.append(h('p','Personne ne te suit pour le moment. Publie de bonnes annonces 😉','mu'));return;}
followers.slice().sort((a,b)=>(b.t||0)-(a.t||0)).forEach(f=>{
const c=h('div',null,'mod');
c.append(h('b','Abonné'),
h('span','Depuis le '+new Date(f.t||0).toLocaleDateString('fr-FR'),'mu'));
box.append(c);
});
}

/* bouton Suivre dans le détail d'une annonce */
const det=$('detail');
new MutationObserver(()=>{
if(det.hidden||det.querySelector('.xfol'))return;
const t=[...det.children].find(e=>e.tagName==='B');
const m=det.querySelector(':scope>h2');
if(!t||!m)return;
const i=items.find(x=>x.title===t.textContent&&money(x)===m.textContent);
if(!i||(user&&user.uid===i.uid))return;
const b=h('button',null,'btn2 xfol');b.type='button';
const upd=()=>{b.textContent=myFollows.has(i.uid)?'✓ Abonné (se désabonner)':'➕ Suivre ce vendeur';};
upd();
b.onclick=async()=>{
if(!user){alert('Connecte-toi pour suivre un vendeur.');return;}
const id=i.uid+'_'+user.uid;
b.disabled=true;
try{
if(myFollows.has(i.uid)){await deleteDoc(doc(db,'follows',id));myFollows.delete(i.uid);}
else{await setDoc(doc(db,'follows',id),{sellerUid:i.uid,followerUid:user.uid,followerEmail:mask(user.email),t:Date.now()});myFollows.add(i.uid);}
upd();
}catch(e){alert('Action impossible. Réessaie.');}
b.disabled=false;
};
t.after(b);
}).observe(det,{childList:true});

onSnapshot(query(collection(db,'products'),where('ok','==',true)),s=>{
items=s.docs.map(d=>({id:d.id,...d.data()}));
},()=>{});

onAuthStateChanged(auth,u=>{
subs.forEach(f=>f());subs=[];
user=u;followers=[];myFollows=new Set();
draw();
if(!u)return;
subs.push(
onSnapshot(query(collection(db,'follows'),where('sellerUid','==',u.uid)),s=>{
followers=s.docs.map(d=>({id:d.id,...d.data()}));draw();
},()=>{}),
onSnapshot(query(collection(db,'follows'),where('followerUid','==',u.uid)),s=>{
myFollows=new Set(s.docs.map(d=>d.data().sellerUid));
},()=>{})
);
});
