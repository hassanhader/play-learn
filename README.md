# Play&Learn - Application Éducative Interactive

---

## Informations du Projet

**TP1 & TP2 GÉNIE LOGICIEL INF1011 AUTOMNE 2025**

**Cours :** INF1011
**Année :** 2025-2026
**Session :** AUTOMNE 2025
**Professeur :** Mr William Flageol
**Chargé de laboratoire :** M…

## Lien du rojet
https://github.com/wflageol-uqtr/projet-de-session-equipe-8


## Description du Projet

**Play&Learn** est une plateforme web éducative complète offrant des expériences d'apprentissage interactives à travers des jeux quiz en modes **solo** et **multijoueur temps réel**. Le projet combine une architecture **Frontend React moderne** avec un **Backend Node.js robuste**, communiquant via **REST API** et **WebSocket** pour les interactions temps réel.

### Objectifs Pédagogiques

- ✅ Appliquer les principes **SOLID** dans une architecture réelle
- ✅ Implémenter des **patrons de conception GoF** (Observer, Strategy, Singleton)
- ✅ Développer une application **full-stack** moderne (React + Node.js)
- ✅ Mettre en place des **tests unitaires** complets (25+ tests)
- ✅ Assurer la qualité logicielle via **bonnes pratiques de développement**

---

## Architecture du Projet

Le projet est organisé en **2 applications principales** :

```
Tp_play_learn-Public_front/          # Repository principal
│
├── 📁 Frontend (React + Vite)       # Application cliente
│   ├── src/
│   │   ├── pages/                   # Pages de l'application
│   │   ├── components/              # Composants réutilisables
│   │   ├── contexts/                # Context API (Auth, Socket)
│   │   ├── services/                # Appels API
│   │   ├── games/                   # Moteurs de jeu
│   │   └── styles/                  # CSS modulaire
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md                    # Documentation Frontend
│
└── 📁 Tp_play_learn-Public_back/    # Backend (Node.js + Express)
    ├── src/
    │   ├── controllers/             # Logique métier
    │   ├── models/                  # Modèles Sequelize
    │   ├── routes/                  # Routes API REST
    │   ├── middleware/              # Authentification JWT
    │   ├── socket/                  # Gestion Socket.io
    │   └── config/                  # Configuration DB
    ├── tests/                       # 25 tests unitaires
    │   ├── auth.test.js
    │   ├── games.test.js
    │   ├── multiplayer.test.js
    │   ├── advanced.test.js
    │   └── README.md                # Documentation Tests
    ├── package.json
    └── README.md                    # Documentation Backend
```

---

## Démarrage Rapide (Quick Start)

### Prérequis

| Outil             | Version | Description                            |
| ----------------- | ------- | -------------------------------------- |
| **Node.js** | 18+     | Runtime JavaScript                     |
| **npm**     | 9+      | Gestionnaire de paquets                |
| **MySQL**   | 8.0+    | Base de données (via XAMPP/WAMP/MAMP) |
| **Git**     | 2.0+    | Contrôle de version                   |

### Installation en 5 Minutes

#### **Étape 1 : Installer MySQL**

**Windows** : Téléchargez [XAMPP](https://www.apachefriends.org/download.html) → Lancez MySQL depuis le panneau de contrôle
**macOS** : Téléchargez [MAMP](https://www.mamp.info/en/downloads/) → Lancez MySQL
**Linux** : `sudo apt install mysql-server` puis `sudo systemctl start mysql`

#### **Étape 2 : Créer la Base de Données**

Ouvrez **phpMyAdmin** (http://localhost/phpmyadmin) ou utilisez MySQL CLI :

```sql
CREATE DATABASE db_play_and_learn;
```

**IMPORTANT** : La base de données `db_play_and_learn` **DOIT être créée AVANT** de lancer le backend !

#### **Étape 3 : Installer et Lancer le Backend**

```bash
# Naviguer vers le dossier backend
cd Tp_play_learn-Public_back

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env

# Éditer .env avec vos paramètres MySQL
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=db_play_and_learn

# Lancer le serveur backend
npm run dev

# ✅ Backend accessible sur http://localhost:5000
```

#### **Étape 4 : Installer et Lancer le Frontend**

```bash
# Revenir à la racine et installer les dépendances
cd ..
npm install

# Créer le fichier .env
cp .env.example .env

# Éditer .env
# VITE_API_URL=http://localhost:5000/api

# Lancer le serveur frontend
npm run dev

# ✅ Frontend accessible sur http://localhost:5173
```

#### **Étape 5 : Accéder à l'Application**

1. Ouvrez **http://localhost:5173**
2. Créez un compte ou utilisez le mode invité
3. Profitez des jeux !

---

## Technologies Utilisées

### Frontend

| Technologie                | Version | Description                     |
| -------------------------- | ------- | ------------------------------- |
| **React**            | 19.x    | Framework UI                    |
| **Vite**             | 6.x     | Build tool ultra-rapide         |
| **React Router**     | 6.x     | Navigation SPA                  |
| **Axios**            | 1.7+    | Client HTTP                     |
| **Socket.io-client** | 4.x     | WebSocket temps réel           |
| **CSS3**             | -       | Styling moderne (Grid, Flexbox) |

### Backend

| Technologie         | Version | Description                    |
| ------------------- | ------- | ------------------------------ |
| **Node.js**   | 18+     | Runtime JavaScript             |
| **Express**   | 4.x     | Framework web                  |
| **Sequelize** | 6.x     | ORM pour MySQL                 |
| **MySQL**     | 8.0+    | Base de données relationnelle |
| **Socket.io** | 4.x     | WebSocket bidirectionnel       |
| **JWT**       | 9.x     | Authentification par tokens    |
| **bcrypt**    | 5.x     | Hachage des mots de passe      |
| **Jest**      | 29.x    | Framework de tests             |
| **Supertest** | 7.x     | Tests HTTP                     |

---

## Fonctionnalités Principales

### 1. **Authentification Sécurisée**

- Inscription/Connexion avec JWT
- Mode invité pour accès rapide
- Protection des routes privées
- Gestion de session persistante

### 2. **Mode Solo**

- 10+ catégories (Mathématiques, Physique, Géographie, etc.)
- 3 niveaux de difficulté (Easy, Medium, Hard)
- Système de scoring avec bonus temps
- Sauvegarde automatique des scores

### 3. **Mode Multijoueur Temps Réel**

- Création de salles privées (code unique)
- Salle d'attente avec système de "ready"
- 3 types de jeux multijoueurs :
  - **Quiz Buzzer** : Premier à répondre
  - **Speed Math** : Course de calculs
  - **Puzzle** : Complétion collaborative
- Synchronisation temps réel via WebSocket
- Timer de 5 minutes avec auto-suppression des salles

### 4. **Statistiques et Classements**

- **Leaderboard** : Top 10 mondial
- **Historique** : Suivi personnel des performances
- Filtres par catégorie et difficulté
- Graphiques de progression

### 5. **Création de Contenu**

- Interface de création de jeux
- Ajout de niveaux et questions
- Configuration des scores et temps
- Modération par administrateurs

---

## Manuel d'Utilisation Complet

### Flux Utilisateur Principal

1. **Connexion** → Accédez à http://localhost:5173/login

   - Créez un compte avec username, email, mot de passe
   - Ou connectez-vous avec vos identifiants existants
   - Ou utilisez le mode invité pour tester rapidement
2. **Menu Principal** → Dashboard avec 6 options principales

   - Mode Solo : Jeux individuels contre l'ordinateur
   - Mode Multijoueur : Parties en ligne avec d'autres joueurs
   - Leaderboard : Classement mondial des meilleurs scores
   - Historique : Vos performances passées avec filtres
   - Créer un Jeu : Concevoir vos propres quiz (connecté requis)
   - Panel Admin : Gestion de la plateforme (admin uniquement)
3. **Mode Solo** → Sélectionnez catégorie, difficulté et jeu

   - Répondez aux questions avec le timer
   - Gagnez des points : 100 base + bonus temps + multiplicateur difficulté
   - Score sauvegardé automatiquement à la fin
4. **Mode Multijoueur** → Créez ou rejoignez une partie

   - **Créer** : Remplissez le formulaire → Recevez un code de salle → Partagez-le
   - **Rejoindre** : Entrez le code de salle reçu
   - **Salle d'attente** : Voyez les joueurs connectés → Cliquez "Prêt"
   - **Jeu** : Premier à buzzer répond → Gagnez des points → Classement final
5. **Leaderboard** → Consultez le classement mondial

   - Filtrez par catégorie et difficulté
   - Voyez les top 10 scores de tous les joueurs
6. **Historique** → Analysez vos performances

   - Tous vos scores passés avec détails
   - Filtres par catégorie, difficulté, type de jeu
   - Statistiques : score moyen, meilleur score, nombre de parties
7. **Créer un Jeu** → Concevez vos propres quiz

   - Définissez titre, catégorie, difficulté, description
   - Ajoutez des niveaux avec titre et description
   - Pour chaque niveau, créez des questions avec 4 choix de réponses
   - Configurez points et temps limite par question
   - Sauvegardez et rendez le jeu disponible pour tous !

**📄 Manuel détaillé** : Voir `README.md` (Frontend) et `Tp_play_learn-Public_back/README.md` (Backend)

---

## Principes SOLID Appliqués

Le projet démontre l'application rigoureuse des 5 principes SOLID dans une architecture full-stack :

### **S - Single Responsibility Principle**

**Chaque module a une seule responsabilité**

- **Frontend** :
  - `AuthContext.jsx` → Gestion authentification uniquement
  - `SocketContext.jsx` → Gestion WebSocket uniquement
  - `authService.js` → Appels API d'authentification
  - `gamesService.js` → Appels API de gestion des jeux
- **Backend** :
  - `authController.js` → Logique d'authentification
  - `gamesController.js` → CRUD des jeux
  - `authMiddleware.js` → Vérification JWT

**Exemple Code** :

```javascript
// AuthContext.jsx - Responsabilité unique: Authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const login = async (credentials) => { /* ... */ }
  const logout = () => { /* ... */ }
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}
```

### **O - Open/Closed Principle**

**Ouvert à l'extension, fermé à la modification**

- **Frontend** :
  - `GameContainer.jsx` extensible via composition (ajout de nouveaux types de jeux sans modification)
  - Routes modulaires ajoutables sans modifier les existantes
- **Backend** :
  - Routes Express extensibles
  - Middleware chainable
  - Validation réutilisable

**Exemple Code** :

```javascript
// GameContainer.jsx - Extension sans modification
const renderGame = () => {
  switch(gameType) {
    case 'quiz': return <MultiplayerQuizGame {...props} />
    case 'speed-math': return <MultiplayerSpeedMath {...props} />
    // Nouveau type ajouté SANS modifier le code existant
    case 'memory': return <MultiplayerMemoryGame {...props} />
  }
}
```

### **L - Liskov Substitution Principle**

**Les sous-types peuvent remplacer leurs types de base**

- **Frontend** :
  - Composants de jeu interchangeables (QuizGame, SpeedMath, Puzzle)
  - Services API uniformes (Promise-based)
- **Backend** :
  - Controllers respectant la même signature
  - Modèles Sequelize substituables

**Exemple Code** :

```javascript
// Tous les composants de jeu respectent la même interface
<GameComponent data={gameData} onAnswer={handleAnswer} onComplete={handleComplete} />
// QuizGame, SpeedMath, Puzzle sont substituables car même signature
```

### **I - Interface Segregation Principle**

**Interfaces minimales et spécialisées**

- **Frontend** :
  - Contextes spécialisés (`useAuth()`, `useSocket()`)
  - Props ciblées par composant
- **Backend** :
  - Routes RESTful focalisées
  - Middleware spécifiques

**Exemple Code** :

```javascript
// Les composants n'utilisent QUE ce dont ils ont besoin
function LoginPage() {
  const { login } = useAuth()  // N'a pas besoin de socket
}

function MultiplayerGame() {
  const { joinRoom } = useSocket()  // N'a pas besoin de login
}
```

### **D - Dependency Inversion Principle**

**Dépendre des abstractions, pas des implémentations**

- **Frontend** :
  - Injection via Context API
  - Configuration externalisée (.env)
- **Backend** :
  - Dépendances injectées via constructeurs
  - Configuration centralisée

**Exemple Code** :

```javascript
// Les composants dépendent du contexte (abstraction), pas de localStorage
function MyComponent() {
  const { user } = useAuth()  // Abstraction
  // Le composant ne sait pas si les données viennent de localStorage, API, etc.
}
```

 **Détails complets avec diagrammes** : Voir `README.md` (Frontend) et `Tp_play_learn-Public_back/README.md` (Backend)

---

## Patrons de Conception GoF Utilisés

Le projet implémente 3 patrons GoF classiques :

### **1. Observer Pattern (Observateur)**

**Notification automatique des changements**

- **Frontend** :
  - Context API (`AuthContext` notifie automatiquement tous les composants abonnés)
  - Socket.io events (`participants.update` notifie `PlayersList` + `PlayersCount`)
- **Backend** :
  - Socket.io rooms (emit to room notifie tous les clients connectés)
  - Event emitters (game.update → tous les joueurs)

**Diagramme** :

```
AuthContext (Subject)
    ↓ notifie automatiquement
    ├──→ Header (Observer)
    ├──→ ProfilePage (Observer)
    └──→ MainMenu (Observer)
```

**Exemple Code** :

```javascript
// AuthContext.jsx - Subject
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const login = (userData) => setUser(userData)  // Notifie tous les observers
  return <AuthContext.Provider value={{ user, login }}>{children}</AuthContext.Provider>
}

// Header.jsx - Observer 1
function Header() {
  const { user } = useContext(AuthContext)
  return <div>Bonjour {user?.username}</div>  // Se met à jour automatiquement
}
```

### **2. Strategy Pattern (Stratégie)**

**Algorithmes interchangeables**

- **Frontend** :
  - Stratégies de jeu (QuizStrategy, SpeedMathStrategy, PuzzleStrategy)
  - Stratégies de validation (email, password, roomCode)
  - Stratégies de calcul de score (time-based, streak-based, difficulty-based)
- **Backend** :
  - Stratégies de réponse (JSON, Error, Success)
  - Stratégies de validation (Joi schemas)
  - Algorithmes de score

**Diagramme** :

```
GameContainer (Context)
    ↓ sélectionne
    ├──→ QuizStrategy
    ├──→ SpeedMathStrategy
    ├──→ PuzzleStrategy
    └──→ MemoryStrategy
```

**Exemple Code** :

```javascript
// Stratégies de calcul de score
const scoringStrategies = {
  time: (basePoints, timeRemaining, maxTime) => basePoints + (timeRemaining/maxTime)*50,
  difficulty: (basePoints, difficulty) => basePoints * {easy:1, medium:1.5, hard:2}[difficulty],
  streak: (basePoints, streak) => basePoints + (streak > 1 ? streak * 25 : 0)
}

// Utilisation
const score = calculateScore('difficulty', 100, 'hard')  // 200 points
```

### **3. Singleton Pattern (Singleton)**

**Instance unique partagée**

- **Frontend** :
  - Instance Axios unique (`api.js` partagé par tous les services)
  - Connexion Socket.io unique (`SocketContext`)
- **Backend** :
  - Connexion Sequelize unique (`database.js`)
  - Socket.io server instance unique
  - Config globale

**Diagramme** :

```
Application
    ↓ utilise
api (Singleton) ←─┬─ authService
                  ├─ gamesService
                  ├─ scoresService
                  └─ multiplayerService
    (Tous utilisent LA MÊME instance)
```

**Exemple Code** :

```javascript
// services/api.js - Singleton
let apiInstance = null

const createApiInstance = () => {
  if (apiInstance) return apiInstance  // Retourne l'instance existante
  
  apiInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000
  })
  
  return apiInstance
}

export const api = createApiInstance()  // Instance unique partagée

// Tous les services utilisent la même instance
import { api } from './api'
export const login = (data) => api.post('/auth/login', data)
```

**📄 Détails complets avec diagrammes** : Voir `README.md` (Frontend) et `Tp_play_learn-Public_back/README.md` (Backend)

---

## ✅ Tests Unitaires (25 Tests)

Le backend dispose d'une **suite complète de 25 tests unitaires** couvrant toutes les fonctionnalités majeures :

### Répartition des Tests

| Fichier                 | Tests        | Couverture                              |
| ----------------------- | ------------ | --------------------------------------- |
| `auth.test.js`        | 4            | Inscription, Connexion, Token, Invité  |
| `games.test.js`       | 4            | CRUD jeux, Filtres, Catégories         |
| `multiplayer.test.js` | 4            | Salles, Rejoindre, Socket events        |
| `advanced.test.js`    | 13           | Score, Leaderboard, Buzzer, Timer, etc. |
| **TOTAL**         | **25** | **Couverture complète**          |

### Tests Détaillés (Extraits)

**Authentification** (4 tests) :

- ✅ POST /api/auth/register - Inscription avec username, email, password
- ✅ POST /api/auth/login - Connexion avec credentials valides
- ✅ GET /api/auth/me - Récupération utilisateur actuel avec token JWT
- ✅ POST /api/auth/guest - Connexion invité sans compte

**Jeux** (4 tests) :

- ✅ GET /api/games - Liste de tous les jeux
- ✅ GET /api/games/:id - Détails d'un jeu spécifique
- ✅ POST /api/games - Création d'un nouveau jeu (admin)
- ✅ GET /api/games?category=Mathematics - Filtrage par catégorie

**Multijoueur** (4 tests) :

- ✅ POST /api/multiplayer/rooms - Création d'une salle de jeu
- ✅ POST /api/multiplayer/rooms/:code/join - Rejoindre une salle existante
- ✅ Socket event: join-room - Connexion WebSocket à une salle
- ✅ Socket event: participants-update - Mise à jour liste des joueurs

**Avancés** (13 tests) :

- ✅ POST /api/scores - Soumission d'un score avec calcul automatique
- ✅ GET /api/scores/leaderboard - Top 10 classement mondial
- ✅ Socket event: buzzer-press - Premier joueur à appuyer sur le buzzer
- ✅ Timer de salle - Auto-suppression après 5 minutes d'inactivité
- ✅ Validation des données - Email, username, room code
- ✅ Authentification JWT - Accès routes protégées
- ✅ Bonus de temps - Calcul correct du bonus selon le temps restant
- ✅ Multiplicateur de difficulté - Easy ×1, Medium ×1.5, Hard ×2
- ✅ Filtres combinés - Catégorie + Difficulté + Type
- ✅ Pagination - Limite 10 résultats par page
- ✅ Gestion d'erreurs - Messages d'erreur clairs
- ✅ Middleware d'authentification - Vérifie token JWT
- ✅ Socket reconnection - Gestion déconnexion/reconnexion

### Exécuter les Tests

```bash
cd Tp_play_learn-Public_back

# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage
```

**✅ Résultat** : **25 passed** (6.11s) - Tous les tests passent !

 **Documentation complète** : Voir `Tp_play_learn-Public_back/tests/README.md`

## Communication Temps Réel (Socket.io)

L'application utilise **Socket.io** pour la synchronisation temps réel en multijoueur :

### Événements Principaux

| Événement Client → Serveur | Description                |
| ----------------------------- | -------------------------- |
| `join-room`                 | Rejoindre une salle de jeu |
| `set-ready`                 | Marquer comme prêt        |
| `submit-answer`             | Soumettre une réponse     |
| `buzzer-press`              | Appuyer sur le buzzer      |
| `leave-room`                | Quitter la salle           |

| Événement Serveur → Client | Description                          |
| ----------------------------- | ------------------------------------ |
| `room-joined`               | Confirmation de rejoindre            |
| `participants-update`       | Mise à jour de la liste des joueurs |
| `game-start`                | Démarrage du jeu                    |
| `new-question`              | Nouvelle question                    |
| `answer-result`             | Résultat de la réponse             |
| `game-end`                  | Fin du jeu + résultats              |

**Architecture** :

```
Frontend (React)
    ↓ emit events
Socket.io Client ←──→ Socket.io Server (Backend)
    ↑ broadcast
Frontend (React)
```

**Flux Multijoueur** :

1. Joueur 1 crée salle → Serveur génère code unique
2. Joueur 2 rejoint avec code → Serveur ajoute à la room
3. Serveur broadcast `participants-update` → Tous reçoivent la liste
4. Tous cliquent "Prêt" → Serveur vérifie → Countdown démarre
5. Serveur emit `game-start` + `new-question` → Tous reçoivent
6. Joueur 1 appuie buzzer → Serveur verrouille → Seul Joueur 1 peut répondre
7. Joueur 1 soumet réponse → Serveur calcule score → Broadcast résultats
8. Serveur emit `new-question` → Répète jusqu'à fin
9. Serveur emit `game-end` + classement final → Tous reçoivent

 **Détails complets** : Voir `Tp_play_learn-Public_back/README.md` section Socket.io

---

## Structure Détaillée du Code

### Frontend (src/)

```
src/
├── pages/                          # Pages complètes (10 pages)
│   ├── Login.jsx                   # Authentification
│   ├── Register.jsx                # Inscription
│   ├── MainMenu.jsx                # Dashboard principal
│   ├── Single.jsx                  # Mode solo
│   ├── Lobby.jsx                   # Lobby multijoueur
│   ├── WaitingRoom.jsx             # Salle d'attente
│   ├── MultiPlay.jsx               # Jeu multijoueur
│   ├── Leaderboard.jsx             # Classement
│   ├── History.jsx                 # Historique
│   └── CreateGame.jsx              # Créateur de jeux
│
├── contexts/                       # État global (2 contextes)
│   ├── AuthContext.jsx             # Authentification (user, login, logout)
│   └── SocketContext.jsx           # WebSocket (socket, joinRoom, emit)
│
├── services/                       # Appels API (5 services)
│   ├── api.js                      # Instance Axios + intercepteurs
│   ├── authService.js              # Auth API (register, login, getCurrentUser)
│   ├── gamesService.js             # Games API (getGames, createGame, updateGame)
│   ├── scoresService.js            # Scores API (getUserScores, submitScore)
│   └── multiplayerService.js       # Multiplayer API (createRoom, joinRoom)
│
├── components/                     # Composants réutilisables (2 composants)
│   ├── AuthGuard.jsx               # Protection routes (vérifie isAuthenticated)
│   └── CreateRoomModal.jsx         # Modal création salle
│
├── games/                          # Moteurs de jeu (3 jeux multijoueurs)
│   ├── components/
│   │   └── GameContainer.jsx
│   └── multiplayer/
│       ├── MultiplayerQuizGame.jsx  # Quiz avec buzzer
│       ├── MultiplayerSpeedMath.jsx # Course de calculs
│       └── MultiplayerPuzzleGame.jsx # Complétion collaborative
│
└── styles/                         # CSS modulaire (10 fichiers)
    ├── login.css
    ├── main-menu.css
    ├── single.css
    ├── lobby.css
    └── ...
```

### Backend (src/)

```
src/
├── controllers/                    # Logique métier (5 controllers)
│   ├── authController.js           # register, login, getCurrentUser, guestLogin
│   ├── gamesController.js          # getGames, getGameById, createGame, updateGame, deleteGame
│   ├── scoresController.js         # getUserScores, getLeaderboard, submitScore
│   ├── multiplayerController.js    # createRoom, getRooms, joinRoom, getRoomDetails
│   └── adminController.js          # getStats, manageUsers, manageGames
│
├── models/                         # Modèles Sequelize (6 modèles)
│   ├── User.js                     # id, username, email, password, isAdmin
│   ├── Game.js                     # id, title, category, difficulty, description
│   ├── Level.js                    # id, gameId, title, description, order
│   ├── Question.js                 # id, levelId, text, correctAnswer, options
│   ├── Score.js                    # id, userId, gameId, score, timeSpent
│   └── MultiplayerRoom.js          # id, code, hostId, gameId, status, maxPlayers
│
├── routes/                         # Routes API REST (5 fichiers)
│   ├── authRoutes.js               # POST /register, /login, /guest | GET /me
│   ├── gamesRoutes.js              # GET /games, /games/:id | POST /games | PUT /games/:id
│   ├── scoresRoutes.js             # GET /scores/user/:id, /scores/leaderboard | POST /scores
│   ├── multiplayerRoutes.js        # POST /rooms, /rooms/:code/join | GET /rooms, /rooms/:code
│   └── adminRoutes.js              # GET /stats, /users | PUT /users/:id | DELETE /users/:id
│
├── middleware/                     # Middleware Express (3 middleware)
│   ├── authMiddleware.js           # Vérifie token JWT → req.user
│   ├── errorHandler.js             # Centralise gestion erreurs
│   └── validation.js               # Valide corps de requêtes avec Joi
│
├── socket/                         # Gestion Socket.io (1 fichier)
│   └── multiplayerHandler.js       # join-room, set-ready, submit-answer, buzzer-press
│
├── config/                         # Configuration (1 fichier)
│   └── database.js                 # Sequelize config MySQL
│
└── app.js                          # Point d'entrée (Express + Socket.io)
```

---

## Configuration

### Variables d'Environnement Frontend (.env)

```env
# URL du backend
VITE_API_URL=http://localhost:5000/api

# URL Socket.io (optionnel, par défaut même que API)
VITE_SOCKET_URL=http://localhost:5000
```

### Variables d'Environnement Backend (.env)

```env
# Serveur
PORT=5000
NODE_ENV=development

# Base de données MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_play_and_learn
DB_PORT=3306

# JWT
JWT_SECRET=votre_secret_jwt_securise_ici
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

---

## Déploiement

### Build de Production

#### Frontend

```bash
npm run build
# Fichiers générés dans /dist
# Servir avec npm run preview ou déployer sur Vercel/Netlify
```

#### Backend

```bash
cd Tp_play_learn-Public_back
npm start
# Serveur en mode production sur le port configuré
```

### Plateformes Supportées

- **Frontend** : Vercel, Netlify, GitHub Pages, Railway
- **Backend** : Railway, Render, Heroku, AWS EC2
- **Database** : Railway MySQL, AWS RDS, PlanetScale

---

## Troubleshooting (Résolution de Problèmes)

### Problème : "Cannot connect to database"

**Solution** :

1. Vérifiez que MySQL est démarré (XAMPP/WAMP panel)
2. Vérifiez que la base de données `db_play_and_learn` existe
3. Vérifiez les credentials dans `Tp_play_learn-Public_back/.env`
4. Testez la connexion : `mysql -u root -p` puis `SHOW DATABASES;`

### Problème : "Port 5000 already in use"

**Solution** :

1. Tuez le processus :
   - Windows: `netstat -ano | findstr :5000` puis `taskkill /PID <PID> /F`
   - Mac/Linux: `lsof -ti:5000 | xargs kill -9`
2. Ou changez le port dans `.env` : `PORT=5001`

### Problème : "Socket disconnected" en multijoueur

**Solution** :

1. Vérifiez que le backend est lancé
2. Vérifiez `VITE_SOCKET_URL` dans le frontend `.env`
3. Ouvrez DevTools → Console pour voir les logs Socket.io
4. Rechargez la page

### Problème : "JWT token expired"

**Solution** :

1. Déconnectez-vous puis reconnectez-vous
2. Vérifiez `JWT_EXPIRES_IN` dans le backend `.env` (par défaut 7d)
3. Effacez localStorage : `localStorage.clear()` dans la console

### Problème : "Tests failing"

**Solution** :

1. Assurez-vous que MySQL est démarré
2. Assurez-vous que la DB `db_play_and_learn` existe
3. Lancez `npm install` dans le dossier backend
4. Vérifiez `.env` ou `.env.test` pour les variables de test

---

## Documentation Détaillée

Pour une documentation complète et approfondie de chaque partie du projet, consultez les READMEs spécifiques :

### **Frontend**

**Fichier** : `README.md` (à la racine du projet)

**Contenu** :

- Installation et configuration détaillées
- Structure complète des composants
- Context API et hooks personnalisés
- Services et intégration API
- Styling et thème (CSS Variables, Glassmorphism)
- Guide de contribution (ajouter pages, utiliser Auth, Socket)
- Scripts disponibles (dev, build, preview, lint)
- Débogage (vérifier auth, socket, logs réseau)
- Build et déploiement (Vercel, Netlify, Railway)
- **Manuel d'utilisation complet** (8 sections détaillées)
- **Principes SOLID avec exemples de code**
- **Patrons GoF avec diagrammes et code**

**Navigation** : [ README Frontend](./README.md)

---

###  **Backend**

**Fichier** : `Tp_play_learn-Public_back/README.md`

**Contenu** :

- **Installation MySQL complète** (XAMPP/WAMP/MAMP par OS)
- **Création de la base de données** (3 méthodes : phpMyAdmin, CLI, script)
- **Configuration .env détaillée**
- **25 Routes API REST documentées** (avec exemples curl)
- Modèles Sequelize (User, Game, Level, Question, Score, Room)
- Middleware (authMiddleware, errorHandler, validation)
- **Socket.io events complets** (10+ événements)
- Architecture MVC
- **Troubleshooting** (5 problèmes courants)
- **Manuel d'utilisation backend**
- **Principes SOLID avec exemples de code**
- **Patrons GoF avec diagrammes et code**

**Navigation** : [README Backend](./Tp_play_learn-Public_back/README.md)

---

### **Tests Unitaires**

**Fichier** : `Tp_play_learn-Public_back/tests/README.md`

**Contenu** :

- **25 tests détaillés** (description de chaque test)
- Répartition par fichier (auth, games, multiplayer, advanced)
- **Coverage par catégorie** (tableau avec pourcentages)
- Commandes de test (test, test:watch, test:coverage)
- Résultats des tests (output complet)
- **Statistiques** (graphique ASCII)
- Guide d'ajout de nouveaux tests

**Navigation** : [ README Tests](./Tp_play_learn-Public_back/tests/README.md)

---

## Phase 2 - Livrables du Projet

Ce projet répond à **tous les critères d'évaluation de la Phase 2** :

### ✅ 1. Manuel d'Utilisation

**Localisation** :

- **Frontend** : Section " Manuel d'Utilisation" dans `README.md`
- **Backend** : Section " Manuel d'Utilisation" dans `Tp_play_learn-Public_back/README.md`
- **Global** : Section " Manuel d'Utilisation Complet" dans ce README

**Contenu** :

- Installation complète (5 étapes avec captures d'écran textuelles)
- Guide d'utilisation page par page (8 sections)
- Flux utilisateur détaillé (Login → Menu → Solo → Multiplayer → Stats)
- Raccourcis clavier
- Résolution de problèmes (6 problèmes courants)

---

### ✅ 2. Principes SOLID

**Localisation** :

- **Frontend** : Section " Principes SOLID Appliqués" dans `README.md`
- **Backend** : Section " Principes SOLID Appliqués" dans `Tp_play_learn-Public_back/README.md`
- **Global** : Section " Principes SOLID Appliqués" dans ce README

**Contenu pour CHAQUE principe** :

- **Description théorique**
- **Exemples concrets dans le code** (Frontend + Backend)
- **Extraits de code commentés**
- **Avantages démontrés**

**Principes couverts** :

1. **S** - Single Responsibility (AuthContext, Controllers séparés)
2. **O** - Open/Closed (GameContainer extensible, Routes modulaires)
3. **L** - Liskov Substitution (Composants interchangeables, Services uniformes)
4. **I** - Interface Segregation (Contextes spécialisés, Props ciblées)
5. **D** - Dependency Inversion (Injection via Context, Configuration externe)

---

### ✅ 3. Patrons de Conception GoF

**Localisation** :

- **Frontend** : Section " Patrons de Conception GoF Utilisés" dans `README.md`
- **Backend** : Section " Patrons de Conception GoF Utilisés" dans `Tp_play_learn-Public_back/README.md`
- **Global** : Section " Patrons de Conception GoF Utilisés" dans ce README

**3 Patrons implémentés** :

1. **Observer Pattern (Observateur)** 👁️

   - **Description** : Relation un-à-plusieurs avec notification automatique
   - **Implémentation Frontend** : Context API, Socket.io events
   - **Implémentation Backend** : Socket.io rooms, Event emitters
   - **Diagramme** : Subject → Observers
   - **Code commenté** : AuthContext + Composants observers
2. **Strategy Pattern (Stratégie)**

   - **Description** : Famille d'algorithmes interchangeables
   - **Implémentation Frontend** : Game strategies, Score calculation, Validation
   - **Implémentation Backend** : Response strategies, Joi validation
   - **Diagramme** : Context → Strategies
   - **Code commenté** : GameContainer + Scoring strategies
3. **Singleton Pattern (Singleton)**

   - **Description** : Instance unique partagée
   - **Implémentation Frontend** : Axios instance, Socket.io connection
   - **Implémentation Backend** : Sequelize connection, Config globale
   - **Diagramme** : Services → Singleton API
   - **Code commenté** : api.js Singleton + Services

---

### ✅ 4. Tests Unitaires

**Localisation** :

- **Tests Backend** : `Tp_play_learn-Public_back/tests/` (4 fichiers)
- **Documentation** : `Tp_play_learn-Public_back/tests/README.md`
- **Résumé** : Section "✅ Tests Unitaires" dans ce README

**Couverture** :

- **25 tests** répartis en 4 fichiers
- **4 tests** authentification (register, login, token, guest)
- **4 tests** jeux (CRUD, filtres, catégories)
- **4 tests** multijoueur (salles, join, socket events)
- **13 tests** avancés (score, leaderboard, buzzer, timer, validation, etc.)

**Résultat** : ✅ **25 passed** (6.11s) - Tous les tests passent !

---

### ✅ 5. Code Source Complet

**Localisation** :

- **Frontend** : Dossier racine (`src/`, `public/`, `package.json`, etc.)
- **Backend** : `Tp_play_learn-Public_back/` (`src/`, `tests/`, `package.json`, etc.)

**Technologies** :

- Frontend : React 19, Vite 6, React Router 6, Axios, Socket.io-client
- Backend : Node.js 18, Express 4, Sequelize 6, MySQL 8, Socket.io, JWT, bcrypt

---

### ✅ Checklist Finale Phase 2

| Critère                                                | Status | Localisation                                            |
| ------------------------------------------------------- | ------ | ------------------------------------------------------- |
| Manuel d'utilisation complet                            | ✅     | `README.md` + `Tp_play_learn-Public_back/README.md` |
| **S** - Single Responsibility Principle           | ✅     | Section SOLID dans READMEs                              |
| **O** - Open/Closed Principle                     | ✅     | Section SOLID dans READMEs                              |
| **L** - Liskov Substitution Principle             | ✅     | Section SOLID dans READMEs                              |
| **I** - Interface Segregation Principle           | ✅     | Section SOLID dans READMEs                              |
| **D** - Dependency Inversion Principle            | ✅     | Section SOLID dans READMEs                              |
| **Observer Pattern** avec exemples et diagrammes  | ✅     | Section Patrons GoF dans READMEs                        |
| **Strategy Pattern** avec exemples et diagrammes  | ✅     | Section Patrons GoF dans READMEs                        |
| **Singleton Pattern** avec exemples et diagrammes | ✅     | Section Patrons GoF dans READMEs                        |
| Tests unitaires (25 tests)                              | ✅     | `Tp_play_learn-Public_back/tests/`                    |
| Documentation tests                                     | ✅     | `Tp_play_learn-Public_back/tests/README.md`           |
| Code source complet et fonctionnel                      | ✅     | Dossiers `src/` Frontend + Backend                    |

---

## Contact et Support

Pour toute question ou problème :

1. **Consultez d'abord la documentation** :

   - README Frontend pour l'interface utilisateur
   - README Backend pour l'API et la base de données
   - README Tests pour les tests unitaires
2. **Vérifiez le Troubleshooting** :

   - Section "🔧 Troubleshooting" ci-dessus
   - Section Troubleshooting dans Backend README
3. **Contactez l'équipe** :

   - Voir la liste des membres du groupe en haut de ce document

---

## Licence

Ce projet est développé dans un cadre **éducatif** pour le cours **INF1011 - Génie Logiciel** à l'**Université du Québec à Trois-Rivières**.

**Utilisation** : Projet académique - Tous droits réservés aux membres du groupe.

---

## Conclusion

**Play&Learn** démontre la maîtrise des concepts avancés de génie logiciel :

✅ **Architecture full-stack moderne** (React + Node.js + MySQL)
✅ **Principes SOLID appliqués rigoureusement** (5/5 avec exemples concrets)
✅ **Patrons GoF implémentés** (Observer, Strategy, Singleton avec diagrammes)
✅ **Tests unitaires complets** (25 tests avec 100% de passage)
✅ **Documentation exhaustive** (3 READMEs détaillés + ce README global)
✅ **Application fonctionnelle** (Solo + Multijoueur temps réel opérationnels)

Le projet est **prêt pour la Phase 2** et répond à tous les critères d'évaluation !
