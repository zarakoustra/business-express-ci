import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,createUserWithEmailAndPassword,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getFirestore,setDoc,doc} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
const auth=getAuth(getApp()),db=getFirestore(getApp());
const $=id=>document.getElementById(id);
const BAD=/admin|zarakoustra|zarathoustra|officiel/i;

const st=document.createElement('style');
st.textContent='body:not([data-tab="acc"]) #xsignup{display:none!important}'+
'#xsignup .vbtn{background:#BFE3F8;color:#0B2545}'+
'#xsignup .vbtn.on{background:#0050FF;color:#fff}';
document.head.append(st);

function inp(ph,type,ac){const i=document.createElement('input');i.placeholder=ph;i.type=type;if(ac)i.autocomplete=ac;return i;}

/* la page */
const sec=document.createElement('section');sec.id='xsignup';sec.hidden=true;
const back=document.createElement('button');back.type='button';back.className='btn2';back.textContent='← Retour à la connexion';
const title=document.createElement('h2');title.textContent='Créer un compte';
const nom=inp('Nom','text','family-name'),pre=inp('Prénom','text','given-name'),
em=inp('E-mail','email','email'),
wa=inp('Numéro WhatsApp (ex : 0707070707)','tel','tel'),
p1=inp('Mot de passe (6 caractères minimum)','password','new-password'),
p2=inp('Confirmer le mot de passe','password','new-password');
wa.inputMode='numeric';nom.maxLength=20;pre.maxLength=20;
const lab=document.createElement('label');lab.className='chk';
const cg=document.createElement('input');cg.type='checkbox';
lab.append(cg,document.createTextNode(' J’accepte les conditions d’utilisation'));
const ok=document.createElement('button');ok.type='button';ok.className='vbtn';ok.textContent='Valider';
const m=document.createElement('p');m.className='mu';
sec.append(back,title,nom,pre,em,wa,p1,p2,lab,ok,m);
$('authp').after(sec);

/* vérification */
function phone(){
let d=wa.value.replace(/\D/g,'');
if(d.startsWith('00'))d=d.slice(2);
if(d.length===10)d='225'+d;
return /^\d{11,13}$/.test(d)?d:null;
}
function problem(){
if(nom.value.trim().length<2)return 'Écris ton nom.';
if(pre.value.trim().length<2)return 'Écris ton prénom.';
if(BAD.test(nom.value+' '+pre.value))return 'Ce nom n’est pas autorisé.';
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim()))return 'E-mail invalide.';
if(!phone())return 'Numéro WhatsApp invalide (10 chiffres).';
if(p1.value.length<6)return 'Mot de passe trop court (6 minimum).';
if(p1.value!==p2.value)return 'Les deux mots de passe ne sont pas identiques.';
if(!cg.checked)return 'Accepte les conditions d’utilisation.';
return '';
}
function refresh(){ok.classList.toggle('on',!problem());}
[nom,pre,em,wa,p1,p2].forEach(i=>i.addEventListener('input',refresh));
cg.addEventListener('change',refresh);

/* ouverture / retour */
$('signup').addEventListener('click',e=>{
e.stopImmediatePropagation();
$('authp').hidden=true;sec.hidden=false;
window.scrollTo(0,0);
},true);
back.onclick=()=>{sec.hidden=true;$('authp').hidden=false;};
new MutationObserver(()=>{
if(!sec.hidden&&!$('authp').hidden)$('authp').hidden=true;
}).observe($('authp'),{attributes:true,attributeFilter:['hidden']});

/* création */
ok.onclick=async()=>{
const p=problem();
if(p){m.textContent=p;return;}
const name=(pre.value.trim()+' '+nom.value.trim()).slice(0,30);
const w=wa.value.trim(),mail=em.value.trim();
ok.disabled=true;m.textContent='Création en cours…';
try{
const c=await createUserWithEmailAndPassword(auth,mail,p1.value);
try{await setDoc(doc(db,'profiles',c.user.uid),{name,t:Date.now()});}catch(e){}
try{localStorage.setItem('zk_wa',w);}catch(e){}
const tl=$('tel');if(tl&&!tl.value)tl.value=w;
}catch(e){
const k=(e&&e.code)||'';
m.textContent=k.includes('email-already')?'Cet e-mail a déjà un compte.':
k.includes('invalid-email')?'E-mail invalide.':
k.includes('weak')?'Mot de passe trop court (6 minimum).':
'Une erreur est survenue. Réessaie.';
}
ok.disabled=false;
};

/* après connexion : on ferme la page et on vide les champs */
onAuthStateChanged(auth,u=>{
if(!u)return;
sec.hidden=true;
[nom,pre,em,wa,p1,p2].forEach(i=>{i.value='';});
cg.checked=false;m.textContent='';refresh();
try{const w=localStorage.getItem('zk_wa');if(w&&!$('tel').value)$('tel').value=w;}catch(e){}
});
