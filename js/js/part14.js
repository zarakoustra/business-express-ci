(function(){
const ids=['xmine','xrev','xfaq','xnotif','xfol','xmoney'];
document.querySelectorAll('#xgrid .card').forEach(c=>{
c.addEventListener('click',()=>{
const before=ids.map(k=>{const e=document.getElementById(k);return e?e.hidden:true;});
setTimeout(()=>{
const open=ids.filter(k=>{const e=document.getElementById(k);return e&&!e.hidden;});
if(open.length>1){
const fresh=ids.filter((k,i)=>before[i]&&!document.getElementById(k).hidden);
const keep=fresh[0]||open[open.length-1];
ids.forEach(k=>{const e=document.getElementById(k);if(e&&k!==keep)e.hidden=true;});
}
},0);
});
});
})();
