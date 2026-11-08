import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
const $=id=>document.getElementById(id);
const ADMIN='rBxaE8OltfeNwvpUivDdqZqhxjl1';
const sp=$('settingsPanel');
const mb=document.createElement('button');
mb.type='button';mb.className='btn2';mb.dataset.open='xadm';
mb.textContent='🛡️ Modération';
mb.hidden=true;
const ref=sp.querySelector('[data-open="xmine"]');
if(ref)ref.before(mb);else sp.append(mb);

function count(){
const b=$('adm').querySelector('b');
const m=b&&b.textContent.match(/\((\d+)\)/);
const n=m?Number(m[1]):0;
mb.textContent='🛡️ Modération'+(n?' ('+n+' à valider)':'');
}
new MutationObserver(count).observe($('adm'),{childList:true,subtree:true});
onAuthStateChanged(getAuth(getApp()),u=>{mb.hidden=!(u&&u.uid===ADMIN);count();});
