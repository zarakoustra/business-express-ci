import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
const auth=getAuth(getApp());
const $=id=>document.getElementById(id);
const B=document.body;
const nav=$('xnav');
let user=null;
onAuthStateChanged(auth,u=>{user=u;});

const sb=document.createElement('button');
sb.type='button';sb.id='xsell';
sb.innerHTML='<span>➕</span>Vendre';
nav.querySelector('[data-k="fav"]').after(sb);

function openSell(){
if(!user){
alert('Connecte-toi pour vendre.');
nav.querySelector('[data-k="acc"]').click();
return;
}
nav.querySelector('[data-k="home"]').click();
B.classList.add('sellmode');
setTimeout(()=>{$('sellp').hidden=false;},0);
nav.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===sb));
window.scrollTo(0,0);
}
sb.onclick=openSell;

nav.querySelectorAll('button').forEach(b=>{
if(b!==sb)b.addEventListener('click',()=>B.classList.remove('sellmode'));
});

/* le bouton Vendre du haut ouvre la même page */
$('top').addEventListener('click',e=>{
if(!user)return;
e.stopImmediatePropagation();
openSell();
},true);

/* détails obligatoires avant de publier */
$('go').addEventListener('click',e=>{
const m=$('msg');
if(!$('ph').files.length){
e.stopImmediatePropagation();
m.textContent='Ajoute au moins une photo.';
return;
}
if($('de').value.trim().length<10){
e.stopImmediatePropagation();
m.textContent='Ajoute une description (10 caractères minimum).';
}
},true);
