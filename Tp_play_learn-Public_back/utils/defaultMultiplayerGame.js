/**
 * Jeu multijoueur par défaut hardcodé pour les tests
 * Ce jeu est toujours disponible, même si la BD est vide
 */

const DEFAULT_MULTIPLAYER_GAME = {
  id: 999,
  gameId: 'multigameplay',
  title: 'MultiGamePlay',
  type: 'quiz',
  category: 'Test',
  difficulty: 'medium',
  description: 'Jeu de test multijoueur avec questions hardcodées',
  isMultiplayer: true,
  minPlayers: 2,
  maxPlayers: 10,
  isEnabled: true,
  icon: '🎮'
}

const DEFAULT_MULTIPLAYER_QUESTIONS = [
  {
    id: 1,
    text: 'Quelle est la capitale de la France?',
    correctAnswer: 'Paris',
    wrongAnswers: ['Londres', 'Berlin', 'Madrid'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 2,
    text: 'Combien font 2 + 2?',
    correctAnswer: '4',
    wrongAnswers: ['3', '5', '6'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 3,
    text: 'Quel est le langage de programmation pour le web côté client?',
    correctAnswer: 'JavaScript',
    wrongAnswers: ['Python', 'Java', 'C++'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 4,
    text: 'Quelle est la couleur du ciel par beau temps?',
    correctAnswer: 'Bleu',
    wrongAnswers: ['Vert', 'Rouge', 'Jaune'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 5,
    text: 'Combien de jours dans une semaine?',
    correctAnswer: '7',
    wrongAnswers: ['5', '6', '8'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 6,
    text: 'Quel est le symbole chimique de l\'eau?',
    correctAnswer: 'H2O',
    wrongAnswers: ['CO2', 'O2', 'H2'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 7,
    text: 'Combien font 5 × 8?',
    correctAnswer: '40',
    wrongAnswers: ['35', '45', '48'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 8,
    text: 'Quel est le plus grand océan?',
    correctAnswer: 'Pacifique',
    wrongAnswers: ['Atlantique', 'Indien', 'Arctique'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 9,
    text: 'En quelle année a eu lieu le premier alunissage?',
    correctAnswer: '1969',
    wrongAnswers: ['1965', '1972', '1975'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 10,
    text: 'Quel est le plus petit nombre premier?',
    correctAnswer: '2',
    wrongAnswers: ['1', '3', '0'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 11,
    text: 'Quelle est la planète la plus proche du Soleil?',
    correctAnswer: 'Mercure',
    wrongAnswers: ['Vénus', 'Mars', 'Terre'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 12,
    text: 'Combien de continents y a-t-il sur Terre?',
    correctAnswer: '7',
    wrongAnswers: ['5', '6', '8'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 13,
    text: 'Quelle est la vitesse de la lumière (arrondie)?',
    correctAnswer: '300 000 km/s',
    wrongAnswers: ['150 000 km/s', '500 000 km/s', '1 000 000 km/s'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 14,
    text: 'Quel est le plus grand pays du monde par superficie?',
    correctAnswer: 'Russie',
    wrongAnswers: ['Canada', 'Chine', 'États-Unis'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 15,
    text: 'Combien font 12 × 12?',
    correctAnswer: '144',
    wrongAnswers: ['124', '132', '156'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 16,
    text: 'Quel est l\'élément chimique avec le symbole "Au"?',
    correctAnswer: 'Or',
    wrongAnswers: ['Argent', 'Aluminium', 'Arsenic'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 17,
    text: 'En quelle année a commencé la Seconde Guerre mondiale?',
    correctAnswer: '1939',
    wrongAnswers: ['1914', '1941', '1945'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 18,
    text: 'Quelle est la capitale du Japon?',
    correctAnswer: 'Tokyo',
    wrongAnswers: ['Kyoto', 'Osaka', 'Hiroshima'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 19,
    text: 'Combien de côtés a un hexagone?',
    correctAnswer: '6',
    wrongAnswers: ['5', '7', '8'],
    timeLimit: 30,
    points: 100
  },
  {
    id: 20,
    text: 'Quel est le langage de programmation créé par Guido van Rossum?',
    correctAnswer: 'Python',
    wrongAnswers: ['Java', 'Ruby', 'PHP'],
    timeLimit: 30,
    points: 100
  }
]

module.exports = {
  DEFAULT_MULTIPLAYER_GAME,
  DEFAULT_MULTIPLAYER_QUESTIONS,
  isDefaultGame: (gameId) => {
    return gameId === 999 || gameId === 'multigameplay' || gameId === DEFAULT_MULTIPLAYER_GAME.id
  }
}
