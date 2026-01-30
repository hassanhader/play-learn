// Placeholder pour Memory Match
import React from 'react'
import './MultiplayerGame.css'

export default function MultiplayerMemoryMatch({ roomCode, roomDetails, gameState, participants, onLeave }) {
  return (
    <div className="multiplayer-game-container">
      <header className="game-header">
        <button className="leave-btn" onClick={onLeave}>← Quitter</button>
        <h2>🧠 Memory Match</h2>
      </header>
      <div className="game-main">
        <h3>Memory Match - En développement</h3>
        <p>Ce mode de jeu sera bientôt disponible!</p>
      </div>
    </div>
  )
}
