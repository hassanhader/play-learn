import { useState } from 'react'
import gamesService from '../services/gamesService'
import './CreateGameForm.css'

export default function CreateMultiplayerGameForm({ onGameCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Mathematics',
    difficulty: 'medium',
    timeLimit: 30,
    minPlayers: 2,
    maxPlayers: 10,
    gameMode: 'quiz', // quiz (buzzer) | speed (tous répondent)
    hasBuzzer: true
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const gameData = {
        gameId: `multiplayer-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        timeLimit: parseInt(formData.timeLimit),
        isMultiplayer: true,
        isEnabled: true,
        type: 'multiplayer',
        minPlayers: parseInt(formData.minPlayers),
        maxPlayers: parseInt(formData.maxPlayers),
        settings: {
          gameMode: formData.gameMode,
          hasBuzzer: formData.hasBuzzer,
          allowGuests: true
        }
      }

      console.log('📤 Creating multiplayer game:', gameData)

      const response = await gamesService.createGame(gameData)

      if (!response.success) {
        throw new Error(response.message || 'Failed to create game')
      }

      console.log('✅ Multiplayer game created:', response.data)

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'Mathematics',
        difficulty: 'medium',
        timeLimit: 30,
        minPlayers: 2,
        maxPlayers: 10,
        gameMode: 'quiz',
        hasBuzzer: true
      })

      if (onGameCreated) {
        onGameCreated(response.data)
      }

      alert('✅ Jeu multiplayer créé avec succès!')
    } catch (err) {
      console.error('Error creating multiplayer game:', err)
      setError(err.message || 'Erreur lors de la création du jeu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="create-game-form">
      <h2>🎮 Créer un Jeu Multiplayer</h2>
      <p className="form-description">
        Créez un jeu multijoueur avec système de buzzer et questions collaboratives
      </p>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Informations de base */}
        <div className="form-section">
          <h3>📋 Informations de base</h3>
          
          <div className="form-group">
            <label htmlFor="title">
              Titre du jeu <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Quiz de Mathématiques"
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez votre jeu multiplayer..."
              required
              rows={4}
              maxLength={500}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Catégorie</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Mathematics">Mathématiques</option>
                <option value="Science">Sciences</option>
                <option value="History">Histoire</option>
                <option value="Geography">Géographie</option>
                <option value="Languages">Langues</option>
                <option value="General">Culture Générale</option>
                <option value="Other">Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulté</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configuration Multiplayer */}
        <div className="form-section">
          <h3>👥 Configuration Multiplayer</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="minPlayers">Joueurs minimum</label>
              <input
                type="number"
                id="minPlayers"
                name="minPlayers"
                value={formData.minPlayers}
                onChange={handleChange}
                min="2"
                max="10"
                required
              />
              <small>Nombre minimum de joueurs pour démarrer</small>
            </div>

            <div className="form-group">
              <label htmlFor="maxPlayers">Joueurs maximum</label>
              <input
                type="number"
                id="maxPlayers"
                name="maxPlayers"
                value={formData.maxPlayers}
                onChange={handleChange}
                min="2"
                max="20"
                required
              />
              <small>Nombre maximum de joueurs autorisés</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="gameMode">Mode de jeu</label>
            <select
              id="gameMode"
              name="gameMode"
              value={formData.gameMode}
              onChange={handleChange}
            >
              <option value="quiz">Quiz avec Buzzer (le plus rapide répond)</option>
              <option value="speed">Speed Mode (tous répondent simultanément)</option>
            </select>
            <small>
              {formData.gameMode === 'quiz' 
                ? '🔔 Les joueurs doivent buzzer pour répondre en premier'
                : '⚡ Tous les joueurs répondent en même temps, le plus rapide gagne'}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="timeLimit">Temps par question (secondes)</label>
            <input
              type="number"
              id="timeLimit"
              name="timeLimit"
              value={formData.timeLimit}
              onChange={handleChange}
              min="10"
              max="120"
              required
            />
            <small>Temps alloué pour répondre à chaque question</small>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="hasBuzzer"
                checked={formData.hasBuzzer}
                onChange={handleChange}
                disabled={formData.gameMode === 'quiz'}
              />
              <span>Activer le système de buzzer</span>
            </label>
            <small>
              {formData.gameMode === 'quiz' 
                ? 'Le buzzer est obligatoire en mode Quiz'
                : 'Permet aux joueurs de buzzer pour répondre en premier'}
            </small>
          </div>
        </div>

        {/* Instructions */}
        <div className="form-section info-section">
          <h4>📌 Prochaines étapes</h4>
          <ol>
            <li>Créez le jeu avec ce formulaire</li>
            <li>Ajoutez des niveaux au jeu</li>
            <li>Ajoutez des questions à chaque niveau</li>
            <li>Les joueurs pourront créer des rooms et jouer ensemble!</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Création...' : '✅ Créer le jeu multiplayer'}
          </button>
        </div>
      </form>
    </div>
  )
}
