(function(){
const img=document.getElementById('pfimg'),inp=document.getElementById('pfin');
try{const s=localStorage.getItem('pfphoto');if(s)img.src=s;}catch(e){}
inp.onchange=()=>{
const f=inp.files[0];if(!f)return;
const r=new FileReader();
r.onload=()=>{const im=new Image();im.onload=()=>{
const c=document.createElement('canvas');c.width=c.height=120;
const s=Math.min(im.width,im.height);
c.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,120,120);
const d=c.toDataURL('image/jpeg',0.7);
img.src=d;try{localStorage.setItem('pfphoto',d);}catch(e){}
};im.src=r.result;};
r.readAsDataURL(f);
};
})();
