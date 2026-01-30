import { useState, useEffect } from 'react';
import './MemoryGame.css';

/**
 * Memory Game - Jeu de mémoire avec des paires à trouver
 */
const MemoryGame = ({ gameState, onAnswer, addScore, endGame, gameConfig }) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [canFlip, setCanFlip] = useState(true);

  // Cartes disponibles (emojis mathématiques et leurs paires)
  const cardPairs = [
    { id: 1, emoji: '➕', name: 'Addition' },
    { id: 2, emoji: '➖', name: 'Soustraction' },
    { id: 3, emoji: '✖️', name: 'Multiplication' },
    { id: 4, emoji: '➗', name: 'Division' },
    { id: 5, emoji: '🔢', name: 'Nombres' },
    { id: 6, emoji: '📐', name: 'Géométrie' },
    { id: 7, emoji: '📊', name: 'Statistiques' },
    { id: 8, emoji: '🧮', name: 'Calcul' },
  ];

  // Initialiser le jeu
  useEffect(() => {
    if (gameState.isStarted && cards.length === 0) {
      initializeGame();
    }
  }, [gameState.isStarted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Vérifier si le jeu est terminé
  useEffect(() => {
    if (matchedCards.length > 0 && matchedCards.length === cards.length) {
      // Tous les paires trouvées !
      const bonusScore = Math.max(0, 100 - moves * 2); // Bonus basé sur le nombre de coups
      addScore(bonusScore);
      
      setTimeout(() => {
        onAnswer({
          isCorrect: true,
          totalMoves: moves,
          matchedPairs: matchedCards.length / 2,
          score: bonusScore
        });
        // Terminer le jeu automatiquement après 1 seconde
        endGame();
      }, 1000);
    }
  }, [matchedCards]); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeGame = () => {
    // Créer les paires et mélanger
    const pairs = cardPairs.slice(0, gameConfig.totalQuestions / 2);
    const duplicatedCards = [...pairs, ...pairs].map((card, index) => ({
      ...card,
      uniqueId: index,
      isFlipped: false,
      isMatched: false
    }));

    // Mélanger les cartes
    const shuffled = duplicatedCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
  };

  const handleCardClick = (cardIndex) => {
    if (!canFlip) return;
    if (flippedCards.includes(cardIndex)) return;
    if (matchedCards.includes(cardIndex)) return;
    if (flippedCards.length >= 2) return;

    const newFlipped = [...flippedCards, cardIndex];
    setFlippedCards(newFlipped);

    // Si deux cartes sont retournées
    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      setCanFlip(false);

      const [first, second] = newFlipped;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.id === secondCard.id) {
        // Match trouvé !
        setTimeout(() => {
          setMatchedCards([...matchedCards, first, second]);
          setFlippedCards([]);
          setCanFlip(true);
          addScore(10); // 10 points par paire
        }, 600);
      } else {
        // Pas de match
        setTimeout(() => {
          setFlippedCards([]);
          setCanFlip(true);
        }, 1000);
      }
    }
  };

  if (cards.length === 0) {
    return (
      <div className="memory-game loading">
        <p>Préparation du jeu...</p>
      </div>
    );
  }

  return (
    <div className="memory-game">
      {/* Stats */}
      <div className="memory-stats">
        <div className="memory-stat-item">
          <span className="stat-icon">🎯</span>
          <div>
            <span className="stat-label">Paires trouvées</span>
            <span className="stat-value">{matchedCards.length / 2} / {cards.length / 2}</span>
          </div>
        </div>
        <div className="memory-stat-item">
          <span className="stat-icon">🔄</span>
          <div>
            <span className="stat-label">Coups joués</span>
            <span className="stat-value">{moves}</span>
          </div>
        </div>
      </div>

      {/* Grille de cartes */}
      <div className="memory-grid">
        {cards.map((card, index) => (
          <div
            key={card.uniqueId}
            className={`memory-card ${
              flippedCards.includes(index) || matchedCards.includes(index)
                ? 'flipped'
                : ''
            } ${matchedCards.includes(index) ? 'matched' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front">
                <span>?</span>
              </div>
              <div className="card-back">
                <span className="card-emoji">{card.emoji}</span>
                <span className="card-name">{card.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message de félicitations */}
      {matchedCards.length === cards.length && (
        <div className="memory-complete">
          <h3>🎉 Bravo !</h3>
          <p>Toutes les paires trouvées en {moves} coups !</p>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
