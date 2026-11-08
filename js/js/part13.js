(function(){
const $=id=>document.getElementById(id);
function h(tag,text,cls){
const e=document.createElement(tag);
if(text!=null)e.textContent=text;
if(cls)e.className=cls;
return e;
}

const st=document.createElement('style');
st.textContent='body:not([data-tab="acc"]) #xmoney{display:none!important}'+
'#xmoney .lnk{width:100%}';
document.head.append(st);

const box=h('section');box.id='xmoney';box.hidden=true;
($('xfol')||$('xnotif')||$('xfaq')||$('xrev')||$('xmine')||$('xgrid')).after(box);

const url=SITE_URL;

box.append(
h('h2','Faire l’argent 💰'),
h('p','Plus il y a de monde sur Zarathoustra, plus tu vends. Invite tes amis et ta famille !','mu')
);

const wa=h('a','📲 Partager sur WhatsApp','btn lnk');
wa.href='https://wa.me/?text='+encodeURIComponent('Salut ! Vends et achète facilement sur Zarathoustra : '+url);
wa.target='_blank';wa.rel='noopener noreferrer';

const cp=h('button','🔗 Copier le lien du site','btn2');cp.type='button';
cp.onclick=async()=>{
try{await navigator.clipboard.writeText(url);cp.textContent='✓ Lien copié';}
catch(e){prompt('Copie ce lien :',url);}
};

const tips=h('div',null,'mod');
tips.append(
h('b','Conseils pour vendre plus vite'),
h('span','📸 Mets 3 à 4 photos nettes, bien éclairées.'),
h('span','✍️ Écris un titre clair et une description honnête.'),
h('span','💬 Réponds vite aux messages des acheteurs.'),
h('span','✓ Demande le badge « Vendeur vérifié » pour inspirer confiance.')
);

const soon=h('div',null,'mod');
soon.append(
h('b','🚀 Booster une annonce'),
h('span','Bientôt : mets ton annonce en avant pour être vu en premier.','mu')
);

box.append(wa,cp,tips,soon);

const card=h('button',null,'card');card.type='button';
card.append(h('b','💰 Faire l’argent'));
card.onclick=()=>{
['xmine','xrev','xfaq','xnotif','xfol'].forEach(k=>{if($(k))$(k).hidden=true;});
box.hidden=!box.hidden;
if(!box.hidden)box.scrollIntoView();
};
$('xgrid').append(card);
})();
