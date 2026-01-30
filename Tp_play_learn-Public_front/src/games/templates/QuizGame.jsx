import { useState, useEffect } from 'react';
import './QuizGame.css';

/**
 * Composant QuizGame - Jeu de quiz interactif
 * Props attendues du GameContainer:
 * - gameState: état du jeu (score, temps, etc.)
 * - onAnswer: fonction pour enregistrer une réponse
 * - addScore: fonction pour ajouter des points
 * - endGame: fonction pour terminer le jeu immédiatement
 * - gameConfig: configuration du jeu
 */
const QuizGame = ({ gameState, onAnswer, addScore, endGame, gameConfig }) => {
  // Questions du quiz (à terme, ces données viendront de la base de données)
  const questions = gameConfig.questions || [
    {
      id: 1,
      question: "Quelle est la complexité temporelle d'une recherche binaire ?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: 1,
      points: 10,
      category: "Computer Science"
    },
    {
      id: 2,
      question: "En Python, quelle structure de données est mutable ?",
      options: ["tuple", "string", "list", "int"],
      correctAnswer: 2,
      points: 10,
      category: "Computer Science"
    },
    {
      id: 3,
      question: "Quel est le résultat de 2 ** 3 en Python ?",
      options: ["6", "8", "9", "5"],
      correctAnswer: 1,
      points: 10,
      category: "Mathematics"
    },
    {
      id: 4,
      question: "Quelle méthode HTTP est utilisée pour créer une ressource ?",
      options: ["GET", "PUT", "POST", "DELETE"],
      correctAnswer: 2,
      points: 10,
      category: "Computer Science"
    },
    {
      id: 5,
      question: "Qu'est-ce qu'un algorithme de tri stable ?",
      options: [
        "Un algorithme qui ne plante jamais",
        "Un algorithme qui préserve l'ordre relatif des éléments égaux",
        "Un algorithme qui utilise peu de mémoire",
        "Un algorithme très rapide"
      ],
      correctAnswer: 1,
      points: 15,
      category: "Computer Science"
    }
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Reset quand on redémarre le jeu
  useEffect(() => {
    if (!gameState.isStarted) {
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setAnswered(false);
      setAnswers([]);
      setShowFeedback(false);
    }
  }, [gameState.isStarted]);

  const handleOptionClick = (optionIndex) => {
    if (answered) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null || answered) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setAnswered(true);
    setShowFeedback(true);

    // Enregistrer la réponse
    const answerData = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      selectedOption,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      points: isCorrect ? currentQuestion.points : 0
    };

    setAnswers([...answers, answerData]);
    onAnswer(answerData);

    // Ajouter des points si correct
    if (isCorrect) {
      addScore(currentQuestion.points);
    }

    // Passer à la question suivante après 2 secondes
    if (!isLastQuestion) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setAnswered(false);
        setShowFeedback(false);
      }, 2000);
    } else {
      // Fin du jeu - Terminer immédiatement après 1 seconde
      setTimeout(() => {
        endGame();  // ✅ Terminer le jeu sans attendre le chronomètre
      }, 1000);
    }
  };

  const getOptionClass = (optionIndex) => {
    if (!answered) {
      return selectedOption === optionIndex ? 'quiz-option selected' : 'quiz-option';
    }

    if (optionIndex === currentQuestion.correctAnswer) {
      return 'quiz-option correct';
    }

    if (optionIndex === selectedOption && selectedOption !== currentQuestion.correctAnswer) {
      return 'quiz-option incorrect';
    }

    return 'quiz-option disabled';
  };

  return (
    <div className="quiz-game">
      {/* Progress bar */}
      <div className="quiz-progress-bar">
        <div 
          className="quiz-progress-fill"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="quiz-progress-text">
        Question {currentQuestionIndex + 1} / {questions.length}
      </div>

      {/* Question card */}
      <div className="quiz-question-card">
        <div className="quiz-category-badge">
          {currentQuestion.category}
        </div>

        <h2 className="quiz-question-text">
          {currentQuestion.question}
        </h2>

        <div className="quiz-points-badge">
          🏆 {currentQuestion.points} points
        </div>
      </div>

      {/* Options */}
      <div className="quiz-options-grid">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            className={getOptionClass(index)}
            onClick={() => handleOptionClick(index)}
            disabled={answered}
          >
            <span className="option-letter">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="option-text">{option}</span>
            {answered && index === currentQuestion.correctAnswer && (
              <span className="option-icon">✓</span>
            )}
            {answered && index === selectedOption && selectedOption !== currentQuestion.correctAnswer && (
              <span className="option-icon">✗</span>
            )}
          </button>
        ))}
      </div>

      {/* Submit button */}
      {!answered && (
        <button
          className="quiz-submit-btn"
          onClick={handleSubmit}
          disabled={selectedOption === null}
        >
          {isLastQuestion ? 'Finish Quiz' : 'Submit Answer'}
        </button>
      )}

      {/* Feedback */}
      {showFeedback && (
        <div className={`quiz-feedback ${answered && selectedOption === currentQuestion.correctAnswer ? 'correct' : 'incorrect'}`}>
          {selectedOption === currentQuestion.correctAnswer ? (
            <>
              <span className="feedback-icon">🎉</span>
              <div className="feedback-text">
                <strong>Excellent !</strong>
                <p>+{currentQuestion.points} points</p>
              </div>
            </>
          ) : (
            <>
              <span className="feedback-icon">💭</span>
              <div className="feedback-text">
                <strong>Pas tout à fait...</strong>
                <p>La bonne réponse était : {currentQuestion.options[currentQuestion.correctAnswer]}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Summary au dernier écran */}
      {answered && isLastQuestion && (
        <div className="quiz-final-summary">
          <h3>Quiz Terminé ! 🎯</h3>
          <div className="summary-stats">
            <div className="summary-stat">
              <span className="stat-label">Questions Réussies</span>
              <span className="stat-value">
                {answers.filter(a => a.isCorrect).length + (selectedOption === currentQuestion.correctAnswer ? 1 : 0)} / {questions.length}
              </span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Taux de Réussite</span>
              <span className="stat-value">
                {Math.round(((answers.filter(a => a.isCorrect).length + (selectedOption === currentQuestion.correctAnswer ? 1 : 0)) / questions.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGame;
