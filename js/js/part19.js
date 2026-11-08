const KEY='969d70c3-3f36-4431-a8c5-671bae2f93e9';
const $=id=>document.getElementById(id);

async function notify(subject,message){
try{
await fetch('https://api.web3forms.com/submit',{
method:'POST',
headers:{'Content-Type':'application/json',Accept:'application/json'},
body:JSON.stringify({access_key:KEY,subject:'Zarakoustra : '+subject,from_name:'Zarakoustra',message})
});
}catch(e){}
}

/* 1. Nouvelle annonce à valider */
let lastTitle='',sent=false;
$('go').addEventListener('click',()=>{lastTitle=$('ti').value.trim();sent=false;},true);
new MutationObserver(()=>{
if(!sent&&$('msg').textContent.startsWith('Annonce envoyée')){
sent=true;
notify('Nouvelle annonce à valider','Titre : '+lastTitle+'\nOuvre le site avec ton compte admin pour la valider.');
}
}).observe($('msg'),{childList:true,characterData:true,subtree:true});

/* 2. Annonce signalée */
const _alert=window.alert.bind(window);
window.alert=t=>{
_alert(t);
if(t==='Signalement envoyé.'){
const b=document.querySelector('#detail>b');
notify('Annonce signalée','Annonce : '+(b?b.textContent:'?')+'\nOuvre le site (admin) puis Modération.');
}
};

/* 3. Message à l'agence */
let ag=false,agInfo='';
$('xag').addEventListener('click',()=>{
ag=false;
const s=$('xag').querySelector('select'),i=$('xag').querySelector('input');
agInfo=(s?s.value:'')+' | '+(i?i.value:'');
},true);
new MutationObserver(()=>{
const ok=[...$('xag').querySelectorAll('p')].some(p=>p.textContent.startsWith('Message envoyé'));
if(ok&&!ag){
ag=true;
notify('Message à l’agence','Motif : '+agInfo+'\nOuvre Mon compte (admin) pour le lire.');
}
if(!ok)ag=false;
}).observe($('xag'),{childList:true,characterData:true,subtree:true});
