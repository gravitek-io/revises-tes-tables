# Tables de Multiplication - Application Ludique

Une application web interactive pour aider les enfants à réviser leurs tables de multiplication de façon amusante et engageante.

## 🎯 Fonctionnalités

- **Configuration personnalisable** : Choix du nombre de questions (5-30) et des tables à réviser (1-10)
- **Jeu interactif** : Questions aléatoires avec feedback en temps réel et système de streak
- **Suivi des progrès** : Statistiques détaillées et historique des sessions
- **Interface ludique** : Design coloré avec animations et messages d'encouragement
- **Stockage local** : Sauvegarde automatique des paramètres et sessions
- **Responsive** : Optimisé pour ordinateurs, tablettes et mobiles

## 🚀 Technologies

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique pour la sécurité du code
- **Tailwind CSS** - Framework CSS utilitaire
- **Lucide React** - Icônes modernes
- **React Toastify** - Notifications élégantes

## 🎮 Comment utiliser l'application

1. **Configuration** : Sélectionnez le nombre de questions et les tables à réviser
2. **Jeu** : Répondez aux questions de multiplication qui s'affichent
3. **Résultats** : Consultez vos performances et encouragements personnalisés
4. **Statistiques** : Suivez vos progrès dans le temps

## 📦 Installation

```bash
# Cloner le projet
git clone <url-du-repo>
cd revises-tes-tables

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Construire pour la production
npm run build
npm start
```

## 🌟 Caractéristiques pédagogiques

- **Apprentissage adaptatif** : Identification des tables les plus difficiles
- **Messages d'encouragement** : Feedback positif basé sur les performances
- **Suivi des progrès** : Visualisation des améliorations dans le temps
- **Interface enfant** : Design attractif avec couleurs modernes et animations

## 📱 Pages de l'application

- **Accueil** (`/`) - Page principale avec aperçu des statistiques
- **Configuration** (`/config`) - Paramétrage du jeu
- **Jeu** (`/game`) - Interface de révision interactive
- **Résultats** (`/results`) - Analyse des performances après chaque session
- **Statistiques** (`/stats`) - Historique détaillé et tendances

## 🎨 Design

L'application utilise un design moderne avec :
- Dégradés colorés attractifs pour les enfants
- Animations ludiques (bounce, wiggle, slide)
- Interface responsive pour tous les écrans
- Typographie claire et lisible

## 💾 Stockage des données

Les données sont stockées localement dans le navigateur :
- Paramètres de configuration
- Historique des sessions (50 dernières)
- Statistiques globales et par table

## 🔧 Scripts disponibles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire l'application pour la production
- `npm run start` - Démarrer l'application en production
- `npm run lint` - Vérifier la qualité du code

## 🚀 Déploiement

L'application est hébergée sur un **Scaleway Serverless Container** (région Paris)
qui se met en veille quand personne ne l'utilise (coût proche de zéro à vide).
L'image Docker sert l'export statique Next.js avec nginx.

- L'infrastructure est décrite en Terraform dans [`infra/`](infra/).
- Chaque fusion sur `main` déclenche [`deploy.yml`](.github/workflows/deploy.yml) :
  construction de l'image, publication dans le Container Registry Scaleway, puis
  `terraform apply`.
- Chaque pull request est vérifiée par [`ci.yml`](.github/workflows/ci.yml) :
  lint, build, scan de l'image, tests de fumée et `terraform plan`.
- Les secrets sont gérés dans Infisical ; GitHub ne stocke que l'identifiant de
  la machine identity Infisical.

Le guide complet (bootstrap, DNS, rollback) est dans [`infra/README.md`](infra/README.md).

## 📄 Licence

Ce projet est distribué sous la licence Apache 2.0. Voir le fichier [LICENSE](LICENSE) pour plus de détails.