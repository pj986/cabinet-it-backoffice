# Cabinet IT — Site vitrine + Back-office (Node.js / Express / MySQL)

Application web réalisée dans un contexte BTS SIO (option SLAM).  
Le site public présente les services d’un cabinet informatique, et un back-office sécurisé permet à un administrateur de gérer les contenus (services) et les messages reçus via le formulaire de contact.

## ✨ Fonctionnalités

### Site public
- Pages : Accueil, Services, À propos, Contact
- Liste des services depuis la base de données
- Formulaire de contact (stockage MySQL)

### Back-office (Admin)
- Authentification + sessions (accès protégé aux routes `/admin/*`)
- Gestion des services (CRUD) :
  - Ajouter / Modifier / Supprimer
  - Dupliquer un service
  - Ordre d’affichage via champ `position` + boutons ↑ ↓
- Recherche admin (titre + description)
- Pagination des services
- Surlignage du terme recherché dans le tableau (UX)
- Gestion des messages :
  - Liste des messages reçus
  - Suppression d’un message

## 🧱 Stack technique
- **Node.js** / **Express**
- **MySQL** (via mysql2)
- HTML/CSS (pages rendues côté serveur)
- JavaScript

## 🗂️ Structure du projet (MVC)
- `models/` : accès DB (ServiceModel, MessageModel)
- `controllers/` : logique métier (adminController, etc.)
- `routes/` : routes Express (public/admin/auth)
- `views/` : pages HTML (public + admin)
- `public/` : assets statiques (CSS)

## ✅ Pré-requis
- Node.js + npm
- MySQL (ex: via WAMP/XAMPP)
- Un schéma de base avec les tables nécessaires (`services`, `messages`, `admins`)

## 🚀 Installation & lancement

### 1) Installer les dépendances
```bash
npm install
