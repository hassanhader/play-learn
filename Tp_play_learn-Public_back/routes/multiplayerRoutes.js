const express = require('express')
const router = express.Router()
const multiplayerController = require('../controllers/multiplayerController')
const { protect } = require('../middleware/authMiddleware')

// All routes require authentication
router.use(protect)

// Create room
router.post('/rooms', multiplayerController.createRoom)

// Get available rooms
router.get('/rooms', multiplayerController.getAvailableRooms)

// Get room details
router.get('/rooms/:roomCode', multiplayerController.getRoomDetails)

// Join room
router.post('/rooms/:roomCode/join', multiplayerController.joinRoom)

// Set ready status
router.put('/rooms/:roomCode/ready', multiplayerController.setPlayerReady)

// Leave room
router.delete('/rooms/:roomCode/leave', multiplayerController.leaveRoom)

// Start game (new endpoint for synchronized launch)
router.post('/rooms/:roomCode/start', multiplayerController.startGame)

// Get game details with questions (NEW)
router.get('/games/:gameId', multiplayerController.getGameDetails)

module.exports = router
