import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/main-menu.css'

export default function MainMenu(){
  const { username: authUsername, isGuest, logout, user } = useAuth()
  const [username, setUsername] = useState(authUsername || 'username')
  const [scores, setScores] = useState([])
  const [selectedMode, setSelectedMode] = useState('single')
  const [liveRooms, setLiveRooms] = useState([])
  const navigate = useNavigate()

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login', { replace: true })
    }
  }

  useEffect(()=>{
    const me = authUsername || localStorage.getItem('username') || 'username'
    setUsername(me)

    const SEED_VERSION = 'v3'
    const BASE_SEED = [
      { user:'Bob',   score:620, mode:'single', diff:'normal', category:'Physics' },
      { user:'Alice', score:580, mode:'single', diff:'normal', category:'Mathematics' },
      { user:'Eva',   score:340, mode:'single', diff:'hard',   category:'Mathematics' },
      { user:'Cara',  score:310, mode:'multi',  diff:'hard',   category:'Computer Science' },
    ];

    const MY_RECORDS = [
      { user: me, category:'Mathematics',      diff:'hard',   mode:'single', score:295 },
      { user: me, category:'Physics',          diff:'normal', mode:'single', score:265 },
      { user: me, category:'Computer Science', diff:'normal', mode:'multi',  score:250 },
      { user: me, category:'Geography',        diff:'easy',   mode:'single', score:220 },
      { user: me, category:'Mathematics',      diff:'hard',   mode:'multi',  score:275 },
      { user: me, category:'Physics',          diff:'easy',   mode:'multi',  score:200 },
      { user: me, category:'Mathematics',      diff:'normal', mode:'single', score:180 },
      { user: me, category:'Computer Science', diff:'hard',   mode:'single', score:160 },
      { user: me, category:'Geography',        diff:'normal', mode:'multi',  score:150 },
      { user: me, category:'Mathematics',      diff:'easy',   mode:'single', score:120 },
      { user: me, category:'Computer Science', diff:'easy',   mode:'multi',  score:100 },
    ];

    try{
      const raw = localStorage.getItem('scores')
      let parsed = raw ? JSON.parse(raw) : null
      if (!Array.isArray(parsed) || parsed.length === 0 || localStorage.getItem('scores_seed_version') !== SEED_VERSION){
        parsed = [...BASE_SEED, ...MY_RECORDS].map(s=> ({...s, date: s.date || new Date().toLocaleString()}))
        localStorage.setItem('scores', JSON.stringify(parsed))
        localStorage.setItem('scores_seed_version', SEED_VERSION)
      }
      parsed = parsed.map(s => ({ ...s, category: s.category ?? s.subject ?? 'Uncategorized', date: s.date || new Date().toLocaleString() }))
      setScores(parsed)
    }catch(e){
      setScores([...BASE_SEED, ...MY_RECORDS])
    }
  },[])

  // recent: last 3 for current user
  const recent = scores.filter(s=> s.user === username).slice(0,3)

  // scoreboard best per user top10
  const bestByUserMap = new Map()
  for (const s of scores){
    const prev = bestByUserMap.get(s.user)
    if (!prev || s.score > prev.score) bestByUserMap.set(s.user, s)
  }
  const leaderboard = [...bestByUserMap.values()].sort((a,b)=> b.score - a.score).slice(0,10)

  // Categories data for single mode
  const categories = [
    { name: 'Mathematics', count: 25 },
    { name: 'Physics', count: 18 },
    { name: 'Computer Science', count: 22 },
    { name: 'Geography', count: 15 },
    { name: 'History', count: 20 },
    { name: 'Biology', count: 12 }
  ]

  // Charger les parties en cours quand on passe en mode multiplayer
  useEffect(() => {
    if (selectedMode === 'multi') {
      fetchLiveRooms()
      // Actualiser toutes les 3 secondes
      const interval = setInterval(fetchLiveRooms, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedMode])

  const fetchLiveRooms = async () => {
    try {
      const token = localStorage.getItem('token')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      const response = await fetch(`${API_URL}/multiplayer/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setLiveRooms(data.rooms || [])
      }
    } catch (err) {
      console.error('Error fetching live rooms:', err)
    }
  }

  const handleJoinRoom = (roomCode) => {
    navigate(`/waiting-room/${roomCode}`)
  }

  const handleModeChange = (mode) => {
    setSelectedMode(mode)
  }

  return (
    <div className="main-menu-wrap">
      <header className="topbar">
        <h1 className="brand">Play&Learn</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user && user.isAdmin && (
            <button 
              onClick={() => navigate('/admin')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🔧 Admin
            </button>
          )}
          <div className="username" title={username}>
            {username} {isGuest && <span style={{color: 'var(--muted)', fontSize: '12px'}}>(Invité)</span>}
          </div>
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
            {isGuest ? 'Quitter' : 'Déconnexion'}
          </button>
        </div>
      </header>

      <main className="wrap">
        <div className="dashboard">
          {/* Left column: Recent and Scoreboard */}
          <div className="left-column">
            {/* Recent scores panel */}
            <section className="panel">
              <div className="headerline">
                <h2>Recent (last 3)</h2>
                <Link className="view-all" to="/history">Show all</Link>
              </div>
              <div className="recent-list">
                {recent.length === 0 ? (
                  <div className="empty">No record yet</div>
                ) : (
                  recent.map((s, i) => (
                    <div key={i} className="recent-item">
                      <div className="score-badge">{s.score}</div>
                      <div className="recent-details">
                        <div className="recent-text">{s.category} • {s.mode} • {s.date}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Leaderboard panel */}
            <section className="panel">
              <div className="headerline">
                <h2>Scoreboard</h2>
                <Link className="view-all" to="/leaderboard">Show all</Link>
              </div>
              <div className="scoreboard-list">
                {leaderboard.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="scoreboard-item">
                    <div className={`rank-badge ${idx===0? 'rank1' : idx===1? 'rank2' : idx===2? 'rank3' : ''}`}>
                      {idx+1}
                    </div>
                    <div className="player-info">
                      <span className={`player-name ${item.user === username ? 'current-user' : ''}`}>
                        {item.user}
                      </span>
                      <span className="player-details">({item.category}/{item.mode})</span>
                    </div>
                    <div className="player-score">{item.score}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column: Mode selection */}
          <div className="right-column">
            <section className="panel mode-panel">
              <div className="headerline">
                <h2>Mode selection</h2>
              </div>
              <div className="mode-selection">
                <div className="radio-group">
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="gameMode" 
                      value="single" 
                      defaultChecked
                      onChange={(e) => handleModeChange(e.target.value)}
                    />
                    <span className="radio-text">Single player</span>
                  </label>
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="gameMode" 
                      value="multi"
                      onChange={(e) => handleModeChange(e.target.value)}
                    />
                    <span className="radio-text">Multiplayer</span>
                  </label>
                </div>
              </div>
            </section>
          </div>

          {/* Third column: Dynamic content based on selected mode */}
          <div className="third-column">
            {/* Single player categories */}
            {selectedMode === 'single' && (
              <section className="dynamic-panel single-mode">
                <div className="dynamic-header">
                  <div className="header-content">
                    <h2>🎯 Choose Your Challenge</h2>
                    <p>Select a category and start learning!</p>
                  </div>
                </div>
                
                <div className="categories-grid">
                  {categories.map((category, idx) => (
                    <div key={idx} className={`category-card ${idx < 3 ? 'featured' : ''}`} 
                         onClick={() => navigate('/single', { state: { category: category.name } })}>
                      <div className="category-icon">
                        {idx === 0 ? '🧮' : idx === 1 ? '⚗️' : idx === 2 ? '💻' : idx === 3 ? '🌍' : '📚'}
                      </div>
                      <div className="category-content">
                        <h3 className="category-title">{category.name}</h3>
                        <p className="category-description">
                          {category.count} questions • Test your knowledge
                        </p>
                        {idx < 3 && <span className="featured-badge">Popular</span>}
                      </div>
                      <div className="category-arrow">→</div>
                    </div>
                  ))}
                </div>
                
                <div className="action-section">
                  <button className="primary-action-btn" onClick={() => navigate('/single')}>
                    <span>� Show All Categories</span>
                  </button>
                  <p className="action-hint">Choose any category above or browse all questions</p>
                </div>
              </section>
            )}

            {/* Multiplayer games */}
            {selectedMode === 'multi' && (
              <section className="dynamic-panel multi-mode">
                <div className="dynamic-header">
                  <div className="header-content">
                    <h2>🎮 Parties Multijoueur</h2>
                    <p>Rejoins une partie en cours ou crée la tienne!</p>
                  </div>
                </div>
                
                <div className="games-container">
                  <div className="games-section">
                    <h3 className="section-title">
                      <span className="pulse-dot"></span>
                      Parties en cours ({liveRooms.length})
                    </h3>
                    <div className="games-list">
                      {liveRooms.length === 0 ? (
                        <div style={{ 
                          padding: '40px', 
                          textAlign: 'center', 
                          color: 'white',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          border: '2px dashed rgba(255, 255, 255, 0.3)',
                          backdropFilter: 'blur(10px)'
                        }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
                          <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            Aucune partie en cours
                          </p>
                          <p style={{ margin: '8px 0 0', fontSize: '14px', opacity: 0.9 }}>
                            Sois le premier à en créer une!
                          </p>
                        </div>
                      ) : (
                        liveRooms.map((room) => (
                          <div 
                            key={room.id} 
                            className="game-card live"
                            onClick={() => handleJoinRoom(room.roomCode)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="game-status-indicator"></div>
                            <div className="game-details">
                              <h4 className="game-name">{room.name}</h4>
                              <p className="game-meta">
                                {room.Game?.title} • {room.difficulty}
                              </p>
                            </div>
                            <div className="game-players-count">
                              <span className="players-icon">👥</span>
                              <span className="players-text">
                                {room.currentPlayers}/{room.maxPlayers}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="action-section">
                  <button 
                    className="primary-action-btn" 
                    onClick={() => navigate('/create-multiplayer')}
                  >
                    <span>✨ Créer une partie</span>
                  </button>
                  <p className="action-hint">
                    Clique sur une partie pour la rejoindre ou crée la tienne
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
