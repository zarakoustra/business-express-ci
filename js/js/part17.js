const $=id=>document.getElementById(id);
const B=document.body;
const SECS=['xmine','xrev','xfaq','xnotif','xfol','xmoney'];
const back=document.createElement('button');
back.id='subback';back.type='button';back.className='btn2';
back.textContent='← Paramètres';
$('xacc').before(back);
back.onclick=()=>{
delete B.dataset.sub;
B.classList.add('settings-open');
window.scrollTo(0,0);
};
$('settingsPanel').addEventListener('click',e=>{
const b=e.target.closest('[data-open]');
if(!b||b.dataset.open==='xprofile')return;
e.stopPropagation();
const id=b.dataset.open==='xagency'?'xag':b.dataset.open;
SECS.forEach(s=>{const x=$(s);if(x)x.hidden=s!==id;});
B.classList.remove('settings-open');
B.dataset.sub=id;
window.scrollTo(0,0);
},true);
document.querySelectorAll('#xnav button').forEach(b=>b.addEventListener('click',()=>{
delete B.dataset.sub;
B.classList.remove('settings-open');
}));
