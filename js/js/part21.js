import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getFirestore,collection,query,where,onSnapshot} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
const db=getFirestore(getApp());
const $=id=>document.getElementById(id);
const B=document.body;
function h(tag,text,cls){
const e=document.createElement(tag);
if(text!=null)e.textContent=text;
if(cls)e.className=cls;
return e;
}
const money=i=>Number(i.price).toLocaleString('fr-FR')+' FCFA'+(i.unit?' '+i.unit:'');
const base=SITE_URL;

/* nouvelles catégories dans les formulaires */
const NEW=['Beauté & Soins','Bébés & Enfants','Alimentation & Agriculture','Animaux','Emplois','Loisirs & Activités','Réparation & Construction','Entreprise & Industrie'];
['ca','fc'].forEach(id=>{
const s=$(id);
NEW.forEach(v=>{if(![...s.options].some(o=>o.value===v))s.add(new Option(v,v));});
});

const T=[
['🚗','Véhicules','Véhicules'],
['🏠','Immobilier','Immobilier'],
['📱','Téléphones et tablettes','Téléphones'],
['💻','Électronique','Électronique'],
['🛋️','Maison, Meubles & Électroménager','Maison'],
['👗','Mode','Mode'],
['💄','Beauté & Soins personnels','Beauté & Soins'],
['🛠️','Services','Services'],
['🏗️','Réparation & Construction','Réparation & Construction'],
['🎮','Loisirs & Activités','Loisirs & Activités'],
['🧸','Bébés & Enfants','Bébés & Enfants'],
['🥦','Alimentation, Agriculture & Élevage','Alimentation & Agriculture'],
['🐕','Animaux','Animaux'],
['💼','Emplois','Emplois'],
['🏭','Entreprise & Industrie','Entreprise & Industrie'],
['📚','Livres & formations','Livres & formations'],
['➕','Autres','Autres']
];

const grid=h('div');grid.id='xcats';
const view=h('section');view.id='xcatview';
$('list').before(grid,view);

let items=[],cur=null;

T.forEach(t=>{
const b=h('button');b.type='button';
b.append(h('i',t[0]),h('span',t[1]));
b.onclick=()=>{cur=t;B.classList.add('catmode');draw();window.scrollTo(0,0);};
grid.append(b);
});

function photo(i){
const a=(Array.isArray(i.photos)&&i.photos.length?i.photos:(i.photo?[i.photo]:[]))
.filter(s=>String(s).startsWith('data:image/'));
if(a.length){
const m=document.createElement('img');
m.src=a[0];m.alt=i.title||'';
m.style.cssText='width:100%;height:120px;object-fit:cover;border-radius:8px';
return m;
}
const d=h('div','Pas de photo','mu');
d.style.cssText='height:120px;display:flex;align-items:center;justify-content:center;background:var(--bd);border-radius:8px';
return d;
}

function openAd(i){
['q','fc','fv'].forEach(k=>{$(k).value='';$(k).dispatchEvent(new Event('input'));});
const c=[...$('list').children].find(x=>x.textContent.includes(i.title)&&x.textContent.includes(money(i)));
if(c)c.click();
}

function closeCat(){
B.classList.remove('catmode');
$('detail').hidden=true;
window.scrollTo(0,0);
}

function draw(){
if(!cur)return;
const l=items.filter(i=>i.cat===cur[2]).sort((a,b)=>(b.t||0)-(a.t||0));
view.replaceChildren();
const back=h('button','← Catégories','btn2');back.type='button';
back.onclick=closeCat;
view.append(back,h('h2',cur[0]+' '+cur[1]),h('p',l.length+' annonce'+(l.length>1?'s':''),'mu'));
if(!l.length){
view.append(h('p','Aucune annonce dans cette catégorie pour l’instant.','mu'));
return;
}
const g=h('div',null,'xg');
l.forEach(i=>{
const w=h('div',null,'xcw');
const c=h('button',null,'card');c.type='button';
c.append(photo(i),h('b',money(i)),h('span',i.title),h('span',i.city||'','mu'));
c.onclick=()=>openAd(i);
w.append(c);
if(i.uid){
const a=h('button','›','xarrow');a.type='button';
a.setAttribute('aria-label','Voir qui a publié cette annonce');
a.onclick=()=>{location.href=base+'?v='+encodeURIComponent(i.uid);};
w.append(a);
}
g.append(w);
});
view.append(g);
}

document.querySelectorAll('#xnav button').forEach(b=>b.addEventListener('click',()=>B.classList.remove('catmode')));

onSnapshot(query(collection(db,'products'),where('ok','==',true)),s=>{
items=s.docs.map(d=>({id:d.id,...d.data()}));
if(B.classList.contains('catmode'))draw();
},()=>{});
