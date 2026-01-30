import './App.css'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import AuthGuard from './components/AuthGuard'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import MainMenu from './pages/MainMenu'
import Leaderboard from './pages/Leaderboard'
import History from './pages/History'
import Lobby from './pages/Lobby'
import Single from './pages/Single'
import MultiPlay from './pages/MultiPlay'
import WaitingRoom from './pages/WaitingRoom'
import GameReady from './pages/GameReady'
import CreateGame from './pages/CreateGame'
import CreateMultiplayerGame from './pages/CreateMultiplayerGame'
import CreateMultiplayerGamePage from './pages/CreateMultiplayerGamePage'
import CreateMultiplayerGameComplete from './pages/CreateMultiplayerGameComplete'
import AdminDashboard from './pages/AdminDashboard'
import GameContainer from './games/components/GameContainer'
import MultiplayerGameContainer from './pages/MultiplayerGameContainer'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
        {/* Public routes (authentication pages) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected routes (require authentication) */}
        <Route path="/" element={
          <AuthGuard>
            <MainMenu />
          </AuthGuard>
        } />
        <Route path="/single" element={
          <AuthGuard>
            <Single />
          </AuthGuard>
        } />
        <Route path="/multi" element={
          <AuthGuard>
            <MultiPlay />
          </AuthGuard>
        } />
        <Route path="/lobby" element={
          <AuthGuard>
            <Lobby />
          </AuthGuard>
        } />
        <Route path="/waiting-room/:roomCode" element={
          <AuthGuard>
            <WaitingRoom />
          </AuthGuard>
        } />
        <Route path="/game-ready/:roomCode" element={
          <AuthGuard>
            <GameReady />
          </AuthGuard>
        } />
        <Route path="/multiplayer-game/:roomCode" element={
          <AuthGuard>
            <MultiplayerGameContainer />
          </AuthGuard>
        } />
        <Route path="/multi-play/:roomCode" element={
          <AuthGuard>
            <MultiPlay />
          </AuthGuard>
        } />
        <Route path="/leaderboard" element={
          <AuthGuard>
            <Leaderboard />
          </AuthGuard>
        } />
        <Route path="/history" element={
          <AuthGuard>
            <History />
          </AuthGuard>
        } />
        <Route path="/admin" element={
          <AuthGuard>
            <AdminDashboard />
          </AuthGuard>
        } />
        <Route path="/create-game" element={
          <AuthGuard>
            <CreateGame />
          </AuthGuard>
        } />
        <Route path="/create-multiplayer" element={
          <AuthGuard>
            <CreateMultiplayerGame />
          </AuthGuard>
        } />
        <Route path="/create-multiplayer-game" element={
          <AuthGuard>
            <CreateMultiplayerGamePage />
          </AuthGuard>
        } />
        <Route path="/create-multiplayer-game-full" element={
          <AuthGuard>
            <CreateMultiplayerGameComplete />
          </AuthGuard>
        } />
        <Route path="/game/:gameId" element={
          <AuthGuard>
            <GameContainer />
          </AuthGuard>
        } />
      </Routes>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
