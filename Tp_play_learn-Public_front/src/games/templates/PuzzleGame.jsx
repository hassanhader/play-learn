import React, { useState, useEffect } from 'react'
import './PuzzleGame.css'

/**
 * Jeu de Puzzle - Reconstituer une image en réorganisant les pièces
 * Le joueur doit glisser-déposer les pièces mélangées pour recréer l'image originale
 */
export default function PuzzleGame({ 
  gameConfig, 
  onAnswer, 
  addScore, 
  endGame,
  updateMetadata 
}) {
  const puzzleConfig = gameConfig.puzzleConfig || {
    gridSize: 3, // Grille 3x3 par défaut
    imageUrl: null,
    timeBonus: true
  }

  const [pieces, setPieces] = useState([])
  const [solvedPieces, setSolvedPieces] = useState([])
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [moves, setMoves] = useState(0)
  const [completed, setCompleted] = useState(false)

  // Initialiser les pièces du puzzle
  useEffect(() => {
    initializePuzzle()
  }, [])

  const initializePuzzle = () => {
    const gridSize = puzzleConfig.gridSize
    const totalPieces = gridSize * gridSize
    
    // Créer les pièces avec leurs positions correctes
    const newPieces = []
    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({
        id: i,
        correctPosition: i,
        currentPosition: i,
        row: Math.floor(i / gridSize),
        col: i % gridSize
      })
    }
    
    // Mélanger les pièces
    const shuffled = shuffleArray([...newPieces])
    shuffled.forEach((piece, index) => {
      piece.currentPosition = index
    })
    
    setPieces(shuffled)
    setSolvedPieces(new Array(totalPieces).fill(false))
  }

  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handlePieceClick = (piece) => {
    if (completed) return

    if (!selectedPiece) {
      // Première pièce sélectionnée
      setSelectedPiece(piece)
    } else if (selectedPiece.id === piece.id) {
      // Déselectionner la même pièce
      setSelectedPiece(null)
    } else {
      // Échanger les deux pièces
      swapPieces(selectedPiece, piece)
      setSelectedPiece(null)
    }
  }

  const swapPieces = (piece1, piece2) => {
    const newPieces = [...pieces]
    const index1 = newPieces.findIndex(p => p.id === piece1.id)
    const index2 = newPieces.findIndex(p => p.id === piece2.id)
    
    // Échanger les positions
    const temp = newPieces[index1].currentPosition
    newPieces[index1].currentPosition = newPieces[index2].currentPosition
    newPieces[index2].currentPosition = temp
    
    // Trier par position actuelle
    newPieces.sort((a, b) => a.currentPosition - b.currentPosition)
    
    setPieces(newPieces)
    setMoves(moves + 1)
    
    // Vérifier si le puzzle est résolu
    checkCompletion(newPieces)
  }

  const checkCompletion = (currentPieces) => {
    const allCorrect = currentPieces.every(
      (piece, index) => piece.correctPosition === index
    )
    
    if (allCorrect && !completed) {
      setCompleted(true)
      
      // Calculer le score avec bonus basé sur les mouvements
      const baseScore = 100
      const movesPenalty = Math.max(0, moves * 2)
      const finalScore = Math.max(10, baseScore - movesPenalty)
      
      addScore(finalScore)
      
      // Mettre à jour les métadonnées (moves + 1 pour inclure le dernier mouvement)
      const finalMoves = moves + 1
      if (updateMetadata) {
        updateMetadata({
          moves: finalMoves,
          gridSize: puzzleConfig.gridSize,
          completed: true,
          efficiency: Math.max(0, Math.round((1 - (finalMoves / (puzzleConfig.gridSize * puzzleConfig.gridSize * 2))) * 100))
        })
      }
      
      // Terminer le jeu après 1 seconde
      setTimeout(() => {
        onAnswer({
          isCorrect: true,
          message: `Puzzle completed in ${moves} moves!`,
          score: finalScore
        })
        endGame()
      }, 1000)
    }
  }

  const getPieceColor = (piece) => {
    // Utiliser des couleurs pour représenter les pièces
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
      '#F8B195', '#F67280', '#C06C84', '#6C5B7B'
    ]
    return colors[piece.id % colors.length]
  }

  const gridSize = puzzleConfig.gridSize

  return (
    <div className="puzzle-game">
      <div className="puzzle-header">
        <div className="puzzle-info">
          <span className="moves-counter">🎯 Moves: {moves}</span>
          <span className="grid-size">📏 Grid: {gridSize}x{gridSize}</span>
        </div>
        
        {completed && (
          <div className="completion-message">
            <span className="success-icon">✅</span>
            <span>Puzzle Completed!</span>
          </div>
        )}
      </div>

      <div 
        className="puzzle-grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`
        }}
      >
        {pieces.map((piece) => (
          <div
            key={piece.id}
            className={`puzzle-piece ${selectedPiece?.id === piece.id ? 'selected' : ''} ${
              piece.correctPosition === piece.currentPosition ? 'correct' : ''
            }`}
            style={{
              backgroundColor: getPieceColor(piece),
              cursor: completed ? 'default' : 'pointer'
            }}
            onClick={() => handlePieceClick(piece)}
          >
            <span className="piece-number">{piece.id + 1}</span>
            <div className="piece-position">
              <small>({piece.row},{piece.col})</small>
            </div>
          </div>
        ))}
      </div>

      <div className="puzzle-instructions">
        <p>🎮 Click two pieces to swap them</p>
        <p>🎯 Arrange pieces in order (1, 2, 3...)</p>
        <p>⚡ Fewer moves = Higher score!</p>
      </div>
    </div>
  )
}
