import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,onAuthStateChanged,sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {
getFirestore,collection,query,where,orderBy,onSnapshot,addDoc,setDoc,updateDoc,doc
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const app=getApp(),auth=getAuth(app),db=getFirestore(app);
const $=id=>document.getElementById(id);

function h(tag,text,cls){
const e=document.createElement(tag);
if(text!=null)e.textContent=text;
if(cls)e.className=cls;
return e;
}
function btn(text,cls,fn){
const b=h('button',text,cls);
b.type='button';
b.onclick=fn;
return b;
}
const money=i=>Number(i.price).toLocaleString('fr-FR')+' FCFA'+(i.unit?' '+i.unit:'');

const st=document.createElement('style');
st.textContent=`
body{padding-bottom:calc(68px + env(safe-area-inset-bottom,0px))}
#xnav{position:fixed;left:0;right:0;bottom:0;z-index:50;display:flex;background:#fff;
border-top:1px solid var(--bd);padding-bottom:env(safe-area-inset-bottom,0px)}
#xnav button{flex:1;min-height:58px;background:none;border:0;border-radius:0;color:var(--mu);
font-size:12px;font-weight:600;display:flex;flex-direction:column;align-items:center;
justify-content:center;gap:2px;padding:0}
#xnav button span{font-size:20px;line-height:1}
#xnav button.on{color:var(--ac)}
body:is([data-tab="fav"],[data-tab="msg"]) :is(#q,main>.row,#list,#terms,#tl,#detail,#authp,#sellp,#salesPanel,#adm){display:none!important}
body[data-tab="acc"] :is(#q,main>.row,#list,#terms,#tl,#detail){display:none!important}
#xfav .row>button{flex:1}
#xmsg .row button{flex:none}
.xbox{display:flex;flex-direction:column;gap:6px;max-height:55vh;overflow-y:auto;padding:4px 0}
.xb{max-width:80%;padding:8px 12px;border-radius:12px;font-size:15px;word-break:break-word}
.xb.me{align-self:flex-end;background:var(--nv)}
.xb.ot{align-self:flex-start;background:#fff;border:1px solid var(--bd)}
.xrow button{flex:1}
`;
document.head.append(st);

let user=null,items=[],chats=[],bch=[],sch=[],unsubs=[];
let tab='home',thread=null,unsubThread=null;
let favs=[];
try{favs=JSON.parse(localStorage.getItem('xfav')||'[]');if(!Array.isArray(favs))favs=[];}catch(e){favs=[];}
function toggleFav(id){
favs=favs.includes(id)?favs.filter(x=>x!==id):[...favs,id];
try{localStorage.setItem('xfav',JSON.stringify(favs));}catch(e){}
}

/* Mot de passe oublié */
const forgot=btn('Mot de passe oublié ?','btn2',async()=>{
const m=$('amsg'),e=$('em').value.trim();
if(!e){m.textContent='Écris ton e-mail dans la case ci-dessus.';return;}
try{
await sendPasswordResetEmail(auth,e);
m.textContent='Si un compte existe avec cet e-mail, un lien de réinitialisation vient d’être envoyé. Pense à regarder les spams.';
}catch(x){
m.textContent=(x&&x.code||'').includes('invalid-email')?'E-mail invalide.':'Envoi impossible. Réessaie.';
}
});
$('signup').after(forgot);

/* Menu du bas */
const main=document.querySelector('main');
const xfav=h('section'),xmsg=h('section'),xacc=h('section');
xfav.id='xfav';xmsg.id='xmsg';xacc.id='xacc';
xfav.hidden=xmsg.hidden=xacc.hidden=true;
main.prepend(xfav,xmsg,xacc);

const nav=h('nav');nav.id='xnav';
[['home','🏠','Accueil'],['fav','♡','Enregistré'],['msg','💬','Message'],['acc','👤','Mon compte']]
.forEach(([k,ic,tx])=>{
const b=h('button');b.type='button';b.dataset.k=k;
b.append(h('span',ic),document.createTextNode(tx));
b.onclick=()=>go(k);
nav.append(b);
});
document.body.append(nav);

function go(k){
tab=k;
document.body.dataset.tab=k;
nav.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.k===k));
xfav.hidden=k!=='fav';xmsg.hidden=k!=='msg';xacc.hidden=k!=='acc';
if(k!=='msg'&&unsubThread){unsubThread();unsubThread=null;}
if(k==='fav')renderFav();
if(k==='msg')renderMsg();
if(k==='acc')renderAcc();
window.scrollTo(0,0);
}

/* Enregistré */
function openAd(i){
go('home');
['q','fc','fv'].forEach(k=>{$(k).value='';$(k).dispatchEvent(new Event('input'));});
const c=[...$('list').children].find(x=>x.textContent.includes(i.title)&&x.textContent.includes(money(i)));
if(c)c.click();
}
function renderFav(){
xfav.replaceChildren(h('h2','Enregistré'));
const l=items.filter(i=>favs.includes(i.id));
if(!l.length){
xfav.append(h('p','Aucune annonce enregistrée. Ouvre une annonce et appuie sur « Enregistrer ».','mu'));
return;
}
l.forEach(i=>{
const c=h('div',null,'mod');
c.append(h('b',money(i)),h('span',i.title),h('span',(i.city||'')+' · '+(i.cat||''),'mu'));
const row=h('div',null,'row');
row.append(btn('Voir','btn',()=>openAd(i)),btn('Retirer','btn2',()=>{toggleFav(i.id);renderFav();}));
c.append(row);xfav.append(c);
});
}

/* Boutons dans le détail d'une annonce */
const det=$('detail');
new MutationObserver(()=>{
if(det.hidden||det.querySelector('.xrow'))return;
const t=[...det.children].find(e=>e.tagName==='B');
const m=det.querySelector(':scope>h2');
if(!t||!m)return;
const i=items.find(x=>x.title===t.textContent&&money(x)===m.textContent);
if(!i)return;
const row=h('div',null,'row xrow');
const fv=btn('','btn2',()=>{toggleFav(i.id);upd();});
function upd(){fv.textContent=favs.includes(i.id)?'★ Enregistré':'☆ Enregistrer';}
upd();
row.append(fv);
if(!user||user.uid!==i.uid)row.append(btn('💬 Message','btn2',()=>startChat(i)));
t.after(row);
}).observe(det,{childList:true});

onSnapshot(query(collection(db,'products'),where('ok','==',true)),s=>{
items=s.docs.map(d=>({id:d.id,...d.data()}));
if(tab==='fav')renderFav();
},()=>{});


/* Messages */
async function startChat(i){
if(!user){
alert('Connecte-toi pour envoyer un message.');
go('acc');
return;
}

const cid=i.id+'_'+user.uid;

try{
await setDoc(doc(db,'chats',cid),{
productId:i.id,
title:i.title,
buyerUid:user.uid,
sellerUid:i.uid,
t:Date.now()
},{merge:true});
}catch(e){
alert('Impossible d’ouvrir la conversation.');
return;
}

thread={id:cid,title:i.title,buyerUid:user.uid,sellerUid:i.uid};
go('msg');
}


function renderMsg(){
if(unsubThread){unsubThread();unsubThread=null;}
xmsg.replaceChildren();
if(!user){
xmsg.append(h('h2','Messages'),h('p','Connecte-toi pour voir tes messages.','mu'),btn('Se connecter','btn',()=>go('acc')));
return;
}
if(thread){drawThread();return;}
xmsg.append(h('h2','Messages'));
if(!chats.length){
xmsg.append(h('p','Aucune conversation. Ouvre une annonce et appuie sur « Message ».','mu'));
return;
}
chats.forEach(c=>{
const b=h('button',null,'card');b.type='button';
b.append(h('b',c.title||'Annonce'),h('span',c.last||'Nouvelle conversation','mu'),
h('span',c.buyerUid===user.uid?'Tu écris au vendeur':'Un acheteur t’a écrit','mu'));
b.onclick=()=>{thread=c;renderMsg();};
xmsg.append(b);
});
}

function drawThread(){
const t=thread;
xmsg.append(btn('← Retour','btn2',()=>{thread=null;renderMsg();}),h('b',t.title||'Annonce'));
const box=h('div',null,'xbox');
xmsg.append(box);
const inp=document.createElement('input');
inp.placeholder='Écris ton message…';inp.maxLength=500;
const send=btn('Envoyer','btn',async()=>{
const x=inp.value.trim();
if(!x)return;
inp.value='';
try{
await addDoc(collection(db,'chats',t.id,'msgs'),{from:user.uid,text:x,t:Date.now()});
await updateDoc(doc(db,'chats',t.id),{last:x,t:Date.now()});
}catch(e){alert('Message non envoyé.');}
});
const row=h('div',null,'row');
row.append(inp,send);
xmsg.append(row);
unsubThread=onSnapshot(query(collection(db,'chats',t.id,'msgs'),orderBy('t')),s=>{
box.replaceChildren();
s.docs.forEach(d=>{
const m=d.data();
box.append(h('div',m.text,'xb '+(m.from===user.uid?'me':'ot')));
});
box.scrollTop=box.scrollHeight;
},()=>{box.replaceChildren(h('p','Impossible de charger les messages.','mu'));});
}

function mergeChats(){
chats=[...new Map([...bch,...sch].map(x=>[x.id,x])).values()].sort((a,b)=>(b.t||0)-(a.t||0));
if(tab==='msg'&&!thread)renderMsg();
}

/* MON COMPTE ET PARAMÈTRES */
function renderAcc(){
const settings=window.__sp||(window.__sp=$('settingsPanel'));
xacc.replaceChildren();

if(!user){
document.body.classList.remove('settings-open');
$('authp').hidden=false;
return;
}

const head=h('div',null,'row');
head.style.cssText='align-items:center;justify-content:space-between';

const title=h('h2','Mon compte');
title.style.margin='0';

const gear=btn('⚙️','btn2',()=>{
document.body.classList.add('settings-open');
settings.scrollIntoView();
});
gear.title='Ouvrir les paramètres';
gear.style.cssText='min-width:48px;font-size:21px;padding:0 12px';

head.append(title,gear);

xacc.append(
head,
h('p','Compte connecté ✓','mu')
);

if(settings){

if(!settings.querySelector('.settings-back')){
const back=btn('← Retour à Mon compte','btn2',()=>{
document.body.classList.remove('settings-open');
window.scrollTo(0,0);
});
back.classList.add('settings-back');
settings.prepend(back);
}

if(!settings.querySelector('.account-password')){
const pass=btn('🔐 Changer mon mot de passe','btn2',async()=>{
try{
await sendPasswordResetEmail(auth,user.email);
alert('Un lien de réinitialisation a été envoyé par e-mail.');
}catch(e){
alert('Envoi impossible. Réessaie.');
}
});
pass.classList.add('account-password');
settings.append(pass);
}

xacc.append(settings);
}
}

onAuthStateChanged(auth,u=>{
user=u;
unsubs.forEach(f=>f());unsubs=[];
bch=[];sch=[];chats=[];thread=null;
if(u){
const mk=(f,set)=>onSnapshot(query(collection(db,'chats'),where(f,'==',u.uid)),s=>{
set(s.docs.map(d=>({id:d.id,...d.data()})));mergeChats();
},()=>{});
unsubs.push(mk('buyerUid',a=>{bch=a;}),mk('sellerUid',a=>{sch=a;}));
}
if(tab==='msg')renderMsg();
if(tab==='acc')renderAcc();
});

go('home');
