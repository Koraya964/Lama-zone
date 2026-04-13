# Plateforme de Petites Annonces

Projet pédagogique — modules 3 & 4 du titre pro RNCP37674.  
Architecture séparée : **backend Express ES6+** + **frontend React**.

---

## Stack technique

| Côté            | Techno                         |
| --------------- | ------------------------------ |
| Backend         | Node.js + Express (ES Modules) |
| Frontend        | React (CRA)                    |
| Base de données | MySQL                          |
| Auth            | JWT + bcrypt                   |

---

## Pourquoi ES Modules ?

Le backend utilise `"type": "module"` dans le `package.json`. Ça veut dire :

- `import` / `export` partout à la place de `require` / `module.exports`
- Les imports de fichiers locaux **doivent** inclure l'extension `.js`
- `__dirname` et `__filename` ne sont pas disponibles nativement (à recréer si besoin avec `import.meta.url`)

---

## Structure du projet

```
petites-annonces/
├── backend/
│   ├── src/
│   │   ├── index.js                   ← point d'entrée Express
│   │   ├── config/
│   │   │   └── db.js                  ← pool MySQL
│   │   ├── middleware/
│   │   │   └── auth.js                ← vérification JWT
│   │   ├── routes/
│   │   │   ├── test.js                ← GET /api/test
│   │   │   └── annonces.js            ← CRUD annonces
│   │   └── controllers/
│   │       └── annoncesController.js
│   ├── uploads/                       ← images (module 11)
│   ├── database.sql
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── index.jsx
    │   ├── services/
    │   │   └── api.js
    │   └── pages/
    │       ├── Home.jsx
    │       ├── AnnonceDetail.jsx
    │       ├── NewAnnonce.jsx
    │       ├── Login.jsx
    │       └── Register.jsx
    ├── public/index.html
    ├── .env.example
    └── package.json
```

---

## Installation

### Prérequis

- Node.js ≥ 18
- MySQL en local (WAMPP, Laragon, ou autre)

---

### 1. Base de données

```bash
mysql -u root -p < backend/database.sql
```

Ou importer `backend/database.sql` via phpMyAdmin.

---

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Remplir le `.env` avec tes infos MySQL, puis :

```bash
npm run dev
```

Serveur sur `http://localhost:5000`.  
Tester : `GET http://localhost:5000/api/test`

---

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

App sur `http://localhost:3000`.

---

## Routes API (module 4)

| Méthode | Route               | Auth | Description                    |
| ------- | ------------------- | ---- | ------------------------------ |
| GET     | `/api/test`         | Non  | Vérification serveur           |
| GET     | `/api/annonces`     | Non  | Liste des annonces (+ filtres) |
| GET     | `/api/annonces/:id` | Non  | Détail d'une annonce           |
| POST    | `/api/annonces`     | Oui  | Créer une annonce              |
| PUT     | `/api/annonces/:id` | Oui  | Modifier une annonce           |
| DELETE  | `/api/annonces/:id` | Oui  | Supprimer une annonce          |

### Filtres disponibles sur GET /api/annonces

```
?q=vélo
?categorie=3
?prix_min=50
?prix_max=500
?localisation=paris
```

---

## Tester avec Postman

1. `GET /api/test` — vérifier que le serveur répond
2. `GET /api/annonces` — liste vide, c'est normal
3. `POST /api/annonces` (token requis après module 5) :

```json
{
  "titre": "Vélo de route",
  "description": "Très bon état, peu utilisé",
  "prix": 250,
  "localisation": "Bordeaux"
}
```

---

## Notes

- Les routes `POST`, `PUT`, `DELETE` nécessitent un header `Authorization: Bearer <token>` — câblé lors du module 5.
- Le dossier `uploads/` est prévu pour le module 11 (multer).
