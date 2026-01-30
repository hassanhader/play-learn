import { useState, useEffect } from 'react';
import './SpeedMath.css';

/**
 * Speed Math - Calculs mathématiques rapides
 */
const SpeedMath = ({ gameState, onAnswer, addScore, endGame, gameConfig, updateMetadata }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Générer une nouvelle question
  const generateQuestion = () => {
    const operations = ['+', '-', '×', '÷'];
    const difficulty = gameConfig.difficulty;
    
    let num1, num2, operation, answer;
    
    // Ajuster la difficulté
    const maxNum = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : difficulty === 'hard' ? 100 : 200;
    
    do {
      operation = operations[Math.floor(Math.random() * operations.length)];
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * (maxNum / 2)) + 1;
      
      switch(operation) {
        case '+':
          answer = num1 + num2;
          break;
        case '-':
          // S'assurer que le résultat est positif
          if (num1 < num2) [num1, num2] = [num2, num1];
          answer = num1 - num2;
          break;
        case '×':
          // Nombres plus petits pour multiplication
          num1 = Math.floor(Math.random() * (maxNum / 4)) + 1;
          num2 = Math.floor(Math.random() * (maxNum / 4)) + 1;
          answer = num1 * num2;
          break;
        case '÷':
          // S'assurer division exacte
          num2 = Math.floor(Math.random() * 12) + 1;
          answer = Math.floor(Math.random() * 20) + 1;
          num1 = num2 * answer;
          break;
        default:
          answer = 0;
      }
    } while (answer < 0 || answer > maxNum * 2 || !Number.isInteger(answer));
    
    return { num1, num2, operation, answer };
  };

  // Initialiser avec la première question
  useEffect(() => {
    if (gameState.isStarted && !currentQuestion) {
      setCurrentQuestion(generateQuestion());
    }
  }, [gameState.isStarted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Vérifier si terminé
  useEffect(() => {
    if (questionsAnswered >= gameConfig.totalQuestions && questionsAnswered > 0) {
      // Mettre à jour les métadonnées avant de terminer
      if (updateMetadata) {
        updateMetadata({
          correctAnswers,
          totalQuestions: questionsAnswered,
          accuracy: Math.round((correctAnswers / questionsAnswered) * 100),
          streak: streak,
          bestStreak: bestStreak,
          averageTimePerQuestion: gameState.timeRemaining 
            ? Math.round((gameConfig.timeLimit - gameState.timeRemaining) / questionsAnswered)
            : 0
        });
      }
      
      setTimeout(() => {
        onAnswer({
          isCorrect: true,
          totalQuestions: questionsAnswered,
          correctAnswers: correctAnswers,
          accuracy: Math.round((correctAnswers / questionsAnswered) * 100),
          bestStreak: bestStreak
        });
        // Terminer le jeu automatiquement après 1 seconde
        endGame();
      }, 1000);
    }
  }, [questionsAnswered, correctAnswers, streak, bestStreak, gameConfig.totalQuestions, onAnswer, updateMetadata, gameState.timeRemaining, gameConfig.timeLimit]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userAnswer === '' || !currentQuestion) return;

    const isCorrect = parseInt(userAnswer) === currentQuestion.answer;
    const newQuestionsAnswered = questionsAnswered + 1;
    
    setQuestionsAnswered(newQuestionsAnswered);

    if (isCorrect) {
      const newCorrect = correctAnswers + 1;
      const newStreak = streak + 1;
      
      setCorrectAnswers(newCorrect);
      setStreak(newStreak);
      
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }

      // Points : base + bonus streak
      const basePoints = 5;
      const streakBonus = Math.min(newStreak, 10); // Max 10 bonus
      addScore(basePoints + streakBonus);

      setFeedback({ type: 'correct', message: `+${basePoints + streakBonus} points!` });
    } else {
      setStreak(0);
      setFeedback({ 
        type: 'incorrect', 
        message: `La réponse était ${currentQuestion.answer}` 
      });
    }

    // Prochaine question après délai
    setTimeout(() => {
      if (newQuestionsAnswered < gameConfig.totalQuestions) {
        setCurrentQuestion(generateQuestion());
        setUserAnswer('');
        setFeedback(null);
      }
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  if (!currentQuestion) {
    return <div className="speed-math loading">Préparation...</div>;
  }

  return (
    <div className="speed-math">
      {/* Progress bar */}
      <div className="math-progress-bar">
        <div 
          className="math-progress-fill"
          style={{ width: `${(questionsAnswered / gameConfig.totalQuestions) * 100}%` }}
        />
      </div>
      <p className="math-progress-text">
        Question {questionsAnswered + 1} / {gameConfig.totalQuestions}
      </p>

      {/* Stats */}
      <div className="math-stats">
        <div className="math-stat">
          <span className="stat-icon">✅</span>
          <div>
            <span className="stat-label">Correct</span>
            <span className="stat-value">{correctAnswers}</span>
          </div>
        </div>
        <div className="math-stat">
          <span className="stat-icon">🔥</span>
          <div>
            <span className="stat-label">Série</span>
            <span className="stat-value">{streak}</span>
          </div>
        </div>
        <div className="math-stat">
          <span className="stat-icon">⭐</span>
          <div>
            <span className="stat-label">Record</span>
            <span className="stat-value">{bestStreak}</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="math-question-card">
        <div className="math-equation">
          <span className="number">{currentQuestion.num1}</span>
          <span className="operation">{currentQuestion.operation}</span>
          <span className="number">{currentQuestion.num2}</span>
          <span className="equals">=</span>
          <span className="question-mark">?</span>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="math-answer-form">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Votre réponse"
          className="math-input"
          autoFocus
          disabled={!!feedback}
        />
        <button 
          type="submit" 
          className="math-submit-btn"
          disabled={userAnswer === '' || !!feedback}
        >
          Valider ✓
        </button>
      </form>

      {/* Feedback */}
      {feedback && (
        <div className={`math-feedback ${feedback.type}`}>
          <span className="feedback-icon">
            {feedback.type === 'correct' ? '🎉' : '💭'}
          </span>
          <span className="feedback-message">{feedback.message}</span>
        </div>
      )}
    </div>
  );
};

export default SpeedMath;
