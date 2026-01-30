const express = require('express')
const levelsController = require('../controllers/levelsController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

/**
 * Routes publiques (sans authentification)
 */

// GET /api/levels/:levelId - Détails d'un niveau spécifique
router.get('/:levelId', levelsController.getLevelById)

// GET /api/levels/:levelId/questions - Questions d'un niveau
router.get('/:levelId/questions', levelsController.getLevelQuestions)

/**
 * Routes protégées (authentification requise)
 */

// POST /api/levels/:levelId/unlock - Débloquer un niveau
router.post('/:levelId/unlock', protect, levelsController.unlockLevel)

// POST /api/levels - Créer un nouveau niveau (admin/creator)
router.post('/', protect, levelsController.createLevel)

// PUT /api/levels/:id - Mettre à jour un niveau (admin/creator)
router.put('/:id', protect, levelsController.updateLevel)

// DELETE /api/levels/:id - Supprimer un niveau (admin)
router.delete('/:id', protect, levelsController.deleteLevel)

module.exports = router
