import React, { useState, useEffect } from 'react'
import './CodingGame.css'

/**
 * Jeu de Coding - Reconstruire du code en réorganisant les blocs
 * Le joueur doit glisser-déposer les blocs de code dans le bon ordre
 */
export default function CodingGame({ 
  gameConfig, 
  onAnswer, 
  addScore, 
  endGame,
  updateMetadata 
}) {
  const codingConfig = gameConfig.codingConfig || {
    language: 'JavaScript',
    codeBlocks: [],
    fixedBlocks: [] // Blocs déjà placés pour aider
  }

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [availableBlocks, setAvailableBlocks] = useState([])
  const [slots, setSlots] = useState([]) // Array de slots avec {slotIndex, block: null ou block}
  const [draggedBlock, setDraggedBlock] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)

  const questions = codingConfig.codeBlocks || []
  const currentQuestion = questions[currentQuestionIndex]

  // Initialiser les blocs pour la question actuelle
  useEffect(() => {
    if (currentQuestion) {
      initializeQuestion()
    }
  }, [currentQuestionIndex])

  const initializeQuestion = () => {
    if (!currentQuestion) return

    // Blocs à placer (mélangés)
    const shuffled = shuffleArray([...currentQuestion.blocks])
    setAvailableBlocks(shuffled)
    
    // Créer des slots vides (nombre de blocs)
    const totalBlocks = currentQuestion.blocks.length
    const emptySlots = Array.from({ length: totalBlocks }, (_, i) => ({
      slotIndex: i,
      block: null
    }))
    setSlots(emptySlots)
    
    setFeedback(null)
  }

  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handleDragStart = (e, block, source, sourceSlotIndex = null) => {
    setDraggedBlock({ block, source, sourceSlotIndex })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropInSlot = (e, slotIndex) => {
    e.preventDefault()
    if (!draggedBlock) return

    const { block, source, sourceSlotIndex } = draggedBlock
    const newSlots = [...slots]

    if (source === 'available') {
      // Placer depuis les blocs disponibles
      newSlots[slotIndex] = { slotIndex, block }
      setSlots(newSlots)
      
      const newAvailable = availableBlocks.filter(b => b.id !== block.id)
      setAvailableBlocks(newAvailable)
    } else if (source === 'slot') {
      // Déplacer d'un slot à un autre
      if (sourceSlotIndex !== slotIndex) {
        // Échanger les blocs
        const sourceBlock = newSlots[sourceSlotIndex].block
        const targetBlock = newSlots[slotIndex].block
        
        newSlots[slotIndex] = { slotIndex, block: sourceBlock }
        newSlots[sourceSlotIndex] = { slotIndex: sourceSlotIndex, block: targetBlock }
        
        setSlots(newSlots)
      }
    }

    setDraggedBlock(null)
  }

  const handleDropInAvailable = (e, targetIndex = null) => {
    e.preventDefault()
    if (!draggedBlock) return

    const { block, source } = draggedBlock

    if (source === 'placed') {
      // Retirer de la zone de placement
      const newPlaced = placedBlocks.filter(b => b.id !== block.id)
      setPlacedBlocks(newPlaced)
      
      const newAvailable = [...availableBlocks, block]
      setAvailableBlocks(newAvailable)
    } else if (source === 'available') {
      // Réorganiser dans la zone disponible
      const currentIndex = availableBlocks.findIndex(b => b.id === block.id)
      if (targetIndex !== null && currentIndex !== targetIndex) {
        const newAvailable = [...availableBlocks]
        newAvailable.splice(currentIndex, 1)
        newAvailable.splice(targetIndex, 0, block)
        setAvailableBlocks(newAvailable)
      }
    }

    setDraggedBlock(null)
  }

  const removeBlockFromSlot = (slotIndex) => {
    const newSlots = [...slots]
    const block = newSlots[slotIndex].block
    if (!block) return

    newSlots[slotIndex] = { slotIndex, block: null }
    setSlots(newSlots)
    
    const newAvailable = [...availableBlocks, block]
    setAvailableBlocks(newAvailable)
  }

  const checkSolution = () => {
    setAttempts(attempts + 1)

    // Vérifier si tous les slots sont remplis
    const emptySlots = slots.filter(slot => slot.block === null)
    if (emptySlots.length > 0) {
      setFeedback({
        isCorrect: false,
        message: `⚠️ ${emptySlots.length} slot(s) still empty!`
      })
      return
    }

    // Vérifier l'ordre des blocs
    const isCorrect = slots.every(
      (slot) => slot.block && slot.block.order === slot.slotIndex
    )

    if (isCorrect) {
      const baseScore = 20
      const attemptPenalty = Math.max(0, (attempts - 1) * 3)
      const score = Math.max(5, baseScore - attemptPenalty)
      
      addScore(score)
      setCorrectAnswers(correctAnswers + 1)
      setQuestionsAnswered(questionsAnswered + 1)

      setFeedback({
        isCorrect: true,
        message: `✅ Correct! +${score} points`
      })

      // Mettre à jour les métadonnées
      if (updateMetadata) {
        updateMetadata({
          questionsAnswered: questionsAnswered + 1,
          correctAnswers: correctAnswers + 1,
          attempts: attempts
        })
      }

      // Passer à la question suivante
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setAttempts(0)
        } else {
          // Fin du jeu
          setTimeout(() => {
            onAnswer({
              isCorrect: true,
              message: `Game completed! ${correctAnswers + 1}/${questions.length} correct`,
              score: score
            })
            endGame()
          }, 1000)
        }
      }, 1500)
    } else {
      setFeedback({
        isCorrect: false,
        message: '❌ Incorrect order. Try again!'
      })
    }
  }

  const resetQuestion = () => {
    initializeQuestion()
    setAttempts(0)
  }

  if (!currentQuestion) {
    return (
      <div className="coding-game-empty">
        <p>No coding challenges available</p>
      </div>
    )
  }

  return (
    <div className="coding-game">
      <div className="coding-header">
        <div className="coding-info">
          <span className="language-badge">💻 {codingConfig.language}</span>
          <span className="progress-badge">
            📝 Question {currentQuestionIndex + 1}/{questions.length}
          </span>
          <span className="attempts-badge">🎯 Attempts: {attempts}</span>
        </div>
      </div>

      <div className="coding-question">
        <h3>{currentQuestion.title}</h3>
        <p>{currentQuestion.description}</p>
      </div>

      {/* Zone de construction du code avec slots */}
      <div className="code-builder">
        <div className="builder-header">
          <span>🔨 Build Your Code</span>
          <button onClick={resetQuestion} className="btn-reset-small">
            🔄 Reset
          </button>
        </div>
        
        <div className="code-builder-container">
          <div className="code-slots-grid">
            {slots.map((slot) => (
              <div
                key={slot.slotIndex}
                className={`code-slot ${slot.block ? 'filled' : 'empty'}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropInSlot(e, slot.slotIndex)}
              >
                {/* Numéro du slot */}
                <div className="slot-number">{slot.slotIndex + 1}</div>
                
                {slot.block ? (
                  /* Bloc placé */
                  <div
                    className="code-block slot-filled"
                    draggable
                    onDragStart={(e) => handleDragStart(e, slot.block, 'slot', slot.slotIndex)}
                  >
                    <div className="block-grip">⋮⋮</div>
                    <span className="block-code">{slot.block.code}</span>
                    <button
                      className="btn-remove-block"
                      onClick={() => removeBlockFromSlot(slot.slotIndex)}
                      title="Remove block"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  /* Slot vide */
                  <div className="slot-placeholder">
                    <span className="slot-icon">📦</span>
                    <span className="slot-text">Drop block here</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blocs disponibles */}
      <div className="available-blocks">
        <div className="blocks-header">
          <span>📦 Available Blocks ({availableBlocks.length})</span>
          <span className="blocks-hint">💡 Drag to reorder or move to code builder</span>
        </div>
        
        <div className="blocks-container">
          {availableBlocks.map((block, index) => (
            <React.Fragment key={block.id}>
              <div
                className="code-block available"
                draggable
                onDragStart={(e) => handleDragStart(e, block, 'available')}
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  e.stopPropagation()
                  handleDropInAvailable(e, index)
                }}
              >
                <div className="block-grip-small">⋮⋮</div>
                <span className="block-code">{block.code}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`coding-feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
          {feedback.message}
        </div>
      )}

      {/* Actions */}
      <div className="coding-actions">
        <button 
          onClick={checkSolution}
          className="btn-check-solution"
          disabled={slots.some(slot => slot.block === null)}
        >
          ✓ Check Solution
        </button>
        <button onClick={resetQuestion} className="btn-reset">
          🔄 Reset
        </button>
      </div>
    </div>
  )
}
