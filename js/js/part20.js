import {getApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
const KEY='969d70c3-3f36-4431-a8c5-671bae2f93e9';
onAuthStateChanged(getAuth(getApp()),u=>{
if(!u)return;
const fresh=Date.now()-new Date(u.metadata.creationTime).getTime()<120000;
let done=false;
try{done=localStorage.getItem('xnew_'+u.uid)==='1';}catch(e){}
if(!fresh||done)return;
try{localStorage.setItem('xnew_'+u.uid,'1');}catch(e){}
const p=(u.email||'').split('@');
const mail=p[1]?p[0].slice(0,2)+'***@'+p[1]:'inconnu';
fetch('https://api.web3forms.com/submit',{
method:'POST',
headers:{'Content-Type':'application/json',Accept:'application/json'},
body:JSON.stringify({access_key:KEY,subject:'Zarakoustra : nouvelle inscription',from_name:'Zarakoustra',message:'Nouveau compte créé : '+mail})
}).catch(()=>{});
});
