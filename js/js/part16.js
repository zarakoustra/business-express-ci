import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getFirestore,collection,query,where,onSnapshot,setDoc,doc} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const auth=getAuth(getApp()),db=getFirestore(getApp());
const $=id=>document.getElementById(id);
function h(tag,text,cls){
const e=document.createElement(tag);
if(text!=null)e.textContent=text;
if(cls)e.className=cls;
return e;
}
const money=i=>Number(i.price).toLocaleString('fr-FR')+' FCFA'+(i.unit?' '+i.unit:'');
const ADMIN='rBxaE8OltfeNwvpUivDdqZqhxjl1';
const BAD=/admin|zarakoustra|zarathoustra|officiel/i;

const st=document.createElement('style');
st.textContent='body:not([data-tab="acc"]) #xname{display:none!important}';
document.head.append(st);

let user=null,items=[],names=new Map(),nameInput=null;

const box=h('section');box.id='xname';
$('xacc').after(box);

function draw(){
box.replaceChildren(h('h2','Mon nom'));
nameInput=null;
if(!user){box.append(h('p','Connecte-toi pour choisir ton nom.','mu'));return;}
box.append(h('p','Ce nom est visible par tout le monde sur tes annonces.','mu'));
const inp=document.createElement('input');
inp.maxLength=30;inp.placeholder='Ton nom public';
inp.value=names.get(user.uid)||'';
nameInput=inp;
const msg=h('p',null,'mu');
const save=h('button','Enregistrer mon nom','btn');save.type='button';
save.onclick=async()=>{
const n=inp.value.trim().replace(/\s+/g,' ');
if(n.length<2){msg.textContent='Minimum 2 caractères.';return;}
if(BAD.test(n)&&user.uid!==ADMIN){msg.textContent='Ce nom n’est pas autorisé.';return;}
save.disabled=true;
try{
await setDoc(doc(db,'profiles',user.uid),{name:n,t:Date.now()});
msg.textContent='Nom enregistré ✓';
}catch(e){msg.textContent='Enregistrement impossible. Réessaie.';}
save.disabled=false;
};
box.append(inp,save,msg);
}

/* remplit « Ton nom » dans le formulaire de vente */
function fillSe(){
const n=user&&names.get(user.uid),s=$('se');
if(n&&s&&!s.value)s.value=n;
}
$('go').addEventListener('click',()=>{
const n=user&&names.get(user.uid);
if(n)$('se').value=n;
},true);

/* affiche le nom à jour dans le détail d'une annonce */
const det=$('detail');
function patchDetail(){
if(det.hidden)return;
const t=[...det.children].find(e=>e.tagName==='B');
const m=det.querySelector(':scope>h2');
if(!t||!m)return;
const i=items.find(x=>x.title===t.textContent&&money(x)===m.textContent);
if(!i||!names.has(i.uid))return;
const pre=(i.city||'')+' · '+(i.cat||'')+' · ';
const p=[...det.querySelectorAll(':scope>p')].find(e=>e.textContent.startsWith(pre));
if(p&&p.textContent!==pre+names.get(i.uid))p.textContent=pre+names.get(i.uid);
}
new MutationObserver(patchDetail).observe(det,{childList:true});

/* affiche le nom à jour sur la page profil vendeur */
function patchProf(){
const sec=$('xprof');if(!sec)return;
const sid=new URLSearchParams(location.search).get('v');
const hh=[...sec.children].find(e=>e.tagName==='H2'&&e.textContent.startsWith('👤 '));
if(hh&&names.has(sid)&&hh.textContent!=='👤 '+names.get(sid))hh.textContent='👤 '+names.get(sid);
}
if($('xprof'))new MutationObserver(patchProf).observe($('xprof'),{childList:true});

onSnapshot(collection(db,'profiles'),s=>{
names=new Map(s.docs.map(d=>[d.id,d.data().name]));
if(nameInput&&user&&document.activeElement!==nameInput)nameInput.value=names.get(user.uid)||'';
fillSe();patchDetail();patchProf();
},()=>{});
onSnapshot(query(collection(db,'products'),where('ok','==',true)),s=>{
items=s.docs.map(d=>({id:d.id,...d.data()}));
patchDetail();
},()=>{});
onAuthStateChanged(auth,u=>{user=u;draw();fillSe();});
