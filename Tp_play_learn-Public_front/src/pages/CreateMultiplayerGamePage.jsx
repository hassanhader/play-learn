import { useNavigate } from 'react-router-dom'
import CreateMultiplayerGameForm from '../components/CreateMultiplayerGameForm'
import '../styles/create-game.css'

export default function CreateMultiplayerGamePage() {
  const navigate = useNavigate()

  const handleGameCreated = (game) => {
    console.log('✅ Multiplayer game created:', game)
    // Redirect to admin dashboard, games tab, multiplayer sub-tab
    navigate('/admin', { state: { activeTab: 'games', gameTypeTab: 'multiplayer' } })
  }

  return (
    <div className="create-game-page">
      <header className="page-header">
        <button onClick={() => navigate('/admin')} className="btn-back">
          ← Retour à l'admin
        </button>
        <h1>Créer un Jeu Multiplayer</h1>
      </header>

      <div className="page-content">
        <CreateMultiplayerGameForm onGameCreated={handleGameCreated} />
      </div>
    </div>
  )
}
