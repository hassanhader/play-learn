/**
 * Configuration globale des jeux
 * Ce fichier définit tous les jeux disponibles dans l'application
 * Plus tard, ces données proviendront d'une base de données
 */

export const GAME_TYPES = {
  QUIZ: 'quiz',
  MEMORY: 'memory',
  PUZZLE: 'puzzle',
  CODING: 'coding',
  MATH: 'math'
}

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert'
}

export const CATEGORIES = [
  'Mathematics',
  'Physics',
  'Computer Science',
  'Geography',
  'History',
  'Biology'
]

/**
 * Configuration des jeux disponibles
 * Structure qui sera utilisée pour créer les jeux en base de données
 */
export const AVAILABLE_GAMES = [
  {
    id: 'math-quiz-1',
    title: 'Math Quiz Challenge',
    type: GAME_TYPES.QUIZ,
    category: 'Mathematics',
    difficulty: 'medium',
    description: 'Test your mathematical skills with various questions',
    icon: '➕',
    timeLimit: 180,
    totalQuestions: 5,
    enabled: true
  },
  {
    id: 'cs-quiz-1',
    title: 'Programming Basics',
    type: GAME_TYPES.QUIZ,
    category: 'Computer Science',
    difficulty: 'easy',
    description: 'Learn the fundamentals of programming',
    icon: '💻',
    timeLimit: 300,
    totalQuestions: 8,
    enabled: true
  },
  {
    id: 'memory-math-1',
    title: 'Math Memory Game',
    type: GAME_TYPES.MEMORY,
    category: 'Mathematics',
    difficulty: 'easy',
    description: 'Match mathematical symbols with their pairs',
    icon: '🧮',
    timeLimit: 120,
    totalQuestions: 16,
    enabled: true
  },
  {
    id: 'speed-math-1',
    title: 'Speed Math Challenge',
    type: GAME_TYPES.MATH,
    category: 'Mathematics',
    difficulty: 'medium',
    description: 'Solve math problems as fast as you can!',
    icon: '⚡',
    timeLimit: 180,
    totalQuestions: 15,
    enabled: true
  },
  {
    id: 'speed-math-easy',
    title: 'Math Basics',
    type: GAME_TYPES.MATH,
    category: 'Mathematics',
    difficulty: 'easy',
    description: 'Simple calculations for beginners',
    icon: '🔢',
    timeLimit: 120,
    totalQuestions: 10,
    enabled: true
  },
  {
    id: 'speed-math-hard',
    title: 'Math Expert',
    type: GAME_TYPES.MATH,
    category: 'Mathematics',
    difficulty: 'hard',
    description: 'Advanced mathematical operations',
    icon: '🎯',
    timeLimit: 240,
    totalQuestions: 20,
    enabled: true
  },
  {
    id: 'physics-quiz-1',
    title: 'Physics Fundamentals',
    type: GAME_TYPES.QUIZ,
    category: 'Physics',
    difficulty: 'medium',
    description: 'Test your knowledge of physics concepts',
    icon: '⚛️',
    timeLimit: 240,
    totalQuestions: 10,
    enabled: true
  },
  {
    id: 'geography-quiz-1',
    title: 'World Capitals',
    type: GAME_TYPES.QUIZ,
    category: 'Geography',
    difficulty: 'easy',
    description: 'Identify capitals of countries around the world',
    icon: '🌍',
    timeLimit: 180,
    totalQuestions: 12,
    enabled: true
  },
  {
    id: 'memory-flags-1',
    title: 'Flag Memory',
    type: GAME_TYPES.MEMORY,
    category: 'Geography',
    difficulty: 'medium',
    description: 'Match country flags in this memory game',
    icon: '🚩',
    timeLimit: 150,
    totalQuestions: 12,
    enabled: true
  },
  {
    id: 'cs-advanced-1',
    title: 'Advanced Programming',
    type: GAME_TYPES.QUIZ,
    category: 'Computer Science',
    difficulty: 'hard',
    description: 'Deep dive into complex programming concepts',
    icon: '🚀',
    timeLimit: 360,
    totalQuestions: 12,
    enabled: true
  }
]

/**
 * Obtenir un jeu par son ID
 */
export const getGameById = (gameId) => {
  return AVAILABLE_GAMES.find(game => game.id === gameId)
}

/**
 * Obtenir tous les jeux d'une catégorie
 */
export const getGamesByCategory = (category) => {
  return AVAILABLE_GAMES.filter(game => game.category === category && game.enabled)
}

/**
 * Obtenir tous les jeux d'un type
 */
export const getGamesByType = (type) => {
  return AVAILABLE_GAMES.filter(game => game.type === type && game.enabled)
}

/**
 * Obtenir tous les jeux d'une difficulté
 */
export const getGamesByDifficulty = (difficulty) => {
  return AVAILABLE_GAMES.filter(game => game.difficulty === difficulty && game.enabled)
}
