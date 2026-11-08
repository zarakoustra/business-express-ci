import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getFirestore,collection,query,where,onSnapshot} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const auth=getAuth(getApp()),db=getFirestore(getApp());
const $=id=>document.getElementById(id);
const rd=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v===null?d:v;}catch(e){return d;}};
const wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};

const st=document.createElement('style');
st.textContent='#xnav button{position:relative}#xnav button i.xbadge{position:absolute;top:4px;left:calc(50% + 6px);min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#E53935;color:#fff;font-size:11px;font-style:normal;font-weight:700;display:flex;align-items:center;justify-content:center}';
document.head.append(st);

let uid=null,unread={},bch=[],sch=[],subs=[],ready={b:false,s:false};

function badge(){
const b=document.querySelector('#xnav button[data-k="msg"]');
if(!b)return;
const n=Object.keys(unread).length;
let e=b.querySelector('.xbadge');
if(!n){if(e)e.remove();return;}
if(!e){e=document.createElement('i');e.className='xbadge';b.append(e);}
e.textContent=n;
}

function check(){
if(!uid||!ready.b||!ready.s)return;
const chats=[...new Map([...bch,...sch].map(c=>[c.id,c])).values()];
let known=rd('xknown_'+uid,null);
const first=known===null;
if(first)known={};
const inThread=document.body.dataset.tab==='msg'&&document.querySelector('#xmsg .xbox');
const openTitle=inThread?(document.querySelector('#xmsg>b')||{}).textContent:null;
chats.forEach(c=>{
const last=c.last||'';
if(first){known[c.id]=last;return;}
const open=inThread&&openTitle===(c.title||'Annonce');
if(open)delete unread[c.id];
else if(last&&known[c.id]!==last)unread[c.id]=1;
known[c.id]=last;
});
wr('xknown_'+uid,known);
wr('xunread_'+uid,unread);
badge();
}

new MutationObserver(check).observe($('xmsg'),{childList:true});

onAuthStateChanged(auth,u=>{
subs.forEach(f=>f());subs=[];
bch=[];sch=[];ready={b:false,s:false};
uid=u?u.uid:null;
unread=u?rd('xunread_'+uid,{}):{};
badge();
if(!u)return;
subs.push(
onSnapshot(query(collection(db,'chats'),where('buyerUid','==',u.uid)),s=>{
bch=s.docs.map(d=>({id:d.id,...d.data()}));ready.b=true;check();
},()=>{}),
onSnapshot(query(collection(db,'chats'),where('sellerUid','==',u.uid)),s=>{
sch=s.docs.map(d=>({id:d.id,...d.data()}));ready.s=true;check();
},()=>{})
);
});
