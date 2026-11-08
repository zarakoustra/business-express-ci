(function(){
const pw=document.getElementById('pw');
if(!pw)return;
const l=document.createElement('label');
l.className='chk';
const c=document.createElement('input');
c.type='checkbox';
l.append(c,document.createTextNode(' Afficher le mot de passe'));
c.onchange=()=>{pw.type=c.checked?'text':'password';};
pw.after(l);
})();
