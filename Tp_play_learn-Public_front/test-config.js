// Test rapide pour vérifier les exports de gameConfig
import { AVAILABLE_GAMES, CATEGORIES, DIFFICULTY_LEVELS } from './src/games/gameConfig.js'

console.log('=== TEST GAME CONFIG ===')
console.log('Categories:', CATEGORIES)
console.log('Difficulty Levels:', DIFFICULTY_LEVELS)
console.log('Available Games:', AVAILABLE_GAMES)
console.log('Number of games:', AVAILABLE_GAMES.length)
console.log('Game 1:', AVAILABLE_GAMES[0])
