/* Configuration : l'adresse publique du site (https://…).
   Sur file:// (fichier ouvert directement), location.origin vaut "null" :
   c'est pourquoi on utilise cette adresse fixe pour les liens de partage. */
const SITE_URL = location.protocol.startsWith('http')
  ? location.origin + location.pathname
  : 'https://business-express-ci.web.app/';
