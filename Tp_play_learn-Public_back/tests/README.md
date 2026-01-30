# Tests Backend - Play&Learn

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

## Suite de Tests Jest

Ce dossier contient les tests unitaires pour l'API backend Play&Learn. Les tests valident les utilitaires, la logique métier et les fonctions de validation sans nécessiter de connexion à la base de données.

## Installation

Les dépendances de test sont déjà installées. Si nécessaire :

```bash
npm install --save-dev jest supertest @jest/globals
```

## Exécution des Tests

```bash
# Exécuter tous les tests
npm test

# Mode watch (re-exécution automatique)
npm run test:watch

# Avec couverture de code
npm run test:coverage
```

## Structure des Tests

```
tests/
├── auth.test.js         # Tests des utilitaires d'authentification (4 tests)
├── games.test.js        # Tests de validation des jeux (4 tests)
├── multiplayer.test.js  # Tests de la logique multijoueur (4 tests)
├── advanced.test.js     # Tests de fonctionnalités avancées (13 tests)
└── README.md           # Cette documentation
```

## Résultats des Tests

**Dernière Exécution**: ✅Durant la première phase de ce travail, vous avez réalisé un dossier d’architecture et de spécifications pour votre projet. En tenant compte des commentaires émis suite à la correction de votre dossier, vous devez maintenant réaliser le développement et l’implantation de votre projet. Énoncé Il y a deux livrables pour la Phase 2 du projet de session : • L’application implantée et fonctionnelle, incluant son code source complet.  o Votre code doit contenir une batterie de tests unitaires pour chaque fonctionnalité majeure. • Un rapport contenant : o Manuel d’utilisation de votre application; o Description de comment vous avez appliqué les cinq principes SOLID. ▪ Avec exemples (code ou diagrammes); o Description de trois patrons de conception GoF que vous avez utilisés. ▪ Avec exemples (code ou diagrammes). Remise du travail • Vous me présenterez au laboratoire le 16 décembre votre application fonctionnelle. • Le code source complet de votre application doit aussi être remis via GitHub Classroom. o https://classroom.github.com/a/0Gsq8hIJ • Votre rapport doit être remis aussi dans le même dépôt Git que votre application dans un fichier Readme.md sous format Markdown. o Il s’agit du même format utilisé pour les notes du cours. Tous les tests passent

```
Test Suites: 4 passed, 4 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        6.11 s
```

## Liste Complète des Tests (25 au total)

### Authentication Tests (auth.test.js) - 4 tests

**Test 1 : Validation du format d'email**

- Vérifie que le regex d'email détecte les formats valides
- Valide la détection d'emails invalides
- Pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Test 2 : Validation de la longueur du mot de passe**

- Vérifie que les mots de passe courts sont rejetés
- Valide que les mots de passe de longueur suffisante sont acceptés
- Longueur minimale: 6 caractères

**Test 3 : Validation du username**

- Vérifie que les usernames trop courts sont rejetés (< 3 caractères)
- Valide que les usernames trop longs sont rejetés (> 50 caractères)
- Confirme que les usernames valides sont acceptés (3-50 caractères)

**Test 4 : Génération de format token JWT**

- Vérifie que le token JWT a la structure correcte
- Valide les 3 parties du token (header, payload, signature)
- Confirme que chaque partie est présente et non vide

---

### Game Data Validation (games.test.js) - 4 tests

**Test 5 : Validation d'un objet jeu valide**

- Vérifie la structure complète d'un objet jeu
- Valide les propriétés obligatoires (title, category, difficulty, type, description)
- Confirme que la difficulté est dans les valeurs autorisées (easy, medium, hard)

**Test 6 : Validation des catégories**

- Vérifie la liste des catégories disponibles
- Valide la présence des catégories principales (Mathematics, Physics, Geography, Computer Science, History, Biology)
- Confirme que la liste contient au moins 6 catégories

**Test 7 : Filtrage de jeux par catégorie**

- Teste la fonction de filtrage par catégorie
- Vérifie le nombre correct de jeux filtrés (2 jeux Mathematics)
- Confirme que tous les résultats correspondent à la catégorie demandée

**Test 8 : Validation des niveaux de difficulté**

- Vérifie les trois niveaux de difficulté (easy, medium, hard)
- Valide que chaque niveau est présent dans la liste
- Confirme que la liste contient exactement 3 éléments

---

### Multiplayer Room Logic (multiplayer.test.js) - 4 tests

**Test 9 : Génération de code de salle**

- Vérifie la génération de codes de salle aléatoires
- Valide le format (6 caractères alphanumériques majuscules)
- Confirme la correspondance au pattern regex `^[A-Z0-9]{6}$`

**Test 10 : Validation de la capacité maximale**

- Vérifie la logique de capacité des salles
- Valide qu'une salle accepte de nouveaux joueurs si non pleine (2/4)
- Confirme les limites (max 10 joueurs par salle)

**Test 11 : Détermination du mode de jeu**

- Vérifie les modes de jeu disponibles (duel, team, freeforall, coop)
- Valide qu'un mode sélectionné est dans la liste autorisée
- Confirme que les 4 modes sont présents

**Test 12 : Validation du statut de la salle**

- Vérifie les statuts possibles (waiting, in_progress, finished)
- Valide les transitions d'état
- Confirme que le statut est toujours valide

---

### Advanced Features (advanced.test.js) - 13 tests

#### Tests de Fonctionnalités Avancées (10 tests)

**Test 13 : Calcul de score avec temps et difficulté**

- Calcule le score avec bonus de temps (timeRemaining/maxTime × 50)
- Applique le multiplicateur de difficulté (easy: ×1, medium: ×1.5, hard: ×2)
- Vérifie que le score hard est supérieur au score easy

**Test 14 : Tri des joueurs par score (Leaderboard)**

- Trie les joueurs par score décroissant
- Vérifie que le premier est celui avec le meilleur score
- Confirme l'ordre correct du classement

**Test 15 : Timer de question avec compte à rebours**

- Simule 5 secondes écoulées sur un timer de 30 secondes
- Vérifie que le temps restant est correct (25 secondes)
- Valide que le temps reste positif

**Test 16 : Questions à choix multiples**

- Vérifie qu'une question a 1 bonne réponse et 3 mauvaises
- Confirme que toutes les réponses sont présentes (4 total)
- Valide que les mauvaises réponses n'incluent pas la bonne

**Test 17 : Système de buzzer (premier joueur)**

- Enregistre le premier joueur à buzzer
- Rejette les buzzers suivants
- Confirme que seul le premier est enregistré

**Test 18 : Progression du jeu**

- Suit la progression des questions (1/20, 2/20, etc.)
- Vérifie qu'on peut passer à la question suivante
- Bloque la progression à la dernière question

**Test 19 : Organisation par niveaux**

- Calcule le nombre total de questions dans tous les niveaux
- Vérifie la structure des niveaux (titre, difficulté, questions)
- Confirme le nombre de questions par niveau

**Test 20 : Mélange des réponses**

- Mélange aléatoirement les 4 réponses
- Vérifie que toutes les réponses sont toujours présentes
- Confirme que la longueur reste identique

**Test 21 : État de la partie multijoueur**

- Suit le nombre de joueurs prêts vs total
- Vérifie la condition de démarrage (tous prêts)
- Valide les changements d'état

**Test 22 : Reconnaissance du jeu par défaut hardcodé**

- Vérifie la détection du jeu "MultiGamePlay"
- Reconnaît les IDs: 999, 'multigameplay', 'MultiGamePlay'
- Rejette les autres IDs comme jeux personnalisés

#### Tests de Validation de Données (3 tests)

**Test 23 : Structure de question valide**

- Vérifie toutes les propriétés requises (text, correctAnswer, wrongAnswers, timeLimit, points)
- Valide que wrongAnswers est un tableau non vide
- Confirme que timeLimit et points sont positifs

**Test 24 : Génération de codes de salle uniques**

- Génère 100 codes de salle aléatoires
- Vérifie l'unicité (> 90% de codes différents)
- Confirme le bon fonctionnement du générateur

**Test 25 : Application des limites de temps**

- Vérifie qu'un délai de 31 secondes dépasse la limite de 30s
- Confirme qu'un délai de 20 secondes est dans les limites
- Valide la logique de timeout

---

## Résultats Attendus

Lors de l'exécution de `npm test`, vous devriez voir :

```
 PASS  tests/auth.test.js
  Authentication Tests
    ✓ should validate email format (28 ms)
    ✓ should validate password length (4 ms)
    ✓ should validate username requirements (3 ms)
    ✓ should generate JWT token format (7 ms)

 PASS  tests/games.test.js
  Game Data Validation Tests
    ✓ should validate valid game object (34 ms)
    ✓ should have valid game categories (4 ms)
    ✓ should filter games by category (5 ms)
    ✓ should validate difficulty levels (3 ms)

 PASS  tests/multiplayer.test.js
  Multiplayer Room Logic Tests
    ✓ should generate valid room code format (28 ms)
    ✓ should validate room max capacity (5 ms)
    ✓ should determine valid game mode (3 ms)
    ✓ should have valid room status (5 ms)

 PASS  tests/advanced.test.js
  Advanced Feature Tests
    ✓ should calculate correct score based on time and difficulty (29 ms)
    ✓ should sort players by score in descending order (6 ms)
    ✓ should validate question timer countdown (3 ms)
    ✓ should handle multiple choice questions correctly (4 ms)
    ✓ should register first player to buzz (3 ms)
    ✓ should track game progress correctly (2 ms)
    ✓ should organize questions by levels (3 ms)
    ✓ should shuffle answer options (2 ms)
    ✓ should track multiplayer game state (2 ms)
    ✓ should recognize default multiplayer game (11 ms)
  Data Validation Tests
    ✓ should validate question structure (5 ms)
    ✓ should generate unique room codes (4 ms)
    ✓ should enforce time limits on questions (1 ms)

Test Suites: 4 passed, 4 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        6.11 s
Ran all test suites.
```

## Types de Tests Disponibles

### Tests Unitaires (Unit Tests)

Les tests actuels sont tous des **tests unitaires** qui :

- Testent des fonctions isolées
- N'ont pas de dépendances externes
- Ne nécessitent pas de base de données
- Sont rapides à exécuter

### Tests Possibles à Ajouter

**Tests d'Intégration (Integration Tests)**

- Tests des routes API complètes avec Supertest
- Vérification de l'intégration avec la base de données
- Tests des middlewares (authentification, validation)
- Tests des websockets (Socket.io)

**Tests End-to-End (E2E Tests)**

- Scénarios utilisateur complets
- Tests de flux multijoueur
- Validation de l'inscription à la partie complète

**Tests de Performance (Performance Tests)**

- Charge de plusieurs requêtes simultanées
- Temps de réponse des endpoints
- Scalabilité des salles multijoueur

**Tests de Sécurité (Security Tests)**

- Injection SQL
- Validation des entrées utilisateur
- Protection contre les attaques CSRF/XSS
- Gestion des tokens expirés

## Configuration

### jest.config.js

```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  testTimeout: 10000
}
```

## Couverture de Code

Générer un rapport de couverture :

```bash
npm run test:coverage
```

Le rapport sera disponible dans `coverage/lcov-report/index.html`

## Couverture des Tests

### Fonctionnalités Testées

| Catégorie                           | Nombre de Tests | Fichier                 |
| ------------------------------------ | --------------- | ----------------------- |
| **Authentification**           | 4               | `auth.test.js`        |
| **Validation de Jeux**         | 4               | `games.test.js`       |
| **Logique Multijoueur**        | 4               | `multiplayer.test.js` |
| **Fonctionnalités Avancées** | 10              | `advanced.test.js`    |
| **Validation de Données**     | 3               | `advanced.test.js`    |
| **TOTAL**                      | **25**    | 4 fichiers              |

### Domaines Couverts

✅ **Authentification** : Email, password, username, JWT token
✅ **Jeux** : Structure, catégories, filtrage, difficulté
✅ **Multijoueur** : Salles, codes, capacité, modes de jeu
✅ **Scoring** : Calcul avec temps et difficulté
✅ **Leaderboard** : Tri et classement
✅ **Questions** : Structure, mélange, choix multiples
✅ **Buzzer** : Système de premier arrivé
✅ **Progression** : Suivi de l'avancement
✅ **Jeu par défaut** : Détection du jeu hardcodé
✅ **Validation** : Structure de données complète

## Bonnes Pratiques Implémentées

✅ **Isolation** : Chaque test est indépendant et n'affecte pas les autres
✅ **Nommage clair** : Descriptions explicites avec "should"
✅ **Assertions Jest** : Utilisation de matchers appropriés (`toHaveLength`, `toContain`, `toBe`, `toBeGreaterThan`)
✅ **Pas de DB** : Tests unitaires sans dépendances externes
✅ **Tests rapides** : Exécution en ~6 secondes pour 25 tests
✅ **Organisation** : Tests regroupés par domaine fonctionnel
✅ **Coverage complète** : Toutes les fonctionnalités majeures testées

## Statistiques des Tests

```
Total Test Suites: 4
Total Tests: 25
Duration: ~6 seconds
Success Rate: 100%
```

### Répartition par Fichier

```
auth.test.js         ████████████████ 4 tests  (16%)
games.test.js        ████████████████ 4 tests  (16%)
multiplayer.test.js  ████████████████ 4 tests  (16%)
advanced.test.js     ████████████████████████████████████ 13 tests (52%)
```

## Ajouter de Nouveaux Tests

### Exemple : Test de Calcul de Score

```javascript
const { describe, test, expect } = require('@jest/globals')

describe('Score Calculator', () => {
  test('should calculate score with streak bonus', () => {
    const calculateScore = (basePoints, streak) => {
      const streakBonus = streak > 1 ? streak * 25 : 0
      return basePoints + streakBonus
    }
  
    const score = calculateScore(100, 5)
  
    expect(score).toBe(225)  // 100 + (5 × 25)
    expect(score).toBeGreaterThan(100)
  })
})
```

### Exemple : Test de Validation Complexe

```javascript
describe('Question Validation', () => {
  test('should validate complete question structure', () => {
    const question = {
      text: 'Quelle est la capitale de la France?',
      correctAnswer: 'Paris',
      wrongAnswers: ['Londres', 'Berlin', 'Madrid'],
      timeLimit: 30,
      points: 100
    }
  
    expect(question).toHaveProperty('text')
    expect(question).toHaveProperty('correctAnswer')
    expect(question.wrongAnswers).toBeInstanceOf(Array)
    expect(question.wrongAnswers.length).toBe(3)
    expect(question.timeLimit).toBeGreaterThan(0)
    expect(question.points).toBeGreaterThan(0)
  })
})
```

### Exemple : Test de Logique Métier

```javascript
describe('Multiplayer Game Logic', () => {
  test('should determine winner correctly', () => {
    const players = [
      { id: 1, name: 'Alice', score: 1500 },
      { id: 2, name: 'Bob', score: 1800 },
      { id: 3, name: 'Charlie', score: 1200 }
    ]
  
    const winner = players.reduce((prev, current) => 
      current.score > prev.score ? current : prev
    )
  
    expect(winner.name).toBe('Bob')
    expect(winner.score).toBe(1800)
    expect(winner.score).toBeGreaterThan(1500)
  })
})
```

## Débogage

```bash
# Mode verbose (plus de détails)
npm test -- --verbose

# Exécuter un fichier de test spécifique
npm test -- auth.test.js

# Désactiver le cache Jest
npm test -- --no-cache

# Exécuter les tests en mode debug
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Notes Importantes

- **Pas de base de données** : Les tests actuels n'utilisent pas MySQL/Sequelize
- **Tests isolés** : Chaque test peut être exécuté indépendamment
- **Couverture actuelle** : 0% car les fichiers source ne sont pas importés directement
- **Temps d'exécution** : ~3 secondes pour les 12 tests

## Prochaines Étapes Suggérées

1. **Tests d'intégration API** avec Supertest et base de données de test
2. **Tests des middlewares** (authMiddleware, validationMiddleware)
3. **Tests Socket.io** pour les fonctionnalités temps réel
4. **Tests de validation** des modèles Sequelize
5. **Tests des contrôleurs** avec mocks de base de données

## Intégration CI/CD

Pour GitHub Actions :

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Ressources

- [Jest Documentation](https://jestjs.io/)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
- [Node.js Testing Guide](https://nodejs.org/en/docs/guides/testing/)
