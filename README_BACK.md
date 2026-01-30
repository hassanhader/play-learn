# Play&Learn - Backend API

---

## Informations du Projet

**TP1 GÉNIE LOGICIEL INF1011 AUTOMNE 2025**

**Cours :** INF1011
**Année :** 2025-2026
**Session :** AUTOMNE 2025
**Professeur :** Mr William Flageol
**Chargé de laboratoire :** M…

### Membres du Groupe

| Nom                      | Code Permanent |
| ------------------------ | -------------- |
| Jean Thierry Lalong      | LALJ01379200   |
| Divine Masala Bikakala   | BIKD68270400   |
| Mohamed Heni Baabaa      | BAAM79260100   |
| Guo Yimin                | GUOY63260000   |
| Mohamadou Khadafi Hassan | MOHK93280200   |
| Hassan Hader             | HADH09289500   |

---

## Description

API REST Node.js avec Express, Sequelize (MySQL) et Socket.io pour l'application Play&Learn.

---

## Installation et Configuration

### Prérequis Obligatoires

Avant de commencer, vous devez avoir installé:

#### 1. **Node.js** (version 18 ou supérieure)

- **Windows/Mac/Linux**: Télécharger depuis [nodejs.org](https://nodejs.org)
- Vérifier l'installation: `node --version` et `npm --version`

#### 2. **Serveur MySQL** (choisissez selon votre OS)

##### **Windows**

- **XAMPP** (recommandé): [Download XAMPP](https://www.apachefriends.org/download.html)
  - Inclut Apache, MySQL, PHP
  - Interface graphique simple
- **WAMP**: [Download WAMP](https://www.wampserver.com/)
  - Alternative à XAMPP
- **MySQL Standalone**: [Download MySQL](https://dev.mysql.com/downloads/installer/)

##### **macOS**

- **MAMP**: [Download MAMP](https://www.mamp.info/en/downloads/)
- **Homebrew**: `brew install mysql`
- **XAMPP**: Compatible avec macOS

##### **Linux**

- **LAMP Stack**: `sudo apt install mysql-server` (Ubuntu/Debian)
- **XAMPP**: Version Linux disponible
- **MariaDB**: `sudo apt install mariadb-server`

---

### Étapes d'Installation

#### Étape 1: Cloner le Repository

```bash
git clone https://github.com/votre-repo/Tp_play_learn-Public_back.git
cd Tp_play_learn-Public_back
```

#### Étape 2: Installer les Dépendances

```bash
npm install
```

#### Étape 3: Démarrer MySQL

##### **Avec XAMPP (Windows/Mac/Linux)**

1. Ouvrir le **XAMPP Control Panel**
2. Cliquer sur **"Start"** pour le module **MySQL**
3. Vérifier que le statut est **"Running"** (vert)

##### **Avec WAMP (Windows)**

1. Lancer **WampServer**
2. Attendre que l'icône devienne **verte**
3. MySQL démarre automatiquement

##### **Avec MySQL Standalone**

```bash
# Windows (Services)
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
# ou
sudo service mysql start
```

#### Étape 4: Créer la Base de Données

 **IMPORTANT**: Cette étape est **OBLIGATOIRE** avant de démarrer le serveur!

##### **Option A: Via phpMyAdmin (XAMPP/WAMP)**

1. Ouvrir votre navigateur → `http://localhost/phpmyadmin`
2. Cliquer sur l'onglet **"SQL"**
3. Coller et exécuter:

```sql
CREATE DATABASE db_play_and_learn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Vérifier que la base apparaît dans la liste à gauche

##### **Option B: Via Ligne de Commande MySQL**

**Windows (XAMPP)**:

```bash
cd C:\xampp\mysql\bin
mysql.exe -u root -p
```

**macOS/Linux**:

```bash
mysql -u root -p
```

**Puis exécutez**:

```sql
CREATE DATABASE db_play_and_learn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;  -- Vérifier que db_play_and_learn apparaît
EXIT;
```

##### **Option C: Script Automatique (Recommandé)**

Créez un fichier `create-database.js` à la racine:

```javascript
const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'your_password'  // Changez si nécessaire
    });
  
    await connection.query('CREATE DATABASE IF NOT EXISTS db_play_and_learn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database "db_play_and_learn" created successfully!');
  
    await connection.end();
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
  }
}

createDatabase();
```

Exécutez:

```bash
node create-database.js
```

#### Étape 5: Configurer les Variables d'Environnement

```bash
# Copier le fichier exemple
cp .env.example .env
```

**Éditez le fichier `.env`** avec vos informations:

```env
# Serveur
PORT=5000
NODE_ENV=development

# Base de données MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=db_play_and_learn
DB_USER=root
DB_PASSWORD=              # Laissez vide si pas de mot de passe (XAMPP par défaut)
                          # Ou entrez votre mot de passe MySQL

# JWT Authentication
JWT_SECRET=votre_secret_super_securise_ici_changez_moi
JWT_EXPIRES_IN=7d

# CORS (Frontend URL)
FRONTEND_URL=http://localhost:5173
```

 **Notes importantes**:

- **XAMPP/WAMP par défaut**: `DB_PASSWORD` est souvent **vide** (pas de mot de passe)
- **MySQL standalone**: Vous avez défini un mot de passe lors de l'installation
- **DB_NAME**: Doit être exactement `db_play_and_learn`

#### Étape 6: Démarrer le Serveur

```bash
# Mode développement (avec auto-reload)
npm run dev

# Ou mode production
npm start
```

**Résultat attendu**:

```
✅ Database connected successfully
🔄 Synchronizing database models...
✅ Database synchronized
🚀 Server running on port 5000
🔌 Socket.io initialized
```

**Le serveur crée automatiquement toutes les tables** (Users, Games, Levels, Questions, Scores, MultiplayerRooms, etc.) grâce à Sequelize!

---

### Vérification de l'Installation

#### 1. Vérifier que le serveur fonctionne

```bash
# Depuis un autre terminal
curl http://localhost:5000/api/health

# Ou ouvrez dans le navigateur
http://localhost:5000
```

#### 2. Vérifier les tables créées

**Via phpMyAdmin**:

1. `http://localhost/phpmyadmin`
2. Sélectionnez la base `db_play_and_learn`
3. Vérifiez que les tables existent: `users`, `games`, `levels`, `questions`, `scores`, etc.

**Via MySQL CLI**:

```sql
mysql -u root -p
USE db_play_and_learn;
SHOW TABLES;
```

**Résultat attendu**:

```
+----------------------------------+
| Tables_in_db_play_and_learn      |
+----------------------------------+
| games                            |
| levels                           |
| MultiplayerGameStates            |
| MultiplayerParticipants          |
| MultiplayerRooms                 |
| questions                        |
| scores                           |
| users                            |
| UserProgresses                   |
+----------------------------------+
```

---

### Résolution de Problèmes Courants

#### Problème 1: "Cannot connect to database"

**Solution**:

1. Vérifiez que MySQL est démarré (XAMPP/WAMP)
2. Vérifiez les credentials dans `.env`:
   ```env
   DB_USER=root
   DB_PASSWORD=          # Vide pour XAMPP par défaut
   DB_NAME=db_play_and_learn
   ```
3. Testez la connexion MySQL:
   ```bash
   mysql -u root -p
   ```

#### Problème 2: "Unknown database 'db_play_and_learn'"

**Solution**:
Vous avez oublié l'Étape 4! Créez la base de données:

```sql
CREATE DATABASE db_play_and_learn;
```

#### Problème 3: "Port 5000 already in use"

**Solution**:

```bash
# Trouvez le processus utilisant le port 5000
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Ou changez le port dans .env
PORT=5001
```

#### Problème 4: "Access denied for user 'root'@'localhost'"

**Solution**:

- **XAMPP**: Le mot de passe est vide par défaut
  ```env
  DB_PASSWORD=
  ```
- **MySQL avec mot de passe**: Entrez votre mot de passe
  ```env
  DB_PASSWORD=votre_mot_de_passe
  ```

#### Problème 5: MySQL ne démarre pas (XAMPP)

**Solution**:

1. Fermez Skype (utilise le port 3306)
2. Ou changez le port MySQL dans XAMPP → Config → my.ini
3. Redémarrez XAMPP

---

### Configuration (.env Complète)

```env
# Serveur
PORT=5000
NODE_ENV=development

# Base de données MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=db_play_and_learn
DB_USER=root
DB_PASSWORD=your_password

# JWT Authentication
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# CORS (Frontend URL)
FRONTEND_URL=http://localhost:5173
```

## Structure du Projet

\\
 config/
    database.js          # Configuration Sequelize
 controllers/             # Logique métier
    authController.js    # Authentification
    gamesController.js   # Gestion des jeux
    scoresController.js  # Scores et classements
    multiplayerController.js  # Salles multijoueur
    progressController.js     # Progression utilisateur
    adminController.js   # Panel administrateur
 middleware/              # Middlewares Express
    authMiddleware.js    # Vérification JWT
    adminMiddleware.js   # Vérification droits admin
 models/                  # Modèles Sequelize
    User.js              # Utilisateurs
    Game.js              # Jeux
    Level.js             # Niveaux de jeu
    Question.js          # Questions/réponses
    Score.js             # Scores des parties
    UserProgress.js      # Progression par niveau
    MultiplayerRoom.js   # Salles de jeu
    MultiplayerParticipant.js  # Joueurs dans une salle
    MultiplayerGameState.js    # État du jeu en cours
    index.js             # Associations des modèles
 routes/                  # Routes Express
    authRoutes.js        # POST /auth/register, /auth/login
    gamesRoutes.js       # CRUD jeux
    scoresRoutes.js      # Scores et stats
    multiplayerRoutes.js # Salles multijoueur
    progressRoutes.js    # Progression
    adminRoutes.js       # Routes admin
 utils/
    socketHandlers.js    # Gestion événements Socket.io
 scripts/
    check-multiplayer-migration.js  # Migration auto DB
 migrations/              # Migrations Sequelize
 server.js                # Point d'entrée

\\\

## API Endpoints

### Authentication (\/api/auth\)

| Méthode | Route       | Description        | Auth      |
| -------- | ----------- | ------------------ | --------- |
| POST     | \/register\ | Créer un compte   | Public    |
| POST     | \/login\    | Se connecter       | Public    |
| POST     | \/guest\    | Connexion invité  | Public    |
| GET      | \/me\       | Utilisateur actuel | Protégé |

#### Exemples

\\\ash

# Inscription

curl -X POST http://localhost:5000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"username":"john","email":"john@test.com","password":"password123"}'

# Connexion

curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"john@test.com","password":"password123"}'

# Réponse:

{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@test.com",
    "isGuest": false,
    "isAdmin": false
  }
}
\\\

### Games (\/api/games\)

| Méthode | Route         | Description           | Auth   |
| -------- | ------------- | --------------------- | ------ |
| GET      | \/\           | Liste des jeux        | Public |
| GET      | \/:id\        | Détails d'un jeu     | Public |
| POST     | \/\           | Créer un jeu         | Admin  |
| PUT      | \/:id\        | Modifier un jeu       | Admin  |
| DELETE   | \/:id\        | Supprimer un jeu      | Admin  |
| GET      | \/categories\ | Liste des catégories | Public |

#### Filtres disponibles

\\\ash
GET /api/games?category=Mathematics&difficulty=medium&isMultiplayer=true
\\\

### Scores (\/api/scores\)

| Méthode | Route           | Description             | Auth      |
| -------- | --------------- | ----------------------- | --------- |
| GET      | \/user/:userId\ | Scores d'un utilisateur | Protégé |
| GET      | \/top\          | Classement global       | Public    |
| POST     | \/\             | Enregistrer un score    | Protégé |
| DELETE   | \/:id\          | Supprimer un score      | Admin     |

### Multiplayer (\/api/multiplayer\)

| Méthode | Route                    | Description          | Auth      |
| -------- | ------------------------ | -------------------- | --------- |
| POST     | \/rooms\                 | Créer une salle     | Protégé |
| GET      | \/rooms\                 | Salles disponibles   | Protégé |
| GET      | \/rooms/:roomCode\       | Détails d'une salle | Protégé |
| POST     | \/rooms/:roomCode/join\  | Rejoindre une salle  | Protégé |
| DELETE   | \/rooms/:roomCode/leave\ | Quitter une salle    | Protégé |

#### Créer une salle

\\\ash
curl -X POST http://localhost:5000/api/multiplayer/rooms \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "gameId": 1,
    "name": "Ma super partie",
    "maxPlayers": 4,
    "difficulty": "medium",
    "category": "Mathematics"
  }'

# Réponse:

{
  "message": "Room created successfully",
  "room": {
    "id": 1,
    "roomCode": "ABCD12",
    "name": "Ma super partie",
    "maxPlayers": 4,
    "currentPlayers": 1
  }
}
\\\

### Progress (\/api/progress\)

| Méthode | Route                      | Description           | Auth      |
| -------- | -------------------------- | --------------------- | --------- |
| GET      | \/\                        | Toute la progression  | Protégé |
| GET      | \/stats\                   | Statistiques globales | Protégé |
| GET      | \/game/:gameId\            | Progression d'un jeu  | Protégé |
| POST     | \/level/:levelId/complete\ | Compléter un niveau  | Protégé |

### Admin (\/api/admin\)

| Méthode | Route                     | Description            | Auth  |
| -------- | ------------------------- | ---------------------- | ----- |
| GET      | \/users\                  | Liste des utilisateurs | Admin |
| PUT      | \/users/:id/toggle-admin\ | Toggle admin           | Admin |
| DELETE   | \/users/:id\              | Supprimer utilisateur  | Admin |
| GET      | \/games\                  | Tous les jeux          | Admin |
| GET      | \/stats\                  | Statistiques globales  | Admin |

## WebSocket Events (Socket.io)

### Client  Server

| Event          | Payload                        | Description           |
| -------------- | ------------------------------ | --------------------- |
| \joinRoom\     | \{roomCode, userId, username}\ | Rejoindre une salle   |
| \setReady\     | \{roomCode, userId, isReady}\  | Changer statut ready  |
| \startGame\    | \{roomCode, userId}\           | Démarrer (host only) |
| \uzz\         | \{roomCode, userId}\           | Buzzer pour répondre |
| \submitAnswer\ | \{roomCode, userId, answer}\   | Soumettre réponse    |
| \              |                                |                       |
| extQuestion\   | \{roomCode}\                   | Question suivante     |
| \gameComplete\ | \{roomCode, userId, time}\     | Terminer le jeu       |

### Server  Client

| Event                | Payload                              | Description         |
| -------------------- | ------------------------------------ | ------------------- |
| \playerJoined\       | \{userId, username}\                 | Nouveau joueur      |
| \playerDisconnected\ | \{userId}\                           | Joueur déconnecté |
| \playerReady\        | \{userId, isReady, allPlayersReady}\ | Changement ready    |
| \gameStarted\        | \{gameMode, question}\               | Jeu démarré       |
| \playerBuzzed\       | \{userId, username}\                 | Quelqu'un a buzzé  |
| \nswerResult\       | \{userId, correct, scores}\          | Résultat réponse  |
| \                    |                                      |                     |
| extQuestion\         | \{question, scores}\                 | Nouvelle question   |
| \gameEnded\          | \{rankings, winner}\                 | Fin du jeu          |

### Exemple Socket.io Client

\\\javascript
import io from 'socket.io-client'

const socket = io('http://localhost:5000')

// Rejoindre une salle
socket.emit('joinRoom', {
  roomCode: 'ABCD12',
  userId: 1,
  username: 'John'
})

// Écouter les joueurs
socket.on('playerJoined', ({ userId, username }) => {
  console.log(\\ a rejoint!\)
})

// Démarrer le jeu (hôte uniquement)
socket.emit('startGame', { roomCode: 'ABCD12', userId: 1 })

// Écouter le démarrage
socket.on('gameStarted', ({ question }) => {
  console.log('Jeu démarré!', question)
})
\\\

## Technologies

- **Node.js** : Runtime JavaScript
- **Express** : Framework web minimaliste
- **Sequelize** : ORM pour MySQL
- **MySQL** : Base de données relationnelle
- **JWT** : Authentification par tokens
- **bcrypt** : Hachage des mots de passe
- **Socket.io** : WebSocket temps réel
- **express-validator** : Validation des entrées
- **dotenv** : Variables d'environnement
- **cors** : Cross-Origin Resource Sharing

## Base de Données

### Schéma Relationnel

\\
users  scores
        user_progress
        multiplayer_rooms (hostUserId)
        multiplayer_participants

games  levels  questions
        scores
        user_progress
        multiplayer_rooms

multiplayer_rooms  multiplayer_participants
                    multiplayer_game_states
\\\

### Migrations

\\\ash

# Créer une migration

npx sequelize-cli migration:generate --name add-new-column

# Exécuter les migrations

npx sequelize-cli db:migrate

# Annuler la dernière migration

npx sequelize-cli db:migrate:undo
\\\

### Migration Automatique

Le serveur exécute automatiquement \check-multiplayer-migration.js\ au démarrage pour ajouter les colonnes manquantes (\isMultiplayer\, \minPlayers\, \maxPlayers\).

## Tests

### Tester l'API avec PowerShell

\\\powershell

# Test Register

\$body = @{
  username = "testuser"
  email = "test@example.com"
  password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `  -Method POST`
  -ContentType "application/json" `
  -Body \$body

# Test Login

\$body = @{
  email = "test@example.com"
  password = "password123"
} | ConvertTo-Json

\$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `  -Method POST`
  -ContentType "application/json" `
  -Body \$body

\$token = \$response.token

# Test Get Me (avec token)

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" `  -Method GET`
  -Headers @{Authorization = "Bearer \$token"}
\\\

## Débogage

### Logs Serveur

\\\javascript
// Les logs s'affichent dans la console
console.log('Socket connected:', socket.id)
console.log('User joined room:', roomCode)
console.log('Game started in room:', roomCode)
\\\

### Vérifier la Base de Données

\\\ash

# Connexion MySQL

mysql -u root -p

# Sélectionner la base

USE playlearn_db;

# Vérifier les tables

SHOW TABLES;

# Voir les utilisateurs

SELECT * FROM users;

# Voir les salles actives

SELECT * FROM MultiplayerRooms WHERE status = 'waiting';
\\\

### Tester Socket.io

\\\javascript
// Utiliser le test-multiplayer.html
node scripts/test-socket-connection.js
\\\

## Scripts Disponibles

\\\ash
npm run dev          # Développement avec nodemon
npm start            # Production
npm run migrate      # Exécuter les migrations
npm run seed         # Peupler la base (seed data)
npm test             # Tests unitaires (à venir)
\\\

## Déploiement

### Railway

\\\ash

# Installer Railway CLI

npm install -g @railway/cli

# Login

railway login

# Créer un nouveau projet

railway init

# Déployer

railway up

# Variables d'environnement

railway variables set DB_HOST=your-mysql-host
railway variables set DB_PASSWORD=your-password
railway variables set JWT_SECRET=your-secret
\\\

### Heroku

\\\ash

# Installer Heroku CLI

# Créer une app

heroku create playlearn-api

# Ajouter MySQL (ClearDB)

heroku addons:create cleardb:ignite

# Configurer les variables

heroku config:set JWT_SECRET=your-secret
heroku config:set FRONTEND_URL=https://your-frontend.com

# Déployer

git push heroku main
\\\

## Architecture et Principes de Conception

### Principes SOLID Implémentés

#### **S - Single Responsibility Principle (Principe de Responsabilité Unique)**

Chaque module a une seule raison de changer :

- **Controllers** : Gèrent uniquement la logique métier spécifique (auth, games, multiplayer)
- **Middleware** : Responsables uniquement de la validation et l'authentification
- **Models** : Définissent uniquement la structure des données et relations
- **Routes** : S'occupent uniquement du routage HTTP
- **Utils** : Fournissent des fonctions utilitaires réutilisables

**Exemple** :

```javascript
// authController.js - Responsabilité : Authentification
// gamesController.js - Responsabilité : Gestion des jeux
// scoresController.js - Responsabilité : Gestion des scores
```

#### **O - Open/Closed Principle (Principe Ouvert/Fermé)**

Le code est ouvert à l'extension, fermé à la modification :

- **Middleware chainable** : Possibilité d'ajouter de nouveaux middleware sans modifier les existants
- **Routes modulaires** : Ajout de nouvelles routes sans toucher aux routes existantes
- **Validation extensible** : Nouveaux validateurs ajoutables dans `utils/validators.js`

**Exemple** :

```javascript
// Ajout d'un nouveau middleware sans modifier authMiddleware
app.use('/api/admin', authMiddleware, adminMiddleware, adminRoutes)
```

#### **L - Liskov Substitution Principle (Principe de Substitution de Liskov)**

Les objets dérivés peuvent remplacer leurs types de base :

- **Modèles Sequelize** : Tous les modèles partagent les mêmes méthodes de base (`findAll`, `create`, `update`)
- **Controllers** : Structure uniforme avec gestion cohérente des erreurs
- **Middleware** : Format de réponse standardisé

**Exemple** :

```javascript
// Tous les modèles peuvent être utilisés de manière interchangeable
const item = await Model.findByPk(id)
const items = await Model.findAll()
```

#### **I - Interface Segregation Principle (Principe de Ségrégation des Interfaces)**

Les clients ne dépendent que des méthodes qu'ils utilisent :

- **Routes séparées** par domaine fonctionnel (auth, games, multiplayer)
- **Middleware spécialisés** : `authMiddleware` vs `adminMiddleware`
- **Controllers ciblés** : Chaque controller expose uniquement les méthodes nécessaires

**Exemple** :

```javascript
// Les routes publiques n'ont pas besoin de authMiddleware
router.post('/register', authController.register)

// Les routes protégées utilisent authMiddleware
router.get('/profile', authMiddleware, authController.getProfile)
```

#### **D - Dependency Inversion Principle (Principe d'Inversion de Dépendance)**

Dépendre des abstractions plutôt que des implémentations concrètes :

- **Configuration centralisée** : `config/database.js` abstrait les détails de connexion
- **Models via Sequelize** : Abstraction de la base de données SQL
- **Environment variables** : Configuration injectable via `.env`

**Exemple** :

```javascript
// Controllers dépendent de l'abstraction Sequelize, pas de MySQL directement
const { User, Game } = require('../models')
```

---

### Patrons de Conception (Design Patterns)

#### **1. MVC (Model-View-Controller)**

Architecture principale de l'application :

- **Model** : Modèles Sequelize (`models/`)
- **View** : API REST (JSON responses)
- **Controller** : Logique métier (`controllers/`)

**Structure** :

```
Request → Route → Controller → Model → Database
                     ↓
                 Response (JSON)
```

#### **2. Repository Pattern**

Abstraction de l'accès aux données via Sequelize :

```javascript
// Les models agissent comme des repositories
const users = await User.findAll()
const game = await Game.findByPk(id)
```

**Avantages** :

- Séparation de la logique métier et de l'accès aux données
- Facilite les tests et le changement de base de données

#### **3. Middleware Pattern (Chain of Responsibility)** 🔗

Chaîne de traitement des requêtes :

```javascript
app.use(express.json())                    // Parse JSON
app.use(cors())                           // CORS headers
app.use('/api/protected', authMiddleware) // Auth check
app.use('/api/admin', adminMiddleware)    // Admin check
```

**Avantages** :

- Séparation des préoccupations (parsing, auth, validation)
- Réutilisabilité et composition

#### **4. Singleton Pattern**

Instance unique de la connexion base de données :

```javascript
// models/index.js
const sequelize = new Sequelize(config) // Instance unique
module.exports = { sequelize, User, Game, ... }
```

**Avantages** :

- Partage de la connexion DB entre tous les modules
- Gestion efficace des ressources

#### **5. Factory Pattern**

Création d'objets via Sequelize :

```javascript
// Sequelize agit comme une factory pour créer des instances de modèles
const user = await User.create({ username, email, password })
const game = await Game.build({ title, category })
```

#### **6. Observer Pattern (Event-Driven)**

Utilisé avec Socket.io pour le temps réel :

```javascript
// utils/socketHandlers.js
io.on('connection', (socket) => {
  socket.on('join-room', handleJoinRoom)
  socket.on('game-action', handleGameAction)
  socket.on('disconnect', handleDisconnect)
})
```

**Avantages** :

- Communication temps réel bidirectionnelle
- Découplage entre émetteurs et récepteurs

#### **7. Strategy Pattern**

Différentes stratégies d'authentification :

```javascript
// Stratégie JWT pour auth
const token = jwt.sign(payload, secret)

// Stratégie bcrypt pour hashing
const hash = await bcrypt.hash(password, 10)
```

#### **8. Decorator Pattern**

Middleware comme décorateurs pour enrichir les requêtes :

```javascript
// authMiddleware "décore" la requête avec req.user
app.use('/api/profile', authMiddleware, (req, res) => {
  // req.user est maintenant disponible
  res.json({ user: req.user })
})
```

#### **9. Module Pattern**

Encapsulation via modules Node.js :

```javascript
// Chaque fichier est un module isolé
module.exports = {
  register,
  login,
  getProfile
}
```

**Avantages** :

- Encapsulation et namespace
- Réutilisabilité du code

#### **10. Dependency Injection**

Configuration injectée via variables d'environnement :

```javascript
const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  secret: process.env.JWT_SECRET
}
```

**Avantages** :

- Configuration flexible selon l'environnement
- Facilite les tests avec des configs de test

---

### Principes Additionnels

#### **DRY (Don't Repeat Yourself)**

- Fonctions utilitaires réutilisables dans `utils/`
- Middleware réutilisables pour auth et validation
- Modèles Sequelize évitent la duplication de SQL

#### **KISS (Keep It Simple, Stupid)**

- Structure de fichiers claire et intuitive
- Nommage explicite des fonctions et variables
- Séparation logique par domaine fonctionnel

#### **YAGNI (You Aren't Gonna Need It)**

- Implémentation uniquement des fonctionnalités nécessaires
- Pas de sur-engineering anticipé
- Code évolutif et maintenable

#### **Separation of Concerns**

- Routes séparées par domaine
- Controllers isolés par responsabilité
- Configuration centralisée
- Logique métier séparée de la présentation

---

## Contribution

1. Fork le projet
2. Créer une branche feature (\git checkout -b feature/AmazingFeature\)
3. Commit les changements (\git commit -m 'Add AmazingFeature'\)
4. Push vers la branche (\git push origin feature/AmazingFeature\)
5. Ouvrir une Pull Request

## Licence

Ce projet est développé dans un cadre éducatif.

## Auteurs

**Play&Learn Team** - API backend pour application éducative

---

## Manuel d'Utilisation du Backend

### Installation et Configuration

#### Prérequis

- **Node.js** version 18 ou supérieure
- **MySQL** 8.0 ou supérieure (ou MariaDB 10.5+)
- **npm** ou **yarn**

#### Étapes d'installation

```bash
# 1. Cloner le repository
git clone https://github.com/votre-repo/Tp_play_learn-Public_back.git
cd Tp_play_learn-Public_back

# 2. Installer les dépendances
npm install

# 3. Créer le fichier de configuration
cp .env.example .env

# 4. Configurer les variables d'environnement
# Éditer .env et définir:
```

#### Configuration du fichier .env

```env
# Serveur
PORT=5000
NODE_ENV=development

# Base de données MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=playlearn_db
DB_USER=root
DB_PASSWORD=votre_mot_de_passe

# JWT Authentication
JWT_SECRET=votre_secret_super_securise_ici
JWT_EXPIRES_IN=7d

# CORS (Frontend URL)
FRONTEND_URL=http://localhost:5173
```

#### Création de la Base de Données

```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE playlearn_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Quitter MySQL
EXIT;
```

#### Démarrage du Serveur

```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
npm start

# Le serveur démarre sur http://localhost:5000
```

#### Vérification du Démarrage

```bash
# Test de santé du serveur
curl http://localhost:5000/api/health

# Réponse attendue:
# {"status":"ok","timestamp":"2025-12-17T..."}
```

---

### Utilisation de l'API

#### 1. **Authentification**

##### **A. Inscription (Register)**

**Endpoint**: `POST /api/auth/register`

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Réponse**:

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "isGuest": false,
    "isAdmin": false
  }
}
```

##### **B. Connexion (Login)**

**Endpoint**: `POST /api/auth/login`

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

##### **C. Connexion Invité**

**Endpoint**: `POST /api/auth/guest`

```bash
curl -X POST http://localhost:5000/api/auth/guest \
  -H "Content-Type: application/json"
```

##### **D. Obtenir l'Utilisateur Actuel**

**Endpoint**: `GET /api/auth/me`

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### 2. **Gestion des Jeux**

##### **A. Liste des Jeux**

**Endpoint**: `GET /api/games`

```bash
# Tous les jeux
curl http://localhost:5000/api/games

# Filtres disponibles
curl "http://localhost:5000/api/games?category=Mathematics&difficulty=medium&isMultiplayer=true"
```

**Paramètres de filtre**:

- `category`: Mathematics, Physics, Geography, Computer Science, History, Biology
- `difficulty`: easy, medium, hard
- `isMultiplayer`: true, false
- `type`: quiz, speed-math, puzzle

##### **B. Détails d'un Jeu**

**Endpoint**: `GET /api/games/:id`

```bash
curl http://localhost:5000/api/games/1
```

##### **C. Créer un Jeu (Admin)**

**Endpoint**: `POST /api/games`

```bash
curl -X POST http://localhost:5000/api/games \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Math Challenge",
    "category": "Mathematics",
    "difficulty": "medium",
    "type": "quiz",
    "description": "Test your math skills!",
    "isMultiplayer": true,
    "minPlayers": 2,
    "maxPlayers": 6
  }'
```

##### **D. Catégories Disponibles**

**Endpoint**: `GET /api/games/categories`

```bash
curl http://localhost:5000/api/games/categories
```

---

#### 3. **Système Multijoueur**

##### **A. Créer une Salle**

**Endpoint**: `POST /api/multiplayer/rooms`

```bash
curl -X POST http://localhost:5000/api/multiplayer/rooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gameId": 1,
    "name": "Ma Partie Quiz",
    "maxPlayers": 4,
    "difficulty": "medium",
    "category": "Mathematics"
  }'
```

**Réponse**:

```json
{
  "message": "Room created successfully",
  "room": {
    "id": 1,
    "roomCode": "ABC123",
    "name": "Ma Partie Quiz",
    "gameId": 1,
    "hostUserId": 1,
    "maxPlayers": 4,
    "currentPlayers": 1,
    "status": "waiting",
    "createdAt": "2025-12-17T10:00:00.000Z"
  }
}
```

##### **B. Rejoindre une Salle**

**Endpoint**: `POST /api/multiplayer/rooms/:roomCode/join`

```bash
curl -X POST http://localhost:5000/api/multiplayer/rooms/ABC123/join \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

##### **C. Liste des Salles Disponibles**

**Endpoint**: `GET /api/multiplayer/rooms`

```bash
curl http://localhost:5000/api/multiplayer/rooms \
  -H "Authorization: Bearer YOUR_TOKEN"
```

##### **D. Détails d'une Salle**

**Endpoint**: `GET /api/multiplayer/rooms/:roomCode`

```bash
curl http://localhost:5000/api/multiplayer/rooms/ABC123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

##### **E. Quitter une Salle**

**Endpoint**: `DELETE /api/multiplayer/rooms/:roomCode/leave`

```bash
curl -X DELETE http://localhost:5000/api/multiplayer/rooms/ABC123/leave \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 4. **Scores et Classement**

##### **A. Enregistrer un Score**

**Endpoint**: `POST /api/scores`

```bash
curl -X POST http://localhost:5000/api/scores \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gameId": 1,
    "score": 1500,
    "timeSpent": 300,
    "difficulty": "medium",
    "category": "Mathematics"
  }'
```

##### **B. Scores d'un Utilisateur**

**Endpoint**: `GET /api/scores/user/:userId`

```bash
curl http://localhost:5000/api/scores/user/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

##### **C. Top Scores (Leaderboard)**

**Endpoint**: `GET /api/scores/top`

```bash
# Top 10 global
curl http://localhost:5000/api/scores/top

# Top 10 par catégorie
curl "http://localhost:5000/api/scores/top?category=Mathematics"

# Top 10 par difficulté
curl "http://localhost:5000/api/scores/top?difficulty=hard"
```

---

#### 5. **Progression Utilisateur**

##### **A. Toute la Progression**

**Endpoint**: `GET /api/progress`

```bash
curl http://localhost:5000/api/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

##### **B. Statistiques Globales**

**Endpoint**: `GET /api/progress/stats`

```bash
curl http://localhost:5000/api/progress/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

##### **C. Progression d'un Jeu**

**Endpoint**: `GET /api/progress/game/:gameId`

```bash
curl http://localhost:5000/api/progress/game/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

##### **D. Compléter un Niveau**

**Endpoint**: `POST /api/progress/level/:levelId/complete`

```bash
curl -X POST http://localhost:5000/api/progress/level/5/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "score": 1200,
    "timeSpent": 180
  }'
```

---

#### 6. **Administration (Requiert droits Admin)**

##### **A. Liste des Utilisateurs**

**Endpoint**: `GET /api/admin/users`

```bash
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

##### **B. Promouvoir/Rétrograder Admin**

**Endpoint**: `PUT /api/admin/users/:id/toggle-admin`

```bash
curl -X PUT http://localhost:5000/api/admin/users/5/toggle-admin \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

##### **C. Supprimer un Utilisateur**

**Endpoint**: `DELETE /api/admin/users/:id`

```bash
curl -X DELETE http://localhost:5000/api/admin/users/5 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

##### **D. Statistiques de la Plateforme**

**Endpoint**: `GET /api/admin/stats`

```bash
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Réponse**:

```json
{
  "totalUsers": 1250,
  "totalGames": 45,
  "totalScores": 15780,
  "activeRooms": 12,
  "gamesPlayedToday": 234
}
```

---

### Utilisation de Socket.io (WebSocket)

#### Connexion au Serveur Socket

```javascript
import io from 'socket.io-client'

const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  },
  autoConnect: true,
  reconnection: true
})

socket.on('connect', () => {
  console.log('Connecté au serveur Socket.io:', socket.id)
})

socket.on('disconnect', () => {
  console.log('Déconnecté du serveur')
})
```

#### Événements Multijoueur

##### **Client → Serveur**

| Événement       | Payload                                    | Description              |
| ----------------- | ------------------------------------------ | ------------------------ |
| `join-room`     | `{roomCode, userId, username}`           | Rejoindre une salle      |
| `set-ready`     | `{roomCode, userId, isReady}`            | Changer statut prêt     |
| `start-game`    | `{roomCode, userId}`                     | Démarrer le jeu (hôte) |
| `buzz`          | `{roomCode, userId}`                     | Buzzer pour répondre    |
| `submit-answer` | `{roomCode, userId, answer, questionId}` | Soumettre réponse       |
| `next-question` | `{roomCode}`                             | Question suivante        |
| `leave-room`    | `{roomCode, userId}`                     | Quitter la salle         |

##### **Serveur → Client**

| Événement         | Payload                                        | Description                  |
| ------------------- | ---------------------------------------------- | ---------------------------- |
| `player-joined`   | `{userId, username, participants}`           | Nouveau joueur               |
| `player-left`     | `{userId, username, participants}`           | Joueur parti                 |
| `player-ready`    | `{userId, isReady, allPlayersReady}`         | Changement statut            |
| `countdown-start` | `{countdown: 5}`                             | Démarrage compte à rebours |
| `game-started`    | `{gameMode, firstQuestion}`                  | Jeu démarré                |
| `question-loaded` | `{question, questionNumber, totalQuestions}` | Nouvelle question            |
| `player-buzzed`   | `{userId, username, timestamp}`              | Quelqu'un a buzzé           |
| `answer-result`   | `{userId, correct, points, newScore}`        | Résultat réponse           |
| `scores-updated`  | `{scores: [{userId, score}]}`                | Scores mis à jour           |
| `game-ended`      | `{rankings, winner}`                         | Fin du jeu                   |
| `error`           | `{message}`                                  | Erreur                       |

#### Exemple Complet : Flow Multijoueur

```javascript
// 1. Rejoindre une salle
socket.emit('join-room', {
  roomCode: 'ABC123',
  userId: 1,
  username: 'John'
})

// 2. Écouter les joueurs qui rejoignent
socket.on('player-joined', ({ userId, username, participants }) => {
  console.log(`${username} a rejoint! Total: ${participants.length}`)
})

// 3. Indiquer qu'on est prêt
socket.emit('set-ready', {
  roomCode: 'ABC123',
  userId: 1,
  isReady: true
})

// 4. Écouter le statut ready
socket.on('player-ready', ({ userId, isReady, allPlayersReady }) => {
  if (allPlayersReady) {
    console.log('Tous les joueurs sont prêts! Démarrage dans 5s...')
  }
})

// 5. Hôte démarre le jeu
socket.emit('start-game', {
  roomCode: 'ABC123',
  userId: 1  // ID de l'hôte
})

// 6. Écouter le démarrage
socket.on('game-started', ({ gameMode, firstQuestion }) => {
  console.log('Jeu démarré!', firstQuestion)
})

// 7. Buzzer pour répondre
socket.emit('buzz', {
  roomCode: 'ABC123',
  userId: 1
})

// 8. Écouter qui a buzzé
socket.on('player-buzzed', ({ userId, username }) => {
  console.log(`${username} a buzzé en premier!`)
})

// 9. Soumettre réponse
socket.emit('submit-answer', {
  roomCode: 'ABC123',
  userId: 1,
  answer: 'Paris',
  questionId: 1
})

// 10. Écouter le résultat
socket.on('answer-result', ({ userId, correct, points, newScore }) => {
  if (correct) {
    console.log(`Bonne réponse! +${points} points. Score: ${newScore}`)
  } else {
    console.log('Mauvaise réponse...')
  }
})

// 11. Question suivante
socket.on('question-loaded', ({ question, questionNumber, totalQuestions }) => {
  console.log(`Question ${questionNumber}/${totalQuestions}:`, question.text)
})

// 12. Fin du jeu
socket.on('game-ended', ({ rankings, winner }) => {
  console.log('Jeu terminé!')
  console.log('Gagnant:', winner)
  console.log('Classement:', rankings)
})
```

---

### Tests avec PowerShell

```powershell
# Test Inscription
$body = @{
  username = "testuser"
  email = "test@example.com"
  password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$token = $response.token
Write-Host "Token: $token"

# Test Récupération des Jeux
$games = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/games" `
  -Method GET

Write-Host "Nombre de jeux: $($games.length)"

# Test Création Salle (avec token)
$roomBody = @{
  gameId = 1
  name = "Test Room"
  maxPlayers = 4
} | ConvertTo-Json

$room = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/multiplayer/rooms" `
  -Method POST `
  -Headers @{Authorization = "Bearer $token"} `
  -ContentType "application/json" `
  -Body $roomBody

Write-Host "Salle créée: $($room.room.roomCode)"
```

---

### Tests Unitaires

#### Exécution des Tests

```bash
# Lancer tous les tests
npm test

# Tests avec coverage
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

#### Structure des Tests

```
tests/
├── auth.test.js          # Tests authentification (4 tests)
├── games.test.js         # Tests gestion jeux (4 tests)
├── multiplayer.test.js   # Tests multijoueur (4 tests)
└── advanced.test.js      # Tests fonctionnalités avancées (13 tests)
```

#### Résultats des Tests

```
 PASS  tests/auth.test.js
  Authentication Tests
    ✓ should validate email format
    ✓ should validate password length
    ✓ should validate username requirements
    ✓ should generate JWT token format

 PASS  tests/games.test.js
  Game Data Validation Tests
    ✓ should validate valid game object
    ✓ should have valid game categories
    ✓ should filter games by category
    ✓ should validate difficulty levels

 PASS  tests/multiplayer.test.js
  Multiplayer Room Logic Tests
    ✓ should generate valid room code format
    ✓ should validate room max capacity
    ✓ should determine valid game mode
    ✓ should have valid room status

 PASS  tests/advanced.test.js
  Advanced Feature Tests
    ✓ should calculate correct score based on time and difficulty
    ✓ should sort players by score in descending order
    ✓ should validate question timer countdown
    ✓ should handle multiple choice questions correctly
    ✓ should register first player to buzz
    ✓ should track game progress correctly
    ✓ should organize questions by levels
    ✓ should shuffle answer options
    ✓ should track multiplayer game state
    ✓ should recognize default multiplayer game
  Data Validation Tests
    ✓ should validate question structure
    ✓ should generate unique room codes
    ✓ should enforce time limits on questions

Test Suites: 4 passed, 4 total
Tests:       25 passed, 25 total
Time:        6.11 s
```

---

### Débogage et Logs

#### Activer les Logs Détaillés

```env
# Dans .env
NODE_ENV=development
LOG_LEVEL=debug
```

#### Logs Serveur

```javascript
// Les logs apparaissent dans la console
🚀 Server running on port 5000
✅ Database connected
🔌 Socket.io initialized
👤 User 'john_doe' logged in
🎮 Room ABC123 created by user 1
⚡ Player 2 joined room ABC123
🏁 Game started in room ABC123
📝 Question 1/20 loaded for room ABC123
```

#### Vérifier l'État de la Base de Données

```sql
-- Connexion MySQL
mysql -u root -p

-- Utiliser la base
USE playlearn_db;

-- Voir les tables
SHOW TABLES;

-- Vérifier les utilisateurs
SELECT id, username, email, isAdmin FROM users;

-- Vérifier les salles actives
SELECT roomCode, name, status, currentPlayers, maxPlayers 
FROM MultiplayerRooms 
WHERE status = 'waiting';

-- Vérifier les jeux disponibles
SELECT id, title, category, difficulty, isMultiplayer 
FROM games;

-- Top 10 scores
SELECT s.id, u.username, g.title, s.score, s.createdAt
FROM scores s
JOIN users u ON s.userId = u.id
JOIN games g ON s.gameId = g.id
ORDER BY s.score DESC
LIMIT 10;
```

#### Scripts de Débogage

```bash
# Vérifier la structure de la base
node check-structure.js

# Vérifier la connexion DB
node checkDB.js

# Tester les questions du jeu 63
node check-game63-questions.js

# Lister les admins
node scripts/listAdmins.js

# Promouvoir un utilisateur en admin
node scripts/makeAdmin.js
```

---

### Maintenance et Scripts Utiles

#### Créer un Utilisateur Admin

```bash
# Via script
node scripts/quickAdmin.js

# Ou directement en SQL
mysql -u root -p playlearn_db

UPDATE users SET isAdmin = true WHERE email = 'admin@example.com';
```

#### Nettoyer les Salles Inactives

```sql
-- Supprimer les salles de plus de 1 heure
DELETE FROM MultiplayerRooms 
WHERE status = 'waiting' 
AND createdAt < DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

#### Ajouter des Questions à un Jeu

```bash
# Utiliser le script
node add-questions-to-game63.js

# Ou créer un script personnalisé
node add-test-questions.js
```

#### Backup de la Base de Données

```bash
# Export complet
mysqldump -u root -p playlearn_db > backup_$(date +%Y%m%d).sql

# Restauration
mysql -u root -p playlearn_db < backup_20251217.sql
```

---

### Jeu Par Défaut Hardcodé

Le backend inclut un jeu par défaut **"MultiGamePlay"** (ID: 999) avec 20 questions hardcodées qui ne dépend pas de la base de données.

#### Caractéristiques

- **Titre**: MultiGamePlay
- **ID**: 999 ou 'multigameplay'
- **Type**: Quiz
- **Mode**: Multijoueur
- **Questions**: 20 questions hardcodées
- **Catégories**: Variées (Géographie, Math, Programmation, Science)

#### Utilisation

```javascript
// Le jeu est automatiquement reconnu par son ID
const isDefault = gameId === 999 || gameId === 'multigameplay'

// Questions chargées depuis utils/defaultMultiplayerGame.js
// Pas de requête DB nécessaire
```

#### Avantages

- ✅ Toujours disponible (survit aux resets DB)
- ✅ Pas de dépendance base de données
- ✅ Idéal pour tester le système multijoueur
- ✅ Questions garanties (pas d'erreur "No questions available")

---

### Dépannage (Troubleshooting)

#### Problème: "Cannot connect to database"

**Solutions**:

1. Vérifier que MySQL est démarré: `systemctl status mysql` (Linux) ou Services Windows
2. Vérifier les credentials dans `.env`
3. Vérifier que la base `playlearn_db` existe
4. Tester la connexion: `mysql -u root -p`

#### Problème: "Port 5000 already in use"

**Solutions**:

```bash
# Trouver le processus utilisant le port 5000
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Linux/Mac
lsof -i :5000

# Tuer le processus ou changer le port dans .env
PORT=5001
```

#### Problème: "JWT token expired"

**Solution**:
Le token expire après 7 jours (configurable dans `.env`). L'utilisateur doit se reconnecter.

#### Problème: "No questions available for game"

**Solutions**:

1. Vérifier que le jeu a des niveaux et questions en DB
2. Utiliser le jeu par défaut "MultiGamePlay" (ID: 999)
3. Exécuter: `node add-test-questions.js`

#### Problème: "Socket.io connection failed"

**Solutions**:

1. Vérifier que le serveur est démarré
2. Vérifier CORS dans `.env`: `FRONTEND_URL=http://localhost:5173`
3. Vérifier que le frontend utilise la bonne URL Socket

---

## Architecture et Principes de Conception

### Principes SOLID Implémentés

#### **S - Single Responsibility Principle (Principe de Responsabilité Unique)**

Chaque module a une seule raison de changer :

- **Controllers** : Gèrent uniquement la logique métier spécifique (auth, games, multiplayer)
- **Middleware** : Responsables uniquement de la validation et l'authentification
- **Models** : Définissent uniquement la structure des données et relations
- **Routes** : S'occupent uniquement du routage HTTP
- **Utils** : Fournissent des fonctions utilitaires réutilisables

**Exemple** :

```javascript
// authController.js - Responsabilité : Authentification uniquement
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ username, email, password: hashedPassword })
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET)
    res.json({ success: true, token, user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// gamesController.js - Responsabilité : Gestion des jeux uniquement
exports.getAllGames = async (req, res) => {
  try {
    const { category, difficulty } = req.query
    const games = await Game.findAll({ where: { category, difficulty } })
    res.json({ success: true, data: games })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Chaque controller a UNE seule responsabilité
```

**Avantages**:

- Maintenance facilitée
- Tests unitaires ciblés
- Réduction des effets de bord

---

#### **O - Open/Closed Principle (Principe Ouvert/Fermé)**

Le code est ouvert à l'extension, fermé à la modification :

- **Middleware chainable** : Possibilité d'ajouter de nouveaux middleware sans modifier les existants
- **Routes modulaires** : Ajout de nouvelles routes sans toucher aux routes existantes
- **Validation extensible** : Nouveaux validateurs ajoutables dans `utils/validators.js`

**Exemple** :

```javascript
// routes/gamesRoutes.js - Structure fermée à la modification
const router = express.Router()

router.get('/', gamesController.getAllGames)
router.get('/:id', gamesController.getGameById)
router.post('/', authMiddleware, adminMiddleware, gamesController.createGame)

module.exports = router

// Ajout d'une nouvelle route SANS modifier les existantes (ouvert à l'extension)
// routes/customGamesRoutes.js
const router = express.Router()
router.get('/custom', customGamesController.getCustomGames)  // Nouvelle route
module.exports = router

// server.js - Extension par composition
app.use('/api/games', gamesRoutes)
app.use('/api/custom-games', customGamesRoutes)  // Nouvelle route ajoutée
```

**Middleware extensible**:

```javascript
// Middleware existant (fermé à modification)
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  req.user = decoded
  next()
}

// Nouveau middleware ajouté SANS toucher à authMiddleware (extension)
const rateLimitMiddleware = (req, res, next) => {
  // Logique de limitation de taux
  next()
}

// Composition
app.use('/api/protected', authMiddleware, rateLimitMiddleware, protectedRoutes)
```

**Avantages**:

- Ajout de fonctionnalités sans risque de régression
- Code stable et prévisible
- Tests existants restent valides

---

#### **L - Liskov Substitution Principle (Principe de Substitution de Liskov)**

Les objets dérivés peuvent remplacer leurs types de base :

- **Modèles Sequelize** : Tous les modèles partagent les mêmes méthodes de base (`findAll`, `create`, `update`)
- **Controllers** : Structure uniforme avec gestion cohérente des erreurs
- **Middleware** : Format de réponse standardisé

**Exemple** :

```javascript
// Tous les modèles Sequelize sont substituables
const models = [User, Game, Score, MultiplayerRoom]

// Fonction générique qui fonctionne avec TOUS les modèles
async function findById(Model, id) {
  return await Model.findByPk(id)  // Fonctionne pour User, Game, Score, etc.
}

// Utilisation interchangeable
const user = await findById(User, 1)
const game = await findById(Game, 5)
const score = await findById(Score, 10)

// Controllers substituables
const controllers = [authController, gamesController, scoresController]

controllers.forEach(controller => {
  // Tous respectent la même signature (req, res)
  if (controller.getAll) {
    router.get('/', controller.getAll)
  }
})
```

**Structure uniforme des réponses**:

```javascript
// Tous les controllers retournent le même format
// authController.js
res.json({ success: true, token, user })

// gamesController.js
res.json({ success: true, data: games })

// scoresController.js
res.json({ success: true, data: scores })

// Format d'erreur uniforme
res.status(500).json({ error: error.message })
```

**Avantages**:

- Prédictibilité du comportement
- Code générique réutilisable
- Interface cohérente

---

#### **I - Interface Segregation Principle (Principe de Ségrégation des Interfaces)**

Les clients ne dépendent que des méthodes qu'ils utilisent :

- **Routes séparées** par domaine fonctionnel (auth, games, multiplayer)
- **Middleware spécialisés** : `authMiddleware` vs `adminMiddleware`
- **Controllers ciblés** : Chaque controller expose uniquement les méthodes nécessaires

**Exemple** :

```javascript
// Middleware spécialisés (interfaces ségrégées)
// authMiddleware.js - Interface: vérifier le token uniquement
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// adminMiddleware.js - Interface: vérifier les droits admin uniquement
const adminMiddleware = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin rights required' })
  }
  next()
}

// Routes publiques : aucun middleware
router.post('/register', authController.register)

// Routes protégées : authMiddleware uniquement
router.get('/profile', authMiddleware, authController.getProfile)

// Routes admin : authMiddleware + adminMiddleware
router.delete('/users/:id', authMiddleware, adminMiddleware, adminController.deleteUser)

// Chaque route n'utilise QUE les middleware nécessaires
```

**Controllers ciblés**:

```javascript
// authController - Interface: authentification uniquement
module.exports = {
  register,
  login,
  getProfile,
  guestLogin
}

// gamesController - Interface: gestion jeux uniquement
module.exports = {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame
}

// Les clients (routes) n'ont accès qu'aux méthodes pertinentes
```

**Avantages**:

- Pas de dépendances inutiles
- Code léger et focalisé
- Maintenance simplifiée

---

#### **D - Dependency Inversion Principle (Principe d'Inversion de Dépendance)**

Dépendre des abstractions plutôt que des implémentations concrètes :

- **Configuration centralisée** : `config/database.js` abstrait les détails de connexion
- **Models via Sequelize** : Abstraction de la base de données SQL
- **Environment variables** : Configuration injectable via `.env`

**Exemple** :

```javascript
// config/database.js - Abstraction de la connexion DB
const { Sequelize } = require('sequelize')

// Dépend des abstractions (variables d'env), pas de valeurs hardcodées
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Abstraction
  process.env.DB_USER,      // Abstraction
  process.env.DB_PASSWORD,  // Abstraction
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
)

module.exports = sequelize

// controllers/gamesController.js - Dépend de l'abstraction Sequelize
const { Game, Level, Question } = require('../models')  // Abstraction

exports.getAllGames = async (req, res) => {
  // Utilise l'abstraction Game, pas de SQL direct
  const games = await Game.findAll({
    include: [{ model: Level, include: [Question] }]
  })
  res.json({ success: true, data: games })
}

// Le controller ne sait PAS qu'il y a MySQL derrière
// Il dépend de l'abstraction Sequelize
```

**Injection de dépendances via .env**:

```javascript
// server.js - Configuration injectable
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET
const FRONTEND_URL = process.env.FRONTEND_URL

// Les modules dépendent des abstractions, pas des valeurs concrètes
app.use(cors({ origin: FRONTEND_URL }))  // Dépend de l'abstraction
```

**Avantages**:

- Tests facilités (injection de mocks)
- Flexibilité (changement de DB sans toucher au code métier)
- Configuration par environnement (dev, test, prod)

---

### Patrons de Conception GoF Utilisés

#### **1. MVC (Model-View-Controller)** 🏛️

**Description**: Sépare la logique en trois couches distinctes.

**Implémentation**:

```
Request → Route → Controller → Model → Database
                     ↓
                 Response (JSON)
```

**Exemple**:

```javascript
// MODEL: models/Game.js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Game = sequelize.define('Game', {
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  difficulty: { type: DataTypes.ENUM('easy', 'medium', 'hard') }
})

module.exports = Game

// CONTROLLER: controllers/gamesController.js
const { Game } = require('../models')

exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.findAll()  // Utilise le Model
    res.json({ success: true, data: games })  // Retourne la View (JSON)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ROUTE (Router): routes/gamesRoutes.js
const router = express.Router()
const gamesController = require('../controllers/gamesController')

router.get('/', gamesController.getAllGames)  // Relie la route au Controller

module.exports = router

// VIEW: Réponse JSON (API REST)
{
  "success": true,
  "data": [
    { "id": 1, "title": "Math Quiz", "category": "Mathematics" }
  ]
}
```

**Avantages**:

- Séparation des préoccupations
- Testabilité: tester le Model indépendamment du Controller
- Maintenabilité: modifier le Model sans toucher aux Routes

**Diagramme**:

```
Client Request
    ↓
[Route] → [Controller] → [Model] → [Database]
              ↓
          [Response JSON]
              ↓
          Client
```

---

#### **2. Middleware Pattern (Chain of Responsibility)** 🔗

**Description**: Chaîne de traitement où chaque maillon peut traiter ou passer la requête au suivant.

**Implémentation**:

```javascript
// Chaîne de middleware
app.use(express.json())                          // Middleware 1: Parse JSON
app.use(cors({ origin: process.env.FRONTEND_URL }))  // Middleware 2: CORS
app.use('/api/auth', authRoutes)                // Middleware 3: Routes auth
app.use('/api/games', authMiddleware, gamesRoutes)  // Middleware 4 + 5

// middleware/authMiddleware.js
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) throw new Error('No token')
  
    req.user = jwt.verify(token, process.env.JWT_SECRET)  // Enrichit la requête
    next()  // Passe au maillon suivant
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })  // Arrête la chaîne
  }
}

// middleware/adminMiddleware.js
const adminMiddleware = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' })  // Arrête la chaîne
  }
  next()  // Passe au maillon suivant
}

// Utilisation en chaîne
app.delete(
  '/api/admin/users/:id',
  authMiddleware,      // Maillon 1: Vérifie token
  adminMiddleware,     // Maillon 2: Vérifie admin
  adminController.deleteUser  // Maillon 3: Traite la requête
)
```

**Flow de traitement**:

```
Request
  ↓
express.json()  → Parse le body JSON
  ↓
cors()  → Ajoute headers CORS
  ↓
authMiddleware  → Vérifie JWT, ajoute req.user
  ↓
adminMiddleware  → Vérifie req.user.isAdmin
  ↓
Controller  → Traite la logique métier
  ↓
Response
```

**Avantages**:

- Réutilisabilité: même middleware pour plusieurs routes
- Composition: combiner les middleware de différentes façons
- Séparation: chaque middleware a UNE responsabilité

**Exemple avancé**:

```javascript
// Middleware de logging
const loggingMiddleware = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
}

// Middleware de validation
const validateGameData = (req, res, next) => {
  const { title, category } = req.body
  if (!title || !category) {
    return res.status(400).json({ error: 'Missing fields' })
  }
  next()
}

// Chaîne complexe
app.post(
  '/api/games',
  loggingMiddleware,      // 1. Log la requête
  authMiddleware,         // 2. Vérifie auth
  adminMiddleware,        // 3. Vérifie admin
  validateGameData,       // 4. Valide les données
  gamesController.createGame  // 5. Crée le jeu
)
```

---

#### **3. Singleton Pattern**

**Description**: Garantit qu'une classe n'a qu'une seul instance globale.

**Implémentation 1: Connexion Base de Données**

```javascript
// config/database.js - Instance unique de Sequelize
const { Sequelize } = require('sequelize')

// Création de l'instance unique
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
)

// Export de l'instance unique
module.exports = sequelize

// Utilisation dans plusieurs fichiers
// models/User.js
const sequelize = require('../config/database')  // Même instance
const User = sequelize.define('User', { /* ... */ })

// models/Game.js
const sequelize = require('../config/database')  // MÊME instance
const Game = sequelize.define('Game', { /* ... */ })

// server.js
const sequelize = require('./config/database')  // MÊME instance
sequelize.authenticate().then(() => console.log('DB connected'))
```

**Implémentation 2: Socket.io Server**

```javascript
// server.js - Instance unique de Socket.io
const http = require('http')
const socketIo = require('socket.io')

const server = http.createServer(app)

// Création de l'instance unique Socket.io
const io = socketIo(server, {
  cors: { origin: process.env.FRONTEND_URL }
})

// utils/socketHandlers.js - Utilise l'instance unique
const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)
  
    socket.on('join-room', (data) => {
      socket.join(data.roomCode)
      io.to(data.roomCode).emit('player-joined', data)  // Utilise io
    })
  })
}

// server.js - Passe l'instance unique
setupSocketHandlers(io)

// Une seule instance Socket.io pour tout le serveur
```

**Implémentation 3: Game State Manager**

```javascript
// utils/gameStateManager.js
class GameStateManager {
  constructor() {
    // Vérifie si une instance existe déjà
    if (GameStateManager.instance) {
      return GameStateManager.instance
    }
  
    this.rooms = new Map()  // État partagé
    this.activeGames = new Map()
  
    GameStateManager.instance = this  // Stocke l'instance
  }
  
  addRoom(roomCode, data) {
    this.rooms.set(roomCode, data)
  }
  
  getRoom(roomCode) {
    return this.rooms.get(roomCode)
  }
  
  removeRoom(roomCode) {
    this.rooms.delete(roomCode)
    this.activeGames.delete(roomCode)
  }
}

// Export de l'instance unique
const gameStateManager = new GameStateManager()
module.exports = gameStateManager

// Utilisation dans plusieurs fichiers
// controllers/multiplayerController.js
const gameStateManager = require('../utils/gameStateManager')
gameStateManager.addRoom('ABC123', roomData)

// utils/socketHandlers.js
const gameStateManager = require('../utils/gameStateManager')
const room = gameStateManager.getRoom('ABC123')

// MÊME instance partagée entre tous les modules!
```

**Avantages**:

- Économie de ressources: une seule connexion DB
- État partagé: cohérence des données
- Point d'accès global: disponible partout

**Diagramme**:

```
Application
    ↓
sequelize (Singleton)
    ↑
    ├─ User.js
    ├─ Game.js
    ├─ Score.js
    └─ MultiplayerRoom.js
(Tous partagent LA MÊME instance)
```

---

## Résumé des Patterns

| Pattern                                        | Objectif                          | Exemples dans le Projet                     |
| ---------------------------------------------- | --------------------------------- | ------------------------------------------- |
| **MVC**                                  | Séparation Model-View-Controller | Routes → Controllers → Models             |
| **Middleware (Chain of Responsibility)** | Chaîne de traitement             | authMiddleware, adminMiddleware, validation |
| **Singleton**                            | Instance unique globale           | Sequelize, Socket.io, GameStateManager      |

---

## Liens Utiles

- **Frontend Repository** : [Tp_play_learn-Public_front](../Tp_play_learn-Public_front)
- **Documentation Express** : https://expressjs.com
- **Documentation Sequelize** : https://sequelize.org
- **Socket.io Server** : https://socket.io/docs/v4/server-api/
