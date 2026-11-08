const $=id=>document.getElementById(id);
const B=document.body;
const SECS=['xmine','xrev','xfaq','xnotif','xfol','xmoney'];

/* bouton dans les Paramètres */
const sp=$('settingsPanel');
const sb=document.createElement('button');
sb.type='button';sb.className='btn2';sb.dataset.open='xsales';
sb.textContent='🛒 Mes ventes et achats';
const ref=sp.querySelector('[data-open="xmine"]');
if(ref)ref.after(sb);else sp.append(sb);

function openSales(){
SECS.forEach(s=>{const x=$(s);if(x)x.hidden=true;});
B.classList.remove('settings-open');
B.dataset.sub='xsales';
window.scrollTo(0,0);
}

/* « Voir mes ventes » dans les Notifications */
$('xnotif').addEventListener('click',e=>{
const b=e.target.closest('button');
if(b&&b.textContent==='Voir mes ventes'){e.stopPropagation();openSales();}
},true);

/* « Ouvrir l'annonce pour noter » : retour à l'accueil pour voir l'annonce */
$('salesList').addEventListener('click',e=>{
const b=e.target.closest('button');
if(b&&b.textContent.startsWith('Ouvrir'))
document.querySelector('#xnav button[data-k="home"]').click();
},true);
