import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { DIFFICULTY_LEVELS, CATEGORIES } from '../games/gameConfig'
import gamesService from '../services/gamesService'
import '../styles/create-game.css'

// Types de jeux multiplayer
export const MULTIPLAYER_GAME_TYPES = {
  QUIZ_BUZZER: 'quiz-buzzer',        // Quiz avec buzzer - premier à répondre
  QUIZ_SPEED: 'quiz-speed',          // Quiz vitesse - tous répondent
  PUZZLE_RACE: 'puzzle-race',        // Course de puzzle - premier à finir
  MATH_DUEL: 'math-duel',           // Duel de math - plus de bonnes réponses
  MEMORY_MATCH: 'memory-match'       // Memory collaboratif/compétitif
}

export default function CreateMultiplayerGameComplete() {
  const navigate = useNavigate()
  const location = useLocation()
  const editGameId = location.state?.editGameId
  const isEditing = !!editGameId
  
  const [loading, setLoading] = useState(isEditing)
  const [gameData, setGameData] = useState(null)
  
  // États du formulaire de base
  const [gameType, setGameType] = useState(MULTIPLAYER_GAME_TYPES.QUIZ_BUZZER)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    description: '',
    icon: '🎮',
    timeLimit: 30,          // Temps par question
    totalQuestions: 10,
    minPlayers: 2,
    maxPlayers: 10,
    enabled: true,
    pointsPerCorrect: 100,
    pointsPerWrong: -25,
    timeBonusEnabled: true
  })

  // États spécifiques aux quiz (buzzer et speed)
  const [quizQuestions, setQuizQuestions] = useState([])

  // États pour puzzle race
  const [puzzleConfig, setPuzzleConfig] = useState({
    gridSize: 4,              // 4x4 = 16 pièces
    imageUrl: '',
    shuffleType: 'random',    // random | ordered
    showPreview: true,
    previewDuration: 5        // secondes
  })

  // États pour math duel
  const [mathConfig, setMathConfig] = useState({
    operations: ['+', '-', '×', '÷'],
    numberRange: { min: 1, max: 100 },
    questionCount: 15,
    difficulty: 'medium'
  })

  // États pour memory match
  const [memoryConfig, setMemoryConfig] = useState({
    pairCount: 12,
    elementType: 'emoji',
    category: 'mixed',
    turnBased: true,          // Tour par tour ou simultané
    elements: []
  })

  // Collections d'éléments pour memory
  const elementCollections = {
    emoji: {
      animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
      fruits: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍'],
      sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🏒', '⛳', '🥊', '🎱'],
      flags: ['🇺🇸', '🇨🇦', '🇬🇧', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇯🇵', '🇨🇳', '🇧🇷', '🇲🇽', '🇦🇺']
    }
  }

  const availableIcons = ['🎮', '🎯', '🧠', '💡', '⚡', '🔥', '🎲', '🎪', '🎭', '🎨', '🏆', '🎖️', '👥', '🤝', '⚔️']

  // Charger les données du jeu en mode édition
  useEffect(() => {
    const loadGameData = async () => {
      if (!editGameId) return
      
      try {
        setLoading(true)
        const response = await gamesService.getGameByIdAdmin(editGameId)
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to load game data')
        }
        
        const game = response.data
        setGameData(game)
        
        // Remplir le formulaire
        setFormData({
          title: game.title || '',
          category: game.category || CATEGORIES[0],
          difficulty: game.difficulty || DIFFICULTY_LEVELS.MEDIUM,
          description: game.description || '',
          icon: game.icon || '🎮',
          timeLimit: game.timeLimit || 30,
          totalQuestions: game.settings?.totalQuestions || 10,
          minPlayers: game.minPlayers || 2,
          maxPlayers: game.maxPlayers || 10,
          enabled: game.isEnabled !== false,
          pointsPerCorrect: game.settings?.pointsPerCorrect || 100,
          pointsPerWrong: game.settings?.pointsPerWrong || -25,
          timeBonusEnabled: game.settings?.timeBonusEnabled !== false
        })
        
        // Charger les questions si c'est un quiz
        if (game.questions && game.questions.length > 0) {
          setQuizQuestions(game.questions.map(q => ({
            id: q.id || Date.now() + Math.random(),
            question: q.questionText || '',
            correctAnswer: q.correctAnswer || '',
            wrongAnswers: [
              q.wrongAnswer1 || '',
              q.wrongAnswer2 || '',
              q.wrongAnswer3 || ''
            ].filter(a => a),
            timeLimit: q.timeLimit || 30,
            points: q.points || 100
          })))
        }
        
        // Charger config selon le type
        if (game.type) {
          setGameType(game.type)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error loading game:', error)
        setSubmitError('Failed to load game data')
        setLoading(false)
      }
    }
    
    loadGameData()
  }, [editGameId])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))
  }

  const handleGameTypeChange = (type) => {
    setGameType(type)
  }

  // ==================== QUIZ FUNCTIONS ====================
  const addQuizQuestion = () => {
    if (quizQuestions.length >= formData.totalQuestions) {
      alert(`Vous avez atteint le nombre maximum de questions (${formData.totalQuestions}). Augmentez "Total Questions" pour en ajouter plus.`)
      return
    }
    
    setQuizQuestions([...quizQuestions, {
      id: Date.now(),
      question: '',
      correctAnswer: '',
      wrongAnswers: ['', '', ''],
      timeLimit: formData.timeLimit,
      points: formData.pointsPerCorrect
    }])
  }

  const updateQuizQuestion = (id, field, value) => {
    setQuizQuestions(quizQuestions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const updateWrongAnswer = (questionId, index, value) => {
    setQuizQuestions(quizQuestions.map(q => {
      if (q.id === questionId) {
        const newWrongAnswers = [...q.wrongAnswers]
        newWrongAnswers[index] = value
        return { ...q, wrongAnswers: newWrongAnswers }
      }
      return q
    }))
  }

  const removeQuizQuestion = (id) => {
    setQuizQuestions(quizQuestions.filter(q => q.id !== id))
  }

  // ==================== MEMORY FUNCTIONS ====================
  const selectMemoryElements = (subcategory) => {
    const elements = elementCollections[memoryConfig.elementType][subcategory]
    const shuffled = [...elements].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, memoryConfig.pairCount)
    
    setMemoryConfig(prev => ({
      ...prev,
      category: subcategory,
      elements: selected
    }))
  }

  // ==================== VALIDATION ====================
  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('⚠️ Le titre est requis')
      return false
    }

    if (formData.minPlayers < 2) {
      alert('⚠️ Un jeu multijoueur nécessite au moins 2 joueurs')
      return false
    }

    if (formData.maxPlayers < formData.minPlayers) {
      alert('⚠️ Le nombre maximum de joueurs doit être supérieur ou égal au minimum')
      return false
    }

    // Validation selon le type de jeu
    if (gameType === MULTIPLAYER_GAME_TYPES.QUIZ_BUZZER || gameType === MULTIPLAYER_GAME_TYPES.QUIZ_SPEED) {
      if (quizQuestions.length === 0) {
        alert('⚠️ Ajoutez au moins une question pour le quiz')
        return false
      }

      // Vérifier que toutes les questions sont complètes
      for (let i = 0; i < quizQuestions.length; i++) {
        const q = quizQuestions[i]
        if (!q.question.trim()) {
          alert(`⚠️ La question ${i + 1} est vide`)
          return false
        }
        if (!q.correctAnswer.trim()) {
          alert(`⚠️ La question ${i + 1} n'a pas de réponse correcte`)
          return false
        }
        if (q.wrongAnswers.filter(a => a.trim()).length < 2) {
          alert(`⚠️ La question ${i + 1} nécessite au moins 2 mauvaises réponses`)
          return false
        }
      }
    }

    if (gameType === MULTIPLAYER_GAME_TYPES.PUZZLE_RACE) {
      if (!puzzleConfig.imageUrl || !puzzleConfig.imageUrl.trim()) {
        alert('⚠️ Une URL d\'image est requise pour le puzzle')
        return false
      }
    }

    if (gameType === MULTIPLAYER_GAME_TYPES.MEMORY_MATCH) {
      if (memoryConfig.elements.length === 0) {
        alert('⚠️ Sélectionnez des éléments pour le jeu Memory')
        return false
      }
    }

    return true
  }

  // ==================== SUBMIT ====================
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      // Construire le payload
      const gamePayload = {
        gameId: gameData?.gameId || `multi-${gameType}-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        type: gameType,
        icon: formData.icon || '🎮',
        timeLimit: parseInt(formData.timeLimit),
        isEnabled: formData.enabled !== false,
        isMultiplayer: true,
        minPlayers: parseInt(formData.minPlayers),
        maxPlayers: parseInt(formData.maxPlayers),
        settings: {
          totalQuestions: parseInt(formData.totalQuestions),
          pointsPerCorrect: parseInt(formData.pointsPerCorrect),
          pointsPerWrong: parseInt(formData.pointsPerWrong),
          timeBonusEnabled: formData.timeBonusEnabled,
          gameMode: gameType,
          hasBuzzer: gameType === MULTIPLAYER_GAME_TYPES.QUIZ_BUZZER,
          allowGuests: true
        }
      }

      // Ajouter les questions pour les quiz
      if (gameType === MULTIPLAYER_GAME_TYPES.QUIZ_BUZZER || gameType === MULTIPLAYER_GAME_TYPES.QUIZ_SPEED) {
        gamePayload.settings.questions = quizQuestions
      }

      // Ajouter config pour puzzle
      if (gameType === MULTIPLAYER_GAME_TYPES.PUZZLE_RACE) {
        gamePayload.settings.puzzleConfig = puzzleConfig
      }

      // Ajouter config pour math
      if (gameType === MULTIPLAYER_GAME_TYPES.MATH_DUEL) {
        gamePayload.settings.mathConfig = {
          ...mathConfig,
          questionCount: parseInt(formData.totalQuestions)
        }
      }

      // Ajouter config pour memory
      if (gameType === MULTIPLAYER_GAME_TYPES.MEMORY_MATCH) {
        gamePayload.settings.memoryConfig = memoryConfig
      }

      console.log('📤 Submitting multiplayer game:', gamePayload)

      let response
      if (isEditing && gameData?.id) {
        response = await gamesService.updateGame(gameData.id, gamePayload)
      } else {
        response = await gamesService.createGame(gamePayload)
      }

      if (!response.success) {
        throw new Error(response.message || 'Failed to save game')
      }

      console.log('✅ Game saved successfully:', response.data)
      alert(`✅ Jeu ${isEditing ? 'mis à jour' : 'créé'} avec succès!`)
      navigate('/admin', { state: { activeTab: 'games', gameTypeTab: 'multiplayer' } })
      
    } catch (error) {
      console.error('Error saving game:', error)
      setSubmitError(error.message || 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ==================== RENDER PREVIEW ====================
  const renderGamePreview = () => {
    switch(gameType) {
      case MULTIPLAYER_GAME_TYPES.QUIZ_BUZZER:
        return (
          <div className="preview-section">
            <h3>🔔 Quiz Buzzer Preview</h3>
            <p>Mode: Premier à buzzer gagne</p>
            <p>Questions: {quizQuestions.length} / {formData.totalQuestions}</p>
            <p>Points par réponse: {formData.pointsPerCorrect}</p>
          </div>
        )
      
      case MULTIPLAYER_GAME_TYPES.QUIZ_SPEED:
        return (
          <div className="preview-section">
            <h3>⚡ Quiz Speed Preview</h3>
            <p>Mode: Tous répondent - le plus rapide gagne</p>
            <p>Questions: {quizQuestions.length} / {formData.totalQuestions}</p>
            <p>Temps par question: {formData.timeLimit}s</p>
          </div>
        )
      
      case MULTIPLAYER_GAME_TYPES.PUZZLE_RACE:
        return (
          <div className="preview-section">
            <h3>🧩 Puzzle Race Preview</h3>
            <p>Taille: {puzzleConfig.gridSize}x{puzzleConfig.gridSize} ({puzzleConfig.gridSize * puzzleConfig.gridSize} pièces)</p>
            <p>Aperçu: {puzzleConfig.showPreview ? `${puzzleConfig.previewDuration}s` : 'Non'}</p>
            {puzzleConfig.imageUrl && <p>Image configurée ✓</p>}
          </div>
        )
      
      case MULTIPLAYER_GAME_TYPES.MATH_DUEL:
        return (
          <div className="preview-section">
            <h3>🔢 Math Duel Preview</h3>
            <p>Opérations: {mathConfig.operations.join(', ')}</p>
            <p>Plage: {mathConfig.numberRange.min} - {mathConfig.numberRange.max}</p>
            <p>Questions: {formData.totalQuestions}</p>
          </div>
        )
      
      case MULTIPLAYER_GAME_TYPES.MEMORY_MATCH:
        return (
          <div className="preview-section">
            <h3>🧠 Memory Match Preview</h3>
            <p>Paires: {memoryConfig.pairCount}</p>
            <p>Mode: {memoryConfig.turnBased ? 'Tour par tour' : 'Simultané'}</p>
            {memoryConfig.elements.length > 0 && (
              <div className="memory-elements-preview">
                {memoryConfig.elements.map((el, idx) => (
                  <span key={idx} className="element-preview">{el}</span>
                ))}
              </div>
            )}
          </div>
        )
      
      default:
        return <p>Sélectionnez un type de jeu</p>
    }
  }

  if (loading) {
    return (
      <div className="create-game-page">
        <div className="loading-state">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="create-game-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/admin', { state: { activeTab: 'games', gameTypeTab: 'multiplayer' } })}>
          ← Retour
        </button>
        <h1>{isEditing ? '✏️ Modifier' : '🎮 Créer'} un Jeu Multiplayer</h1>
      </header>

      <main className="create-game-container">
        <form onSubmit={handleSubmit} className="game-form">
          {/* Section 1: Informations de base */}
          <section className="form-section">
            <h2>📋 Informations de Base</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Titre du Jeu *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Quiz de Mathématiques Multiplayer"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre jeu..."
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Catégorie</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Difficulté</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                >
                  <option value={DIFFICULTY_LEVELS.EASY}>Facile</option>
                  <option value={DIFFICULTY_LEVELS.MEDIUM}>Moyen</option>
                  <option value={DIFFICULTY_LEVELS.HARD}>Difficile</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="icon">Icône</label>
                <select
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                >
                  {availableIcons.map(icon => (
                    <option key={icon} value={icon}>{icon} {icon}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minPlayers">Joueurs Min *</label>
                <input
                  type="number"
                  id="minPlayers"
                  name="minPlayers"
                  value={formData.minPlayers}
                  onChange={handleInputChange}
                  min="2"
                  max="20"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxPlayers">Joueurs Max *</label>
                <input
                  type="number"
                  id="maxPlayers"
                  name="maxPlayers"
                  value={formData.maxPlayers}
                  onChange={handleInputChange}
                  min="2"
                  max="20"
                  required
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={formData.enabled}
                    onChange={handleInputChange}
                  />
                  <span>Activé</span>
                </label>
              </div>
            </div>
          </section>

          {/* Section 2: Type de jeu */}
          <section className="form-section">
            <h2>🎯 Type de Jeu</h2>
            
            <div className="game-type-selector">
              <button
                type="button"
                className={`game-type-btn ${gameType === MULTIPLAYER_GAME_TYPES.QUIZ_BUZZER ? 'active' : ''}`}
                onClick={() => handleGameTypeChange(MULTIPLAYER_GAME_TYPES.QUIZ_BUZZER)}
              >
                <span className="game-type-icon">🔔</span>
                <span className="game-type-name">Quiz Buzzer</span>
                <span className="game-type-desc">Premier à buzzer</span>
              </button>

              <button
                type="button"
                className={`game-type-btn ${gameType === MULTIPLAYER_GAME_TYPES.QUIZ_SPEED ? 'active' : ''}`}
                onClick={() => handleGameTypeChange(MULTIPLAYER_GAME_TYPES.QUIZ_SPEED)}
              >
                <span className="game-type-icon">⚡</span>
                <span className="game-type-name">Quiz Speed</span>
                <span className="game-type-desc">Tous répondent</span>
              </button>

              <button
                type="button"
                className={`game-type-btn ${gameType === MULTIPLAYER_GAME_TYPES.PUZZLE_RACE ? 'active' : ''}`}
                onClick={() => handleGameTypeChange(MULTIPLAYER_GAME_TYPES.PUZZLE_RACE)}
              >
                <span className="game-type-icon">🧩</span>
                <span className="game-type-name">Puzzle Race</span>
                <span className="game-type-desc">Course de puzzle</span>
              </button>

              <button
                type="button"
                className={`game-type-btn ${gameType === MULTIPLAYER_GAME_TYPES.MATH_DUEL ? 'active' : ''}`}
                onClick={() => handleGameTypeChange(MULTIPLAYER_GAME_TYPES.MATH_DUEL)}
              >
                <span className="game-type-icon">🔢</span>
                <span className="game-type-name">Math Duel</span>
                <span className="game-type-desc">Duel mathématique</span>
              </button>

              <button
                type="button"
                className={`game-type-btn ${gameType === MULTIPLAYER_GAME_TYPES.MEMORY_MATCH ? 'active' : ''}`}
                onClick={() => handleGameTypeChange(MULTIPLAYER_GAME_TYPES.MEMORY_MATCH)}
              >
                <span className="game-type-icon">🧠</span>
                <span className="game-type-name">Memory Match</span>
                <span className="game-type-desc">Memory compétitif</span>
              </button>
            </div>
          </section>

          {/* Section 3: Configuration du jeu */}
          <section className="form-section">
            <h2>⚙️ Configuration</h2>

            {/* Config commune */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="timeLimit">Temps par Question (s)</label>
                <input
                  type="number"
                  id="timeLimit"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleInputChange}
                  min="5"
                  max="300"
                />
              </div>

              <div className="form-group">
                <label htmlFor="totalQuestions">Questions Totales</label>
                <input
                  type="number"
                  id="totalQuestions"
                  name="totalQuestions"
                  value={formData.totalQuestions}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pointsPerCorrect">Points Bonne Réponse</label>
                <input
                  type="number"
                  id="pointsPerCorrect"
                  name="pointsPerCorrect"
                  value={formData.pointsPerCorrect}
                  onChange={handleInputChange}
                  min="1"
                  max="1000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pointsPerWrong">Points Mauvaise Réponse</label>
                <input
                  type="number"
                  id="pointsPerWrong"
                  name="pointsPerWrong"
                  value={formData.pointsPerWrong}
                  onChange={handleInputChange}
                  max="0"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="timeBonusEnabled"
                    checked={formData.timeBonusEnabled}
                    onChange={handleInputChange}
                  />
                  <span>Bonus de temps</span>
                </label>
              </div>
            </div>

            {/* Config spécifique QUIZ */}
            {(gameType === MULTIPLAYER_GAME_TYPES.QUIZ_BUZZER || gameType === MULTIPLAYER_GAME_TYPES.QUIZ_SPEED) && (
              <div className="quiz-config">
                <div className="section-header">
                  <h3>📝 Questions du Quiz</h3>
                  <button
                    type="button"
                    className="btn-add"
                    onClick={addQuizQuestion}
                    disabled={quizQuestions.length >= formData.totalQuestions}
                  >
                    ➕ Ajouter Question
                  </button>
                </div>

                {quizQuestions.length === 0 && (
                  <p className="empty-state">Aucune question ajoutée. Cliquez sur "Ajouter Question".</p>
                )}

                <div className="questions-list">
                  {quizQuestions.map((q, index) => (
                    <div key={q.id} className="question-card">
                      <div className="question-header">
                        <span className="question-number">Question {index + 1}</span>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => removeQuizQuestion(q.id)}
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="form-group">
                        <label>Question *</label>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateQuizQuestion(q.id, 'question', e.target.value)}
                          placeholder="Écrivez votre question ici..."
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Réponse Correcte *</label>
                        <input
                          type="text"
                          value={q.correctAnswer}
                          onChange={(e) => updateQuizQuestion(q.id, 'correctAnswer', e.target.value)}
                          placeholder="La bonne réponse"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Mauvaises Réponses * (min 2)</label>
                        {[0, 1, 2].map(i => (
                          <input
                            key={i}
                            type="text"
                            value={q.wrongAnswers[i] || ''}
                            onChange={(e) => updateWrongAnswer(q.id, i, e.target.value)}
                            placeholder={`Mauvaise réponse ${i + 1}`}
                          />
                        ))}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Temps (s)</label>
                          <input
                            type="number"
                            value={q.timeLimit}
                            onChange={(e) => updateQuizQuestion(q.id, 'timeLimit', parseInt(e.target.value))}
                            min="5"
                            max="300"
                          />
                        </div>
                        <div className="form-group">
                          <label>Points</label>
                          <input
                            type="number"
                            value={q.points}
                            onChange={(e) => updateQuizQuestion(q.id, 'points', parseInt(e.target.value))}
                            min="1"
                            max="1000"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Config spécifique PUZZLE */}
            {gameType === MULTIPLAYER_GAME_TYPES.PUZZLE_RACE && (
              <div className="puzzle-config">
                <h3>🧩 Configuration Puzzle</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="puzzleGridSize">Taille Grille</label>
                    <select
                      id="puzzleGridSize"
                      value={puzzleConfig.gridSize}
                      onChange={(e) => setPuzzleConfig({...puzzleConfig, gridSize: parseInt(e.target.value)})}
                    >
                      <option value="3">3x3 (9 pièces)</option>
                      <option value="4">4x4 (16 pièces)</option>
                      <option value="5">5x5 (25 pièces)</option>
                      <option value="6">6x6 (36 pièces)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="shuffleType">Type Mélange</label>
                    <select
                      id="shuffleType"
                      value={puzzleConfig.shuffleType}
                      onChange={(e) => setPuzzleConfig({...puzzleConfig, shuffleType: e.target.value})}
                    >
                      <option value="random">Aléatoire</option>
                      <option value="ordered">Ordonné</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="puzzleImageUrl">URL de l'Image *</label>
                  <input
                    type="url"
                    id="puzzleImageUrl"
                    value={puzzleConfig.imageUrl}
                    onChange={(e) => setPuzzleConfig({...puzzleConfig, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  <small>Utilisez une image carrée pour de meilleurs résultats</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={puzzleConfig.showPreview}
                        onChange={(e) => setPuzzleConfig({...puzzleConfig, showPreview: e.target.checked})}
                      />
                      <span>Afficher l'aperçu</span>
                    </label>
                  </div>

                  {puzzleConfig.showPreview && (
                    <div className="form-group">
                      <label htmlFor="previewDuration">Durée Aperçu (s)</label>
                      <input
                        type="number"
                        id="previewDuration"
                        value={puzzleConfig.previewDuration}
                        onChange={(e) => setPuzzleConfig({...puzzleConfig, previewDuration: parseInt(e.target.value)})}
                        min="3"
                        max="30"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Config spécifique MATH */}
            {gameType === MULTIPLAYER_GAME_TYPES.MATH_DUEL && (
              <div className="math-config">
                <h3>🔢 Configuration Math</h3>
                
                <div className="form-group">
                  <label>Opérations</label>
                  <div className="checkbox-group">
                    {['+', '-', '×', '÷'].map(op => (
                      <label key={op} className="checkbox-label inline">
                        <input
                          type="checkbox"
                          checked={mathConfig.operations.includes(op)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMathConfig({...mathConfig, operations: [...mathConfig.operations, op]})
                            } else {
                              setMathConfig({...mathConfig, operations: mathConfig.operations.filter(o => o !== op)})
                            }
                          }}
                        />
                        <span>{op}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="mathMin">Nombre Min</label>
                    <input
                      type="number"
                      id="mathMin"
                      value={mathConfig.numberRange.min}
                      onChange={(e) => setMathConfig({
                        ...mathConfig,
                        numberRange: {...mathConfig.numberRange, min: parseInt(e.target.value)}
                      })}
                      min="1"
                      max="999"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="mathMax">Nombre Max</label>
                    <input
                      type="number"
                      id="mathMax"
                      value={mathConfig.numberRange.max}
                      onChange={(e) => setMathConfig({
                        ...mathConfig,
                        numberRange: {...mathConfig.numberRange, max: parseInt(e.target.value)}
                      })}
                      min="1"
                      max="999"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Config spécifique MEMORY */}
            {gameType === MULTIPLAYER_GAME_TYPES.MEMORY_MATCH && (
              <div className="memory-config">
                <h3>🧠 Configuration Memory</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="memoryPairCount">Nombre de Paires</label>
                    <input
                      type="number"
                      id="memoryPairCount"
                      value={memoryConfig.pairCount}
                      onChange={(e) => setMemoryConfig({...memoryConfig, pairCount: parseInt(e.target.value)})}
                      min="4"
                      max="20"
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={memoryConfig.turnBased}
                        onChange={(e) => setMemoryConfig({...memoryConfig, turnBased: e.target.checked})}
                      />
                      <span>Tour par tour</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Catégorie d'Éléments</label>
                  <div className="memory-categories">
                    {Object.keys(elementCollections.emoji).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        className={`category-btn ${memoryConfig.category === cat ? 'active' : ''}`}
                        onClick={() => selectMemoryElements(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {memoryConfig.elements.length > 0 && (
                  <div className="memory-preview">
                    <p><strong>Éléments sélectionnés:</strong></p>
                    <div className="elements-grid">
                      {memoryConfig.elements.map((el, idx) => (
                        <span key={idx} className="element-item">{el}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Preview */}
          {renderGamePreview()}

          {/* Submit */}
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={() => navigate('/admin', { state: { activeTab: 'games', gameTypeTab: 'multiplayer' } })} 
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting 
                ? `⏳ ${isEditing ? 'Mise à jour...' : 'Création...'}`
                : `🚀 ${isEditing ? 'Mettre à jour' : 'Créer le Jeu'}`
              }
            </button>
          </div>
          
          {submitError && (
            <div className="error-message" style={{color: 'red', marginTop: '10px'}}>
              ❌ {submitError}
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
