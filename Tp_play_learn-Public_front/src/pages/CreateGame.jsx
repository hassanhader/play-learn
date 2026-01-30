import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GAME_TYPES, DIFFICULTY_LEVELS, CATEGORIES } from '../games/gameConfig'
import gamesService from '../services/gamesService'
import '../styles/create-game.css'

export default function CreateGame() {
  const navigate = useNavigate()
  const location = useLocation()
  const editGameId = location.state?.editGameId
  const isEditing = !!editGameId
  
  const [loading, setLoading] = useState(isEditing)
  const [gameData, setGameData] = useState(null) // Stocke les données complètes du jeu
  
  // États du formulaire
  const [gameType, setGameType] = useState(GAME_TYPES.QUIZ)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    description: '',
    icon: '🎮',
    timeLimit: 180,
    totalQuestions: 5,
    enabled: true
  })

  // États spécifiques aux types de jeux
  const [quizQuestions, setQuizQuestions] = useState([])
  const [memoryConfig, setMemoryConfig] = useState({
    pairCount: 8,
    elementType: 'emoji',
    elements: []
  })
  const [mathConfig, setMathConfig] = useState({
    operations: ['+', '-', '×', '÷'],
    numberRange: { min: 1, max: 100 },
    questionCount: 10
  })
  const [puzzleConfig, setPuzzleConfig] = useState({
    gridSize: 3,
    imageUrl: null,
    timeBonus: true
  })
  const [codingConfig, setCodingConfig] = useState({
    language: 'JavaScript',
    codeBlocks: []
  })
  const [currentCodeBlock, setCurrentCodeBlock] = useState({
    title: '',
    description: '',
    blocks: [],
    fixedBlocks: []
  })
  const [codeBlockInput, setCodeBlockInput] = useState({
    code: '',
    order: 0,
    fixed: false
  })

  // Collections d'éléments disponibles
  const elementCollections = {
    emoji: {
      math: ['➕', '➖', '✖️', '➗', '🟰', '📐', '📊', '🧮', '💯', '🔢', '🔣', '📈'],
      animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
      fruits: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍'],
      flags: ['🇺🇸', '🇨🇦', '🇬🇧', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇯🇵', '🇨🇳', '🇧🇷', '🇲🇽', '🇦🇺'],
      weather: ['☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '❄️', '🌨️', '💨'],
      sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🏒', '⛳', '🥊', '🎱']
    },
    icons: {
      shapes: ['●', '■', '▲', '◆', '★', '▼', '◀', '▶', '♠', '♥', '♦', '♣'],
      arrows: ['←', '→', '↑', '↓', '↖', '↗', '↘', '↙', '⇐', '⇒', '⇑', '⇓'],
      math: ['+', '-', '×', '÷', '=', '≠', '<', '>', '≤', '≥', '∞', '√'],
      greek: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'λ', 'μ', 'π', 'σ']
    },
    zodiac: ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'],
    planets: ['☿', '♀', '♁', '♂', '♃', '♄', '♅', '♆', '♇'],
    music: ['♩', '♪', '♫', '♬', '♭', '♮', '♯', '𝄞', '𝄢', '𝄡']
  }

  // Liste d'icônes disponibles pour les jeux
  const availableIcons = ['🎮', '🎯', '🧠', '💡', '⚡', '🔥', '🎲', '🎪', '🎭', '🎨', '📚', '🔬', '🧪', '🌍', '🚀', '💻', '🤖', '🧮', '📊', '🎓']

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
        
        // Stocker les données complètes du jeu
        setGameData(game)
        
        // Remplir le formulaire avec les données du jeu
        setFormData({
          title: game.title || '',
          category: game.category || CATEGORIES[0],
          difficulty: game.difficulty || DIFFICULTY_LEVELS.MEDIUM,
          description: game.description || '',
          icon: game.icon || '🎮',
          timeLimit: game.timeLimit || 180,
          totalQuestions: game.settings?.totalQuestions || 5,
          enabled: game.isEnabled !== false
        })
        
        // Charger les questions si c'est un quiz
        if (game.questions && game.questions.length > 0) {
          setGameType(GAME_TYPES.QUIZ)
          setQuizQuestions(game.questions.map(q => ({
            question: q.questionText || '',
            correctAnswer: q.correctAnswer || '',
            wrongAnswers: [
              q.wrongAnswer1 || '',
              q.wrongAnswer2 || '',
              q.wrongAnswer3 || ''
            ].filter(a => a)
          })))
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
    
    // Synchroniser totalQuestions avec mathConfig pour les jeux de math
    if (name === 'totalQuestions' && gameType === GAME_TYPES.MATH) {
      setMathConfig(prev => ({
        ...prev,
        questionCount: parseInt(newValue) || 1
      }))
    }
  }

  const handleGameTypeChange = (type) => {
    setGameType(type)
    // Réinitialiser les configs spécifiques
    if (type === GAME_TYPES.MEMORY) {
      setMemoryConfig({
        pairCount: 8,
        elementType: 'emoji',
        elements: []
      })
    }
    // Synchroniser mathConfig avec totalQuestions
    if (type === GAME_TYPES.MATH) {
      setMathConfig({
        ...mathConfig,
        questionCount: formData.totalQuestions
      })
    }
  }

  // Ajouter une question de quiz
  const addQuizQuestion = () => {
    // Vérifier qu'on ne dépasse pas totalQuestions
    if (quizQuestions.length >= formData.totalQuestions) {
      alert(`Vous avez atteint le nombre maximum de questions (${formData.totalQuestions}). Augmentez "Total Questions" pour en ajouter plus.`)
      return
    }
    
    setQuizQuestions([...quizQuestions, {
      id: Date.now(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }])
  }

  const updateQuizQuestion = (id, field, value) => {
    setQuizQuestions(quizQuestions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const updateQuizOption = (questionId, optionIndex, value) => {
    setQuizQuestions(quizQuestions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options]
        newOptions[optionIndex] = value
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const removeQuizQuestion = (id) => {
    setQuizQuestions(quizQuestions.filter(q => q.id !== id))
  }

  // Sélectionner des éléments pour Memory
  const selectMemoryElements = (category, subcategory) => {
    const elements = subcategory 
      ? elementCollections[category][subcategory]
      : elementCollections[category]
    
    // Sélectionner aléatoirement selon pairCount
    const shuffled = [...elements].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, memoryConfig.pairCount)
    
    setMemoryConfig(prev => ({
      ...prev,
      elements: selected
    }))
  }

  // Générer l'aperçu du jeu
  const renderGamePreview = () => {
    switch(gameType) {
      case GAME_TYPES.QUIZ:
        return (
          <div className="preview-section">
            <h3>📝 Quiz Preview</h3>
            <p>Total Questions: {quizQuestions.length}</p>
            {quizQuestions.length === 0 && (
              <p className="empty-state">No questions added yet. Click "Add Question" to start.</p>
            )}
          </div>
        )
      
      case GAME_TYPES.MEMORY:
        return (
          <div className="preview-section">
            <h3>🧠 Memory Game Preview</h3>
            <p>Pairs: {memoryConfig.pairCount}</p>
            <p>Element Type: {memoryConfig.elementType}</p>
            {memoryConfig.elements.length > 0 && (
              <div className="memory-elements-preview">
                {memoryConfig.elements.map((el, idx) => (
                  <span key={idx} className="element-preview">{el}</span>
                ))}
              </div>
            )}
          </div>
        )
      
      case GAME_TYPES.MATH:
        return (
          <div className="preview-section">
            <h3>⚡ Math Game Preview</h3>
            <p>Operations: {mathConfig.operations.join(', ')}</p>
            <p>Number Range: {mathConfig.numberRange.min} - {mathConfig.numberRange.max}</p>
            <p>Questions: {mathConfig.questionCount}</p>
          </div>
        )
      
      default:
        return <p>Select a game type to see preview</p>
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Construire l'objet du jeu avec structure compatible backend
      const gamePayload = {
        gameId: gameData?.gameId || `custom-${Date.now()}`, // Garder l'ID existant ou créer nouveau
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        type: gameType,
        icon: formData.icon || '🎮',
        timeLimit: parseInt(formData.timeLimit),
        isEnabled: formData.enabled !== false,
        isMultiplayer: false,
        minPlayers: 1,
        maxPlayers: 1,
        settings: {
          totalQuestions: parseInt(formData.totalQuestions),
          questions: gameType === GAME_TYPES.QUIZ ? quizQuestions : null,
          memoryConfig: gameType === GAME_TYPES.MEMORY ? memoryConfig : null,
          mathConfig: gameType === GAME_TYPES.MATH ? {
            ...mathConfig,
            questionCount: parseInt(formData.totalQuestions) // Utiliser totalQuestions comme source de vérité
          } : null,
          puzzleConfig: gameType === GAME_TYPES.PUZZLE ? puzzleConfig : null,
          codingConfig: gameType === GAME_TYPES.CODING ? codingConfig : null
        }
      }

      // Envoyer au backend via API
      console.log(isEditing ? '✏️ Updating game:' : '📤 Creating single-player game:', gamePayload)
      const response = isEditing 
        ? await gamesService.updateGame(gameData.id, gamePayload)
        : await gamesService.createGame(gamePayload)
      
      console.log('✅ API response:', response)
      
      if (response.success) {
        alert(isEditing ? 'Game updated successfully! ✅' : 'Game created successfully! ✅')
        // Rediriger vers l'admin si l'utilisateur est admin
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.isAdmin) {
          navigate('/admin', { state: { activeTab: 'games' } })
        } else {
          navigate('/single')
        }
      } else {
        setSubmitError(response.message || `Failed to ${isEditing ? 'update' : 'create'} game`)
        alert(`Error: ${response.message || `Failed to ${isEditing ? 'update' : 'create'} game`}`)
      }
    } catch (error) {
      console.error(`❌ Error ${isEditing ? 'updating' : 'creating'} game:`, error)
      setSubmitError(error.message)
      alert(`Failed to ${isEditing ? 'update' : 'create'} game: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Afficher un indicateur de chargement si on charge les données
  if (loading) {
    return (
      <div className="create-game-wrap">
        <header className="create-header">
          <button className="back-btn" onClick={() => navigate('/admin', { state: { activeTab: 'games' } })}>
            ← Back
          </button>
          <h1>🎮 Loading Game Data...</h1>
        </header>
        <main className="create-main">
          <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: 'var(--muted)' }}>
            <div style={{ marginBottom: '20px' }}>⏳ Loading game information...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="create-game-wrap">
      <header className="create-header">
        <button className="back-btn" onClick={() => navigate('/admin', { state: { activeTab: 'games' } })}>
          ← Back
        </button>
        <h1>🎮 {isEditing ? 'Edit Game' : 'Create New Game'}</h1>
      </header>

      <main className="create-main">
        <form onSubmit={handleSubmit} className="create-form">
          
          {/* Section 1: Basic Information */}
          <section className="form-section">
            <h2>📋 Basic Information</h2>
            
            <div className="form-group">
              <label>Game Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter game title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your game..."
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Icon</label>
                <div className="icon-selector">
                  {availableIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                      onClick={() => setFormData({...formData, icon})}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Difficulty *</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  required
                >
                  {Object.values(DIFFICULTY_LEVELS).map(diff => (
                    <option key={diff} value={diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Time Limit (seconds)</label>
                <input
                  type="number"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleInputChange}
                  min="20"
                  max="600"
                />
              </div>

              {/* Show Total Questions only for Quiz and Math games */}
              {(gameType === GAME_TYPES.QUIZ || gameType === GAME_TYPES.MATH) && (
                <div className="form-group">
                  <label>Total Questions</label>
                  <input
                    type="number"
                    name="totalQuestions"
                    value={formData.totalQuestions}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Game Type Selection */}
          <section className="form-section">
            <h2>🎯 Game Type</h2>
            <div className="game-type-selector">
              {Object.entries(GAME_TYPES).map(([, value]) => (
                <button
                  key={value}
                  type="button"
                  className={`type-btn ${gameType === value ? 'active' : ''}`}
                  onClick={() => handleGameTypeChange(value)}
                >
                  {value === GAME_TYPES.QUIZ && '📝 Quiz'}
                  {value === GAME_TYPES.MEMORY && '🧠 Memory'}
                  {value === GAME_TYPES.MATH && '⚡ Math'}
                  {value === GAME_TYPES.PUZZLE && '🧩 Puzzle'}
                  {value === GAME_TYPES.CODING && '💻 Coding'}
                </button>
              ))}
            </div>
          </section>

          {/* Section 3: Type-Specific Configuration */}
          <section className="form-section config-section">
            <h2>⚙️ Game Configuration</h2>
            
            {/* QUIZ Configuration */}
            {gameType === GAME_TYPES.QUIZ && (
              <div className="quiz-config">
                <div className="config-header">
                  <h3>Quiz Questions</h3>
                  <button
                    type="button"
                    className="add-btn"
                    onClick={addQuizQuestion}
                  >
                    + Add Question
                  </button>
                </div>

                {quizQuestions.map((question, qIdx) => (
                  <div key={question.id} className="question-card">
                    <div className="question-header">
                      <span className="question-number">Question {qIdx + 1}</span>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeQuizQuestion(question.id)}
                      >
                        ✕
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Enter your question"
                      value={question.question}
                      onChange={(e) => updateQuizQuestion(question.id, 'question', e.target.value)}
                      className="question-input"
                    />

                    <div className="options-grid">
                      {question.options.map((option, optIdx) => (
                        <div key={optIdx} className="option-item">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === optIdx}
                            onChange={() => updateQuizQuestion(question.id, 'correctAnswer', optIdx)}
                          />
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            value={option}
                            onChange={(e) => updateQuizOption(question.id, optIdx, e.target.value)}
                            className="option-input"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MEMORY Configuration */}
            {gameType === GAME_TYPES.MEMORY && (
              <div className="memory-config">
                <div className="form-group">
                  <label>Number of Pairs (must be even)</label>
                  <input
                    type="number"
                    value={memoryConfig.pairCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      if (value % 2 === 0 && value >= 4 && value <= 50) {
                        setMemoryConfig({...memoryConfig, pairCount: value})
                      }
                    }}
                    min="4"
                    max="50"
                    step="2"
                  />
                </div>

                <div className="form-group">
                  <label>Element Type</label>
                  <select
                    value={memoryConfig.elementType}
                    onChange={(e) => setMemoryConfig({...memoryConfig, elementType: e.target.value, elements: []})}
                  >
                    <option value="emoji">Emoji</option>
                    <option value="icons">Icons/Symbols</option>
                    <option value="zodiac">Zodiac Signs</option>
                    <option value="planets">Planets</option>
                    <option value="music">Music Symbols</option>
                  </select>
                </div>

                {/* Emoji subcategories */}
                {memoryConfig.elementType === 'emoji' && (
                  <div className="element-selector">
                    <label>Choose Collection</label>
                    <div className="collection-grid">
                      {Object.keys(elementCollections.emoji).map(subcat => (
                        <button
                          key={subcat}
                          type="button"
                          className="collection-btn"
                          onClick={() => selectMemoryElements('emoji', subcat)}
                        >
                          {subcat.charAt(0).toUpperCase() + subcat.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Icons subcategories */}
                {memoryConfig.elementType === 'icons' && (
                  <div className="element-selector">
                    <label>Choose Collection</label>
                    <div className="collection-grid">
                      {Object.keys(elementCollections.icons).map(subcat => (
                        <button
                          key={subcat}
                          type="button"
                          className="collection-btn"
                          onClick={() => selectMemoryElements('icons', subcat)}
                        >
                          {subcat.charAt(0).toUpperCase() + subcat.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct selection for single arrays */}
                {['zodiac', 'planets', 'music'].includes(memoryConfig.elementType) && (
                  <button
                    type="button"
                    className="generate-btn"
                    onClick={() => selectMemoryElements(memoryConfig.elementType)}
                  >
                    Generate Random Selection
                  </button>
                )}
              </div>
            )}

            {/* MATH Configuration */}
            {gameType === GAME_TYPES.MATH && (
              <div className="math-config">
                <div className="form-group">
                  <label>Operations</label>
                  <div className="operations-selector">
                    {['+', '-', '×', '÷'].map(op => (
                      <label key={op} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={mathConfig.operations.includes(op)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMathConfig({
                                ...mathConfig,
                                operations: [...mathConfig.operations, op]
                              })
                            } else {
                              setMathConfig({
                                ...mathConfig,
                                operations: mathConfig.operations.filter(o => o !== op)
                              })
                            }
                          }}
                        />
                        <span className="operation-symbol">{op}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Min Number</label>
                    <input
                      type="number"
                      value={mathConfig.numberRange.min}
                      onChange={(e) => setMathConfig({
                        ...mathConfig,
                        numberRange: { ...mathConfig.numberRange, min: parseInt(e.target.value) }
                      })}
                      min="1"
                      max="999"
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Number</label>
                    <input
                      type="number"
                      value={mathConfig.numberRange.max}
                      onChange={(e) => setMathConfig({
                        ...mathConfig,
                        numberRange: { ...mathConfig.numberRange, max: parseInt(e.target.value) }
                      })}
                      min="10"
                      max="9999"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Number of Questions</label>
                  <div style={{ padding: '10px', background: 'var(--pill)', borderRadius: '8px', color: 'var(--muted)' }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      🔢 Questions: <strong>{formData.totalQuestions}</strong>
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                      Modifiez le champ "Total Questions" ci-dessus pour changer ce nombre
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PUZZLE Configuration */}
            {gameType === GAME_TYPES.PUZZLE && (
              <div className="puzzle-config">
                <div className="form-group">
                  <label>Grid Size (NxN)</label>
                  <select
                    value={puzzleConfig.gridSize}
                    onChange={(e) => setPuzzleConfig({...puzzleConfig, gridSize: parseInt(e.target.value)})}
                  >
                    <option value="3">3x3 (Easy - 9 pieces)</option>
                    <option value="4">4x4 (Medium - 16 pieces)</option>
                    <option value="5">5x5 (Hard - 25 pieces)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={puzzleConfig.timeBonus}
                      onChange={(e) => setPuzzleConfig({...puzzleConfig, timeBonus: e.target.checked})}
                    />
                    <span>Apply time bonus to score</span>
                  </label>
                </div>

                <div className="info-box">
                  <p>🧩 Players will arrange numbered pieces in order</p>
                  <p>⚡ Score is based on number of moves (fewer = better)</p>
                </div>
              </div>
            )}

            {/* CODING Configuration */}
            {gameType === GAME_TYPES.CODING && (
              <div className="coding-config">
                <div className="form-group">
                  <label>Programming Language</label>
                  <select
                    value={codingConfig.language}
                    onChange={(e) => setCodingConfig({...codingConfig, language: e.target.value})}
                  >
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="PHP">PHP</option>
                  </select>
                </div>

                {/* Add Code Challenge Section */}
                <div className="code-challenge-section">
                  <h4>Add Code Challenge</h4>
                  
                  <div className="form-group">
                    <label>Challenge Title</label>
                    <input
                      type="text"
                      value={currentCodeBlock.title}
                      onChange={(e) => setCurrentCodeBlock({...currentCodeBlock, title: e.target.value})}
                      placeholder="e.g., Build a For Loop"
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={currentCodeBlock.description}
                      onChange={(e) => setCurrentCodeBlock({...currentCodeBlock, description: e.target.value})}
                      placeholder="Explain what code needs to be built..."
                      rows="3"
                    />
                  </div>

                  {/* Add Code Block */}
                  <div className="code-block-builder">
                    <h5>Code Blocks</h5>
                    <div className="form-row">
                      <div className="form-group" style={{flex: 2}}>
                        <label>Code Line</label>
                        <input
                          type="text"
                          value={codeBlockInput.code}
                          onChange={(e) => setCodeBlockInput({...codeBlockInput, code: e.target.value})}
                          placeholder="e.g., for (let i = 0; i < 10; i++) {"
                        />
                      </div>
                      <div className="form-group" style={{flex: 1}}>
                        <label>Order</label>
                        <input
                          type="number"
                          value={codeBlockInput.order}
                          onChange={(e) => setCodeBlockInput({...codeBlockInput, order: parseInt(e.target.value)})}
                          min="0"
                        />
                      </div>
                      <div className="form-group" style={{flex: 1}}>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={codeBlockInput.fixed}
                            onChange={(e) => setCodeBlockInput({...codeBlockInput, fixed: e.target.checked})}
                          />
                          <span>Fixed</span>
                        </label>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      className="btn-add-block"
                      onClick={() => {
                        if (codeBlockInput.code.trim()) {
                          const newBlock = {
                            id: Date.now(),
                            code: codeBlockInput.code,
                            order: codeBlockInput.order,
                            fixed: codeBlockInput.fixed
                          }
                          setCurrentCodeBlock({
                            ...currentCodeBlock,
                            blocks: [...currentCodeBlock.blocks, newBlock]
                          })
                          setCodeBlockInput({code: '', order: currentCodeBlock.blocks.length + 1, fixed: false})
                        }
                      }}
                    >
                      + Add Block
                    </button>

                    {/* Display added blocks */}
                    {currentCodeBlock.blocks.length > 0 && (
                      <div className="blocks-preview">
                        <p><strong>Blocks ({currentCodeBlock.blocks.length}):</strong></p>
                        <div className="blocks-list">
                          {currentCodeBlock.blocks
                            .sort((a, b) => a.order - b.order)
                            .map((block) => (
                              <div key={block.id} className="block-item">
                                <span className="block-order">{block.order}</span>
                                <code className="block-code">{block.code}</code>
                                {block.fixed && <span className="block-fixed">🔒</span>}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCurrentCodeBlock({
                                      ...currentCodeBlock,
                                      blocks: currentCodeBlock.blocks.filter(b => b.id !== block.id)
                                    })
                                  }}
                                  className="btn-remove"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn-save-challenge"
                    onClick={() => {
                      if (currentCodeBlock.title && currentCodeBlock.blocks.length > 0) {
                        setCodingConfig({
                          ...codingConfig,
                          codeBlocks: [...codingConfig.codeBlocks, {...currentCodeBlock}]
                        })
                        setCurrentCodeBlock({
                          title: '',
                          description: '',
                          blocks: [],
                          fixedBlocks: []
                        })
                        setCodeBlockInput({code: '', order: 0, fixed: false})
                      }
                    }}
                    disabled={!currentCodeBlock.title || currentCodeBlock.blocks.length === 0}
                  >
                    💾 Save Challenge
                  </button>

                  {/* Display saved challenges */}
                  {codingConfig.codeBlocks.length > 0 && (
                    <div className="saved-challenges">
                      <h5>Saved Challenges ({codingConfig.codeBlocks.length})</h5>
                      {codingConfig.codeBlocks.map((challenge, index) => (
                        <div key={index} className="challenge-card">
                          <div className="challenge-header">
                            <strong>{challenge.title}</strong>
                            <button
                              type="button"
                              onClick={() => {
                                setCodingConfig({
                                  ...codingConfig,
                                  codeBlocks: codingConfig.codeBlocks.filter((_, i) => i !== index)
                                })
                              }}
                              className="btn-delete-challenge"
                            >
                              🗑️
                            </button>
                          </div>
                          <p className="challenge-desc">{challenge.description}</p>
                          <p className="challenge-meta">
                            {challenge.blocks.length} blocks • 
                            {challenge.blocks.filter(b => b.fixed).length} fixed
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preview */}
            {renderGamePreview()}
          </section>

          {/* Submit */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate('/admin', { state: { activeTab: 'games' } })} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting 
                ? `⏳ ${isEditing ? 'Updating...' : 'Creating...'}`
                : `🚀 ${isEditing ? 'Update Game' : 'Create Game'}`
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
