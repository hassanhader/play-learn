import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './CreateRoomModal.css'

export default function CreateRoomModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [selectedGame, setSelectedGame] = useState('')
  const [roomName, setRoomName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [difficulty, setDifficulty] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchGames()
    }
  }, [isOpen])

  const fetchGames = async () => {
    try {
      const token = localStorage.getItem('token')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      
      const response = await fetch(`${API_URL}/api/games`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setGames(data.games || [])
      }
    } catch (err) {
      console.error('Error fetching games:', err)
    }
  }

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    
    if (!selectedGame) {
      setError('Veuillez sélectionner un jeu')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      
      const response = await fetch(`${API_URL}/api/multiplayer/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gameId: selectedGame,
          name: roomName || 'Nouvelle partie',
          maxPlayers,
          difficulty,
          gameMode: 'quiz'
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la salle')
      }

      const data = await response.json()
      navigate(`/waiting-room/${data.room.roomCode}`)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎮 Créer une partie</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleCreateRoom} className="create-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Jeu *</label>
            <select 
              value={selectedGame} 
              onChange={(e) => setSelectedGame(e.target.value)}
              required
            >
              <option value="">-- Sélectionnez un jeu --</option>
              {games.map(game => (
                <option key={game.id} value={game.id}>
                  {game.title} ({game.type})
                </option>
              ))}
            </select>
            {games.length === 0 && (
              <p style={{ 
                margin: '8px 0 0', 
                fontSize: '12px', 
                color: 'rgba(255, 255, 255, 0.9)',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                💡 Aucun jeu disponible. Demande à un admin de créer des jeux dans l'espace Admin!
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Nom de la salle (optionnel)</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Partie de quiz"
              maxLength={50}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nombre de joueurs</label>
              <select 
                value={maxPlayers} 
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
              >
                <option value={2}>2 joueurs</option>
                <option value={3}>3 joueurs</option>
                <option value={4}>4 joueurs</option>
                <option value={5}>5 joueurs</option>
                <option value={6}>6 joueurs</option>
                <option value={8}>8 joueurs</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulté</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Création...' : 'Créer la partie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
