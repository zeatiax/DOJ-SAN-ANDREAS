# Portail DOJ San Andreas — installation 100 % gratuite

Le site fonctionne sur **GitHub Pages** et envoie les formulaires vers Discord grâce à **Google Apps Script**.

## Mise en ligne
1. Crée un dépôt public GitHub nommé `doj-san-andreas`.
2. Ajoute `index.html`, `styles.css` et `app.js`.
3. Ouvre **Settings → Pages**.
4. Choisis **Deploy from a branch**, branche `main`, dossier `/root`.

## Discord
1. Dans chaque salon : **Paramètres → Intégrations → Webhooks**.
2. Crée les webhooks pour les plaintes, partenariats et candidatures.
3. Ne mets jamais les webhooks directement dans le site public.

## Google Apps Script
1. Crée un projet Google Apps Script.
2. Colle le contenu de `apps-script.gs`.
3. Remplace les valeurs `COLLE_ICI_WEBHOOK...`.
4. **Déployer → Nouveau déploiement → Application Web**.
5. Exécuter en tant que : **Moi**. Accès : **Tout le monde**.
6. Copie l'URL se terminant par `/exec`.
7. Dans `app.js`, remplace `COLLE_ICI_TON_URL_GOOGLE_APPS_SCRIPT` par cette URL.
8. Remets `app.js` sur GitHub.

Le site est fictif et destiné au roleplay.
