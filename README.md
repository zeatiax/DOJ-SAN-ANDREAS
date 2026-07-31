# Department of Justice — San Andreas

Portail DOJ RP construit avec React, Vite, Supabase et Discord OAuth.

## Installation locale

1. Copie `.env.example` en `.env`.
2. Renseigne l’URL Supabase et la **Publishable key**.
3. Lance :

```bash
npm install
npm run dev
```

## Mise en ligne sur GitHub Pages

1. Remplace le contenu de ton dépôt par ce projet.
2. Dans GitHub : `Settings > Secrets and variables > Actions`.
3. Crée deux secrets :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Dans `Settings > Pages`, choisis **GitHub Actions** comme source.
5. Envoie les fichiers sur la branche `main`.

## Base de données

Dans Supabase, ouvre `SQL Editor`, colle le contenu de `supabase/schema.sql`, puis exécute-le.

## Authentification Discord

Dans Supabase, l’URL du site et l’URL autorisée doivent être :

`https://zeatiax.github.io/DOJ-SAN-ANDREAS/`

La callback Discord reste celle indiquée par Supabase :

`https://<project-id>.supabase.co/auth/v1/callback`

## Sécurité

Ne mets jamais la **Secret key** Supabase dans ce projet. Seule la **Publishable key** est destinée au navigateur.
