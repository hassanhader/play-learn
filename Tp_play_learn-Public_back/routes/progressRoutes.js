const express = require('express')
const progressController = require('../controllers/progressController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

/**
 * Toutes les routes de progression nécessitent une authentification
 */

// GET /api/progress - Toute la progression de l'utilisateur
router.get('/', protect, progressController.getUserProgress)

// GET /api/progress/stats - Statistiques globales de progression
router.get('/stats', protect, progressController.getProgressStats)

// GET /api/progress/game/:gameId - Progression pour un jeu spécifique
router.get('/game/:gameId', protect, progressController.getGameProgress)

// POST /api/progress/level/:levelId/complete - Enregistrer la complétion d'un niveau
router.post('/level/:levelId/complete', protect, progressController.completeLevel)

// DELETE /api/progress/level/:levelId/reset - Réinitialiser la progression d'un niveau
router.delete('/level/:levelId/reset', protect, progressController.resetLevelProgress)

module.exports = router
