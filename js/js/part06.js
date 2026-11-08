import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getFirestore,collection,addDoc,onSnapshot,updateDoc,deleteDoc,doc} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const auth=getAuth(getApp()),db=getFirestore(getApp());
const $=id=>document.getElementById(id);
const ADMIN='rBxaE8OltfeNwvpUivDdqZqhxjl1';

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

const st=document.createElement('style');
st.textContent='#xag,#xagadm{display:none}body[data-tab="acc"] #xag,body[data-tab="acc"] #xagadm{display:flex}#xagadm .row>button{flex:1}';
document.head.append(st);

const xag=h('section');xag.id='xag';
const xagadm=h('section');xagadm.id='xagadm';
$('xacc').after(xag,xagadm);

let user=null,sub=null;

function drawForm(){
xag.replaceChildren(
h('h2','Contacter l’agence'),
h('p','Tu as trouvé un compte suspect ou tu as été victime d’une arnaque ? Écris-nous, on vérifie.','mu')
);
if(!user){
xag.append(h('p','Connecte-toi pour envoyer un message à l’agence.','mu'));
return;
}
const rs=document.createElement('select');
['Compte suspect','Arnaque (j’ai été arnaqué)','Faux vendeur ou fausse annonce','Autre problème']
.forEach(v=>rs.add(new Option(v,v)));
const ab=document.createElement('input');
ab.placeholder='Nom du vendeur ou titre de l’annonce';ab.maxLength=200;
const tx=document.createElement('textarea');
tx.rows=4;tx.maxLength=1000;tx.placeholder='Explique ce qui s’est passé…';
const ph=document.createElement('input');
ph.type='tel';ph.placeholder='Ton numéro pour te rappeler (facultatif)';ph.maxLength=20;
const msg=h('p',null,'mu');
const send=btn('Envoyer à l’agence','btn',async()=>{
const t=tx.value.trim();
if(t.length<10){msg.textContent='Explique un peu plus (10 caractères minimum).';return;}
send.disabled=true;
try{
await addDoc(collection(db,'agencyReports'),{
uid:user.uid,email:user.email||'',reason:rs.value,about:ab.value.trim(),
text:t,phone:ph.value.trim(),status:'new',t:Date.now()
});
msg.textContent='Message envoyé ✓ Merci, on va vérifier.';
ab.value='';tx.value='';ph.value='';
}catch(e){msg.textContent='Envoi impossible. Réessaie.';}
send.disabled=false;
});
xag.append(rs,ab,tx,ph,send,msg);
}

function drawAdm(list){
const n=list.filter(r=>r.status!=='done').length;
xagadm.replaceChildren(h('h2','Messages à l’agence ('+n+' à traiter)'));
if(!list.length){xagadm.append(h('p','Aucun message pour le moment.','mu'));return;}
list.forEach(r=>{
const c=h('div',null,'mod');
c.append(
h('b',(r.reason||'')+(r.status==='done'?' · traité':' · NOUVEAU')),
h('span','Concerne : '+(r.about||'non précisé')),
h('span',r.text||'','mu'),
h('span','De : '+(r.email||'?')+(r.phone?' · '+r.phone:'')+' · '+new Date(r.t||0).toLocaleString('fr-FR'),'mu')
);
const row=h('div',null,'row');
if(r.status!=='done')row.append(btn('Marquer traité','btn',()=>updateDoc(doc(db,'agencyReports',r.id),{status:'done'})));
row.append(btn('Supprimer','btn2',()=>{if(confirm('Supprimer ce message ?'))deleteDoc(doc(db,'agencyReports',r.id));}));
c.append(row);
xagadm.append(c);
});
}

onAuthStateChanged(auth,u=>{
user=u;
if(sub){sub();sub=null;}
xagadm.replaceChildren();
drawForm();
if(u&&u.uid===ADMIN){
sub=onSnapshot(collection(db,'agencyReports'),s=>{
drawAdm(s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.t||0)-(a.t||0)));
},()=>{});
}
});

$('tl').after(btn('🚩 Contacter l’agence (compte suspect, arnaque)','btn2',()=>{
document.querySelector('#xnav button[data-k="acc"]').click();
setTimeout(()=>xag.scrollIntoView(),50);
}));
