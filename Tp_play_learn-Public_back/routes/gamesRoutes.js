const express = require('express')
const gamesController = require('../controllers/gamesController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

/**
 * Routes publiques (sans authentification)
 */

// GET /api/games - Liste de tous les jeux avec filtres
router.get('/', gamesController.getAllGames)

// GET /api/games/categories - Liste des catégories
router.get('/categories', gamesController.getCategories)

// GET /api/games/:gameId - Détails d'un jeu spécifique
router.get('/:gameId', gamesController.getGameById)

// GET /api/games/:gameId/levels - Niveaux d'un jeu
router.get('/:gameId/levels', gamesController.getGameLevels)

/**
 * Routes protégées (authentification requise)
 */

// POST /api/games/:gameId/play - Incrémenter le compteur de jeu
router.post('/:gameId/play', protect, gamesController.incrementPlayCount)

// POST /api/games - Créer un nouveau jeu (admin/creator)
router.post('/', protect, gamesController.createGame)

// PUT /api/games/:id - Mettre à jour un jeu (admin/creator)
router.put('/:id', protect, gamesController.updateGame)

// DELETE /api/games/:id - Supprimer un jeu (admin)
router.delete('/:id', protect, gamesController.deleteGame)

module.exports = router
