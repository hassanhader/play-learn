import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import '../styles/create-multiplayer.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Composant Timer pour afficher le temps restant
const RoomTimer = ({ createdAt }) => {
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes = 300 secondes

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const created = new Date(createdAt).getTime()
      const elapsed = Math.floor((now - created) / 1000) // secondes écoulées
      const remaining = Math.max(0, 300 - elapsed) // 300s = 5 minutes
      return remaining
    }

    setTimeLeft(calculateTimeLeft())

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)
      
      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [createdAt])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const percentage = (timeLeft / 300) * 100

  const getColor = () => {
    if (percentage > 66) return '#4caf50'
    if (percentage > 33) return '#ff9800'
    return '#f44336'
  }

  return (
    <div className="room-timer">
      <div className="timer-display" style={{ color: getColor() }}>
        ⏱️ {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
      <div className="timer-bar">
        <div 
          className="timer-progress" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getColor()
          }}
        />
      </div>
    </div>
  )
}

export default function CreateMultiplayerGame() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState(null)
  const [roomName, setRoomName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [isPrivate, setIsPrivate] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeRooms, setActiveRooms] = useState([])

  useEffect(() => {
    fetchGames()
    fetchActiveRooms()
    
    // Rafraîchir les salons toutes les 10 secondes
    const interval = setInterval(fetchActiveRooms, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchActiveRooms = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/multiplayer/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setActiveRooms(response.data.rooms || [])
    } catch (error) {
      console.error('Error fetching active rooms:', error)
    }
  }

  const fetchGames = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/games`)
      
      console.log('🔍 Raw games response:', response.data)
      
      // Les jeux sont dans response.data.data, pas response.data.games!
      const gamesArray = response.data.data || response.data.games || []
      
      if (gamesArray.length > 0) {
        // 🔍 LOG: Voir les valeurs isMultiplayer de TOUS les jeux
        console.log('🔍 All games with isMultiplayer values:', gamesArray.map(g => ({
          id: g.id,
          title: g.title,
          isEnabled: g.isEnabled,
          isMultiplayer: g.isMultiplayer,
          minPlayers: g.minPlayers,
          maxPlayers: g.maxPlayers
        })))
        
        // Filtrer uniquement les jeux actifs ET multijoueurs
        const activeGames = gamesArray.filter(game => game.isEnabled && game.isMultiplayer)
        console.log('🎮 Filtered multiplayer games:', activeGames)
        setGames(activeGames)
      } else if (response.data.games) {
        // Si pas de success mais des games
        setGames(response.data.games)
      } else {
        // Aucun jeu disponible
        setGames([])
      }
    } catch (error) {
      console.error('Error fetching games:', error)
      setError('Erreur lors du chargement des jeux. Vérifiez que le backend est démarré.')
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async () => {
    if (!selectedGame) {
      setError('Veuillez sélectionner un jeu')
      return
    }

    if (!roomName.trim()) {
      setError('Veuillez entrer un nom de partie')
      return
    }

    try {
      const token = localStorage.getItem('token')
      
      console.log('🚀 Creating room with:', {
        gameId: selectedGame.id,
        roomName: roomName.trim(),
        maxPlayers: parseInt(maxPlayers),
        isPrivate
      })
      
      const response = await axios.post(
        `${API_URL}/multiplayer/rooms`,
        {
          gameId: selectedGame.id, // Utiliser l'ID numérique, pas gameId string
          roomName: roomName.trim(),
          maxPlayers: parseInt(maxPlayers),
          isPrivate
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      console.log('✅ Room created, response:', response.data)

      // Le backend peut renvoyer soit {success: true, room: ...} soit juste {room: ...}
      if (response.data.room) {
        // Rediriger vers la salle d'attente avec le roomCode
        const roomCode = response.data.room.roomCode
        console.log('🎯 Navigating to waiting room with roomCode:', roomCode)
        navigate(`/waiting-room/${roomCode}`)
      } else {
        console.error('❌ Room creation failed:', response.data)
        setError(response.data.message || 'Échec de la création de la partie')
      }
    } catch (error) {
      console.error('❌ Error creating room:', error)
      console.error('Error details:', error.response?.data)
      setError(error.response?.data?.message || 'Erreur lors de la création de la partie')
    }
  }

  const filteredGames = games.filter(game =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.category.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // 🔍 LOG: Voir combien de jeux après filtrage
  console.log('🔍 Games count:', {
    totalGames: games.length,
    filteredGames: filteredGames.length,
    searchTerm: searchTerm
  })

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'facile': return '#4caf50'
      case 'moyen': return '#ff9800'
      case 'difficile': return '#f44336'
      default: return '#2196f3'
    }
  }

  return (
    <div className="create-multiplayer-page">
      {/* Header */}
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <span>←</span> Retour
        </button>
        <h1>🎮 Créer une Partie Multijoueur</h1>
        <div className="header-subtitle">
          Sélectionnez un jeu et configurez votre partie
        </div>
      </div>

      <div className="create-multiplayer-container">
        {/* Section de sélection du jeu */}
        <div className="games-selection-section">
          <div className="section-header">
            <h2>📚 Choisir un Jeu</h2>
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Rechercher un jeu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Chargement des jeux...</p>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🎮</span>
              <p>Aucun jeu disponible</p>
              <small>Demandez à un admin de créer des jeux multijoueur</small>
            </div>
          ) : (
            <div className="games-table-container">
              <table className="games-table">
                <thead>
                  <tr>
                    <th>Sélection</th>
                    <th>Jeu</th>
                    <th>Catégorie</th>
                    <th>Difficulté</th>
                    <th>Questions</th>
                    <th>Temps</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGames.map((game) => (
                    <tr
                      key={game.id}
                      className={selectedGame?.id === game.id ? 'selected' : ''}
                      onClick={() => setSelectedGame(game)}
                    >
                      <td>
                        <input
                          type="radio"
                          name="gameSelection"
                          checked={selectedGame?.id === game.id}
                          onChange={() => setSelectedGame(game)}
                        />
                      </td>
                      <td>
                        <div className="game-info">
                          <span className="game-icon">{game.icon || '🎮'}</span>
                          <span className="game-title">{game.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{game.category}</span>
                      </td>
                      <td>
                        <span
                          className="difficulty-badge"
                          style={{ backgroundColor: getDifficultyColor(game.difficulty) }}
                        >
                          {game.difficulty || 'Non défini'}
                        </span>
                      </td>
                      <td className="text-center">{game.questionCount || 0}</td>
                      <td className="text-center">{game.timeLimit || 30}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bouton de création intégré dans la section des jeux */}
          {selectedGame && (
            <div className="inline-create-section">
              <div className="selected-game-info">
                <span className="game-icon-lg">{selectedGame.icon || '🎮'}</span>
                <div className="game-details">
                  <h3>{selectedGame.title}</h3>
                  <p>{selectedGame.description}</p>
                </div>
              </div>
              <div className="quick-config">
                <input
                  type="text"
                  placeholder="Nom de la partie..."
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="room-name-input"
                />
                <div className="players-selector">
                  <label>Joueurs max:</label>
                  <select value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))}>
                    {[2, 3, 4, 5, 6, 8, 10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <label className="private-checkbox">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                  />
                  <span>🔒 Partie privée</span>
                </label>
                <button 
                  className="btn-create-room"
                  onClick={handleCreateRoom}
                  disabled={!roomName.trim()}
                >
                  🚀 Créer la Partie
                </button>
              </div>
              {error && <div className="error-msg">{error}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Section des salons actifs */}
      {activeRooms.length > 0 && (
        <div className="active-rooms-section">
          <h2>🎮 Salons Actifs ({activeRooms.length})</h2>
          <div className="rooms-grid">
            {activeRooms.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-card-header">
                  <div className="room-title">
                    <span className="room-icon">🎯</span>
                    <h3>{room.name}</h3>
                  </div>
                  <RoomTimer createdAt={room.createdAt} />
                </div>
                <div className="room-card-body">
                  <div className="room-info">
                    <span className="info-label">Jeu:</span>
                    <span className="info-value">{room.game?.title || 'N/A'}</span>
                  </div>
                  <div className="room-info">
                    <span className="info-label">Hôte:</span>
                    <span className="info-value">{room.host?.username || 'N/A'}</span>
                  </div>
                  <div className="room-info">
                    <span className="info-label">Joueurs:</span>
                    <span className="info-value players-count">
                      {room.currentPlayers}/{room.maxPlayers}
                    </span>
                  </div>
                  <div className="room-info">
                    <span className="info-label">Code:</span>
                    <span className="info-value room-code">{room.roomCode}</span>
                  </div>
                </div>
                <div className="room-card-footer">
                  <button 
                    className="btn-join-room"
                    onClick={() => navigate(`/waiting-room/${room.roomCode}`)}
                    disabled={room.currentPlayers >= room.maxPlayers}
                  >
                    {room.currentPlayers >= room.maxPlayers ? '🔒 Complet' : '▶️ Rejoindre'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
