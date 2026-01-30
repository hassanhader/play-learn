const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const { authenticate } = require('../middleware/authMiddleware')
const { isAdmin } = require('../middleware/adminMiddleware')

/**
 * Toutes les routes admin nécessitent authentification + droits admin
 */

// Gestion des utilisateurs
router.get('/users', authenticate, isAdmin, adminController.getAllUsers)
router.put('/users/:id/toggle-admin', authenticate, isAdmin, adminController.toggleUserAdmin)
router.delete('/users/:id', authenticate, isAdmin, adminController.deleteUser)

// Gestion des jeux
router.get('/games', authenticate, isAdmin, adminController.getAllGames)
router.get('/games/:id', authenticate, isAdmin, adminController.getGameById)
router.delete('/games/:id', authenticate, isAdmin, adminController.deleteGame)
router.put('/games/:id/toggle-status', authenticate, isAdmin, adminController.toggleGameStatus)

// Gestion des scores
router.delete('/scores/:id', authenticate, isAdmin, adminController.deleteScore)

// Statistiques globales
router.get('/stats', authenticate, isAdmin, adminController.getGlobalStats)

module.exports = router
