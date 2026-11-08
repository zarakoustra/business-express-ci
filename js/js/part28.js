(function(){
const $=id=>document.getElementById(id);
const inp=$('pfin'),img=$('pfimg'),S=240;
const TINTS={
nb:[[0,0,0],[255,255,255]],
sepia:[[40,20,5],[255,235,200]],
bleu:[[5,20,60],[150,220,255]],
rose:[[60,5,35],[255,190,225]],
vert:[[5,40,20],[190,255,200]],
violet:[[30,5,60],[220,190,255]]
};
let im=null,st={z:1,x:0,y:0,hue:0,bri:100,tint:null};

const css=document.createElement('style');
css.textContent=
'#pfed{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;padding:12px}'+
'#pfed[hidden]{display:none}'+
'#pfed .box{background:#fff;color:#0B2545;border-radius:16px;padding:14px;width:100%;max-width:340px;max-height:100%;overflow-y:auto;display:flex;flex-direction:column;gap:10px;align-items:center}'+
'#pfed canvas{width:240px;height:240px;border-radius:50%;border:4px solid #000;touch-action:none;background:#ddd}'+
'#pfed label{width:100%;font-size:13px;font-weight:700;display:flex;flex-direction:column;gap:4px}'+
'#pfed input[type=range]{width:100%;min-height:0;padding:0;border:0}'+
'#pfed .ch{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}'+
'#pfed .ch button{min-height:34px;font-size:13px;padding:0 10px;border:1px solid #000;background:#fff;color:#000;border-radius:999px}'+
'#pfed .ch button.on{background:#000;color:#fff}'+
'#pfed .act{display:flex;gap:8px;width:100%}'+
'#pfed .act button{flex:1}';
document.head.append(css);

const ed=document.createElement('div');ed.id='pfed';ed.hidden=true;
ed.innerHTML='<div class="box"><b>Modifier ma photo</b>'+
'<canvas id="pfcv" width="'+S+'" height="'+S+'"></canvas>'+
'<span style="font-size:12px">Glisse la photo pour la déplacer</span>'+
'<label>Zoom (découper)<input id="pfz" type="range" min="100" max="300" value="100"></label>'+
'<label>Luminosité<input id="pfb" type="range" min="60" max="140" value="100"></label>'+
'<label>Changer les couleurs<input id="pfh" type="range" min="0" max="360" value="0"></label>'+
'<div class="ch" id="pfpre"></div>'+
'<div class="act"><button type="button" class="btn2" id="pfx">Annuler</button>'+
'<button type="button" class="btn" id="pfok">Enregistrer</button></div></div>';
document.body.append(ed);

const cv=$('pfcv'),cx=cv.getContext('2d',{willReadFrequently:true});

function mark(){[...$('pfpre').children].forEach(b=>b.classList.toggle('on',b.dataset.k===(st.tint||'')));}
[['Normal',''],['N&B','nb'],['Sépia','sepia'],['Bleu','bleu'],['Rose','rose'],['Vert','vert'],['Violet','violet']]
.forEach(([n,k])=>{
const b=document.createElement('button');b.type='button';b.textContent=n;b.dataset.k=k;
b.onclick=()=>{st.tint=k||null;st.hue=0;$('pfh').value=0;mark();draw();};
$('pfpre').append(b);
});

function scale(){return Math.max(S/im.width,S/im.height)*st.z;}
function draw(){
if(!im)return;
const sc=scale(),w=im.width*sc,h=im.height*sc;
st.x=Math.min(0,Math.max(S-w,st.x));
st.y=Math.min(0,Math.max(S-h,st.y));
cx.fillStyle='#fff';cx.fillRect(0,0,S,S);
cx.drawImage(im,st.x,st.y,w,h);
const d=cx.getImageData(0,0,S,S),p=d.data;
const a=st.hue*Math.PI/180,c=Math.cos(a),s=Math.sin(a),bri=st.bri/100;
const t=st.tint?TINTS[st.tint]:null;
for(let i=0;i<p.length;i+=4){
let r=p[i],g=p[i+1],b=p[i+2];
if(t){
const y=(0.299*r+0.587*g+0.114*b)/255;
r=t[0][0]+(t[1][0]-t[0][0])*y;
g=t[0][1]+(t[1][1]-t[0][1])*y;
b=t[0][2]+(t[1][2]-t[0][2])*y;
}else if(st.hue){
const r2=r*(0.213+c*0.787-s*0.213)+g*(0.715-c*0.715-s*0.715)+b*(0.072-c*0.072+s*0.928);
const g2=r*(0.213-c*0.213+s*0.143)+g*(0.715+c*0.285+s*0.140)+b*(0.072-c*0.072-s*0.283);
const b2=r*(0.213-c*0.213-s*0.787)+g*(0.715-c*0.715+s*0.715)+b*(0.072+c*0.928+s*0.072);
r=r2;g=g2;b=b2;
}
p[i]=Math.max(0,Math.min(255,r*bri));
p[i+1]=Math.max(0,Math.min(255,g*bri));
p[i+2]=Math.max(0,Math.min(255,b*bri));
}
cx.putImageData(d,0,0);
}

/* réglages */
$('pfz').oninput=e=>{
const old=scale();
const mx=(S/2-st.x)/old,my=(S/2-st.y)/old;
st.z=e.target.value/100;
const sc=scale();
st.x=S/2-mx*sc;st.y=S/2-my*sc;
draw();
};
$('pfb').oninput=e=>{st.bri=+e.target.value;draw();};
$('pfh').oninput=e=>{st.hue=+e.target.value;st.tint=null;mark();draw();};

/* déplacer avec le doigt */
let drag=null;
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,ox:st.x,oy:st.y};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointermove',e=>{
if(!drag)return;
const k=S/cv.getBoundingClientRect().width;
st.x=drag.ox+(e.clientX-drag.x)*k;
st.y=drag.oy+(e.clientY-drag.y)*k;
draw();
});
['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>{drag=null;}));

/* choix de la photo : ouvre l'éditeur */
inp.addEventListener('change',e=>{
e.stopImmediatePropagation();
const f=inp.files[0];if(!f)return;
const r=new FileReader();
r.onload=()=>{
const i=new Image();
i.onload=()=>{
im=i;
const sc=Math.max(S/i.width,S/i.height);
st={z:1,x:(S-i.width*sc)/2,y:(S-i.height*sc)/2,hue:0,bri:100,tint:null};
$('pfz').value=100;$('pfb').value=100;$('pfh').value=0;
mark();draw();ed.hidden=false;
};
i.src=r.result;
};
r.readAsDataURL(f);
inp.value='';
},true);

$('pfx').onclick=()=>{ed.hidden=true;};
$('pfok').onclick=()=>{
const d=cv.toDataURL('image/jpeg',0.85);
img.src=d;
try{localStorage.setItem('pfphoto',d);}catch(e){}
ed.hidden=true;
};
})();
