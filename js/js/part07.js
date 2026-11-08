(function(){
const $=id=>document.getElementById(id);

/* Nom officiel */
document.title="Zarakoustra";
document.querySelector("header h1").textContent="Zarakoustra";

/* Nouvelles villes */
const cities=[
"Bonoua","Yaou","Grand-Bassam",
"Adiaké","Assinie","Aboisso"
];
["vi","fv"].forEach(id=>{
const s=$(id);
if(s)cities.forEach(v=>{
if(![...s.options].some(o=>o.value===v))
s.add(new Option(v,v));
});
});

/* Paramètres */
const panel=document.createElement("section");
panel.id="settingsPanel";
panel.innerHTML=`
<h2>Paramètres</h2>

<h3>Mon espace</h3>
<button class="btn2" data-open="xmine">📋 Mes annonces</button>
<button class="btn2" data-open="xrev">⭐ Mes avis</button>
<button class="btn2" data-open="xfaq">❓ Questions fréquentes</button>
<button class="btn2" data-open="xnotif">🔔 Notifications</button>
<button class="btn2" data-open="xfol">👥 Mes abonnés</button>
<button class="btn2" data-open="xmoney">💰 Faire l’argent</button>
<button class="btn2" data-open="xprofile">📤 Partager mon profil</button>
<button class="btn2" data-open="xname">✏️ Mon nom</button>
<button class="btn2" data-open="xagency">🚩 Contacter l’agence</button>

<h3>Préférences</h3>

<label for="appLanguage">Langue</label>
<select id="appLanguage">
<option value="fr">🇫🇷 Français</option>
<option value="en">🇬🇧 English</option>
<option value="es">🇪🇸 Español</option>
<option value="de">🇩🇪 Deutsch</option>
</select>

<label>Apparence</label>
<select id="appTheme">
<option value="light">☀️ Mode clair</option>
<option value="dark">🌙 Mode sombre</option>
</select>

<h3>Agence ZARAKOUSTRA</h3>
<a class="lnk btn" href="https://wa.me/2250170075417">
Contacter sur WhatsApp
</a>
<a class="lnk btn2" href="mailto:businessci1213@gmail.com">
Envoyer un e-mail
</a>
`;

$("xacc").append(panel);

panel.querySelectorAll('[data-open]').forEach(b=>{
b.addEventListener('click',()=>{
const target=b.dataset.open;

document.body.classList.remove('settings-open');

if(target==='xagency'){
$('xag').scrollIntoView();
return;
}

if(target==='xname'){
$('xname').scrollIntoView();
return;
}

if(target==='xprofile'){
const c=[...$('xgrid').querySelectorAll('.card')]
.find(e=>e.textContent.includes('Partager mon profil'));
if(c)c.click();
return;
}

const card=[...$('xgrid').querySelectorAll('.card')]
.find(e=>e.textContent.includes(
({
xmine:'Mes annonces',
xrev:'Avis',
xfaq:'FAQ',
xnotif:'Notifications',
xfol:'Abonnés',
xmoney:'Faire l’argent'
})[target]||'---'
));

if(card)card.click();
});
});

/* Mémorisation du thème */
const theme=$("appTheme");
const lang=$("appLanguage");

theme.value=localStorage.getItem("zarathoustra_theme")||"light";
lang.value=localStorage.getItem("zarathoustra_language")||"fr";

function applyTheme(){
document.documentElement.dataset.theme=theme.value;
localStorage.setItem("zarathoustra_theme",theme.value);
}
theme.onchange=applyTheme;
lang.onchange=()=>{
localStorage.setItem("zarathoustra_language",lang.value);
};
applyTheme();

/* Correction du nom dans les textes générés */
const observer=new MutationObserver(()=>{
document.querySelectorAll("header h1").forEach(e=>{
if(e.textContent==="ZARATHOUSTRA")e.textContent="Zarathoustra";
});
});
observer.observe(document.body,{childList:true,subtree:true});
})();
