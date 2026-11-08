(function(){
const $=id=>document.getElementById(id);
function h(tag,text,cls){
const e=document.createElement(tag);
if(text!=null)e.textContent=text;
if(cls)e.className=cls;
return e;
}

const st=document.createElement('style');
st.textContent='body:not([data-tab="acc"]) #xfaq{display:none!important}'+
'#xfaq details{border:1px solid var(--bd);border-radius:10px;padding:10px}'+
'#xfaq summary{font-weight:700;cursor:pointer}'+
'#xfaq details p{margin:8px 0 0}';
document.head.append(st);

const faq=h('section');faq.id='xfaq';faq.hidden=true;
($('xrev')||$('xmine')||$('xgrid')).after(faq);

const QA=[
['Comment publier une annonce ?','Connecte-toi, appuie sur « Vendre » en haut, remplis le formulaire (photos, titre, prix, ville) puis clique sur « Publier mon annonce ».'],
['Pourquoi mon annonce n’est pas visible ?','Chaque annonce est vérifiée avant d’être mise en ligne. Tu peux voir son statut dans « Mes annonces ».'],
['Comment contacter un vendeur ?','Ouvre l’annonce, puis appuie sur « Message » ou « Voir le numéro du vendeur ». Il faut être connecté.'],
['Comment éviter les arnaques ?','Vois toujours le produit avant de payer et n’envoie jamais d’argent à l’avance. Si quelque chose te semble suspect, utilise « Signaler cette annonce ».'],
['Comment laisser un avis ?','Demande la confirmation de vente depuis l’annonce. Quand le vendeur confirme, tu peux noter le vendeur.'],
['Comment contacter l’agence ?','Dans « Mon compte », utilise le formulaire « Contacter l’agence » ou écris-nous sur WhatsApp.']
];

faq.append(h('h2','Questions fréquentes'));
QA.forEach(([q,a])=>{
const d=document.createElement('details');
d.append(h('summary',q),h('p',a,'mu'));
faq.append(d);
});

const card=h('button',null,'card');card.type='button';
card.append(h('b','❓ FAQ'));
card.onclick=()=>{
['xmine','xrev'].forEach(k=>{if($(k))$(k).hidden=true;});
faq.hidden=!faq.hidden;
if(!faq.hidden)faq.scrollIntoView();
};
$('xgrid').append(card);
})();
