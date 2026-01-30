import React, { useState, useEffect } from 'react'
import '../styles/lobby.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Lobby(){
  const { username: authUsername, user, logout } = useAuth()
  const username = authUsername || localStorage.getItem('username') || 'username'
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [games, setGames] = useState([])
  const [roomName, setRoomName] = useState('')
  const [selectedGame, setSelectedGame] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [difficulty, setDifficulty] = useState('medium')
  const [category, setCategory] = useState('Mathematics')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login', { replace: true })
    }
  }

  // Charger les jeux disponibles
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const token = localStorage.getItem('token')
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        
        const response = await fetch(`${API_URL}/api/games`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setGames(data.games || [])
          if (data.games?.length > 0) {
            setSelectedGame(data.games[0].id)
          }
        }
      } catch (err) {
        console.error('Error fetching games:', err)
      }
    }

    fetchGames()
  }, [])

  // Charger les salles disponibles
  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      
      const response = await fetch(`${API_URL}/api/multiplayer/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRooms(data.rooms || [])
      }
    } catch (err) {
      console.error('Error fetching rooms:', err)
    }
  }

  useEffect(() => {
    fetchRooms()
    // Rafraîchir toutes les 5 secondes
    const interval = setInterval(fetchRooms, 5000)
    return () => clearInterval(interval)
  }, [])

  const joinRoom = async (roomCode) => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      
      const response = await fetch(`${API_URL}/api/multiplayer/rooms/${roomCode}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to join room')
      }

      navigate(`/waiting-room/${roomCode}`)
    } catch (err) {
      setError(err.message)
      console.error('Error joining room:', err)
    } finally {
      setLoading(false)
    }
  }

  const createRoom = async () => {
    if (!roomName.trim() || !selectedGame) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      
      const response = await fetch(`${API_URL}/api/multiplayer/rooms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameId: selectedGame,
          name: roomName,
          maxPlayers,
          difficulty,
          category
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create room')
      }

      const data = await response.json()
      navigate(`/waiting-room/${data.room.roomCode}`)
    } catch (err) {
      setError(err.message)
      console.error('Error creating room:', err)
    } finally {
      setLoading(false)
    }
  }

  const joinRandom = () => {
    if (rooms.length === 0) {
      setError('No rooms available')
      return
    }
    
    const availableRooms = rooms.filter(r => r.currentPlayers < r.maxPlayers)
    if (availableRooms.length === 0) {
      setError('No available rooms')
      return
    }

    const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)]
    joinRoom(randomRoom.roomCode)
  }

  return (
    <div className="lobby-wrap">
      <header className="topbar">
        <button className="back" onClick={()=>navigate('/')}>← Back</button>
        <h1 className="brand">Multiplayer Lobby</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: 'var(--muted)', fontSize: '14px' }}>{username}</div>
          <button 
            onClick={handleLogout}
            style={{
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="wrap">
        <div className="grid">
          {/* Error Message */}
          {error && (
            <div style={{
              gridColumn: '1 / -1',
              background: '#fee',
              border: '2px solid #f44',
              borderRadius: '8px',
              padding: '16px',
              color: '#c00',
              fontWeight: '600'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Active rooms */}
          <section className="panel">
            <div className="headerline">
              <h2>Active Rooms</h2>
              <button className="refresh" onClick={fetchRooms} disabled={loading}>
                🔄 Refresh
              </button>
            </div>
            
            <ul className="room-list">
              {rooms.length === 0 ? (
                <div className="empty">
                  <p>No active rooms</p>
                  <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '8px' }}>
                    Create a room to start playing!
                  </p>
                </div>
              ) : (
                rooms.map(room => (
                  <li key={room.id} className="room">
                    <div className="room-info">
                      <div className="room-name">
                        {room.name}
                        <span className="room-code" style={{ 
                          marginLeft: '12px', 
                          fontSize: '12px', 
                          color: 'var(--muted)',
                          fontFamily: 'monospace'
                        }}>
                          [{room.roomCode}]
                        </span>
                      </div>
                      <div className="room-meta">
                        {room.game?.name} • {room.difficulty} • {room.currentPlayers}/{room.maxPlayers} players
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                        Host: {room.host?.username}
                      </div>
                    </div>
                    <button 
                      className="join-btn" 
                      onClick={() => joinRoom(room.roomCode)}
                      disabled={room.currentPlayers >= room.maxPlayers || loading}
                    >
                      {room.currentPlayers >= room.maxPlayers ? 'Full' : 'Join'}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </section>

          {/* Create room */}
          <section className="panel">
            <h2>Create Room</h2>
            
            <form className="form" onSubmit={e => { e.preventDefault(); createRoom(); }}>
              <fieldset className="group">
                <legend>Room Name</legend>
                <input 
                  type="text" 
                  className="input" 
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder="Enter room name..."
                  maxLength={50}
                  required
                />
              </fieldset>

              <fieldset className="group">
                <legend>Game</legend>
                <select 
                  className="select" 
                  value={selectedGame}
                  onChange={e => setSelectedGame(e.target.value)}
                  required
                >
                  {games.length === 0 ? (
                    <option>Loading games...</option>
                  ) : (
                    games.map(game => (
                      <option key={game.id} value={game.id}>
                        {game.name} ({game.gameType})
                      </option>
                    ))
                  )}
                </select>
              </fieldset>

              <fieldset className="group">
                <legend>Max Players</legend>
                <select 
                  className="select" 
                  value={maxPlayers}
                  onChange={e => setMaxPlayers(Number(e.target.value))}
                >
                  <option value={2}>2 Players</option>
                  <option value={3}>3 Players</option>
                  <option value={4}>4 Players</option>
                  <option value={6}>6 Players</option>
                  <option value={8}>8 Players</option>
                </select>
              </fieldset>

              <fieldset className="group">
                <legend>Difficulty</legend>
                <select 
                  className="select" 
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </fieldset>

              <fieldset className="group">
                <legend>Category</legend>
                <select 
                  className="select" 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Computer Science</option>
                  <option>Geography</option>
                  <option>General Knowledge</option>
                </select>
              </fieldset>
            </form>
          </section>
        </div>
      </main>

      <div className="actions">
        <button 
          className="create" 
          onClick={createRoom} 
          disabled={!roomName.trim() || !selectedGame || loading}
        >
          {loading ? 'Creating...' : '🎮 Create Room'}
        </button>
        <button 
          className="join-random" 
          onClick={joinRandom}
          disabled={rooms.length === 0 || loading}
        >
          🎲 Join Random
        </button>
      </div>
    </div>
  )
}
