import React, { useEffect, useState } from 'react'
import '../styles/leaderboard.css'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import scoresService from '../services/scoresService'

export default function Leaderboard(){
  const { username: authUsername, logout } = useAuth()
  const username = authUsername || localStorage.getItem('username') || 'username'
  const navigate = useNavigate()

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login', { replace: true })
    }
  }
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('All')
  const [mode, setMode] = useState('All')
  const [diff, setDiff] = useState('All')

  // Fetch all scores from database
  useEffect(() => {
    const fetchAllScores = async () => {
      try {
        setLoading(true)
        // Get unique game IDs and fetch scores for each
        const gameIds = ['quiz-physics', 'quiz-math', 'quiz-cs', 'quiz-geo', 'memory-animals', 'memory-flags', 'speed-math-addition', 'speed-math-multiplication', 'speed-math-mixed']
        
        const allScores = []
        for (const gameId of gameIds) {
          const result = await scoresService.getGameScores(gameId, { limit: 100 })
          if (result.success && result.data) {
            allScores.push(...result.data)
          }
        }
        
        console.log('✅ Leaderboard scores loaded:', allScores.length)
        setScores(allScores)
      } catch (err) {
        console.error('❌ Error loading leaderboard:', err)
        setError('Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }

    fetchAllScores()
  }, [])

  function matchFilter(r){
    if (category!=='All' && r.category!==category) return false
    if (mode!=='All' && r.mode!==mode) return false
    if (diff!=='All' && r.difficulty!==diff) return false
    return true
  }

  // Best per user under current filters
  function bestPerUser(){
    const map = new Map()
    for (const r of scores){
      if (!matchFilter(r)) continue
      const userId = r.user?.username || r.userId || 'Unknown'
      const prev = map.get(userId)
      if (!prev || r.score>prev.score || (r.score===prev.score && new Date(r.completedAt)>new Date(prev.completedAt))){
        map.set(userId, { ...r, user: userId })
      }
    }
    return [...map.values()]
  }

  const data = bestPerUser().sort((a,b)=> b.score - a.score).slice(0,20)

  return (
    <div className="leaderboard-wrap">
      <header className="topbar">
        <Link className="back" to="/">← Back</Link>
        <h1 className="brand">Play&Learn</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="username">{username}</div>
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
        <section className="panel">
          <div className="headerline">
            <h2>Leaderboard</h2>
            <div className="controls">
              <label className="label">Category:</label>
              <select value={category} onChange={e=>setCategory(e.target.value)} className="select">
                <option>All</option>
                <option>Physics</option>
                <option>Mathematics</option>
                <option>Computer Science</option>
                <option>Geography</option>
              </select>
              
              <label className="label">Mode:</label>
              <select value={mode} onChange={e=>setMode(e.target.value)} className="select">
                <option>All</option>
                <option value="single">Single</option>
                <option value="multi">Multi</option>
              </select>
              
              <label className="label">Difficulty:</label>
              <select value={diff} onChange={e=>setDiff(e.target.value)} className="select">
                <option>All</option>
                <option>hard</option>
                <option>normal</option>
                <option>easy</option>
              </select>
            </div>
          </div>

          <div className="table">
            <div className="thead">
              <div>Rank</div>
              <div>User</div>
              <div>Category</div>
              <div>Mode</div>
              <div>Score</div>
            </div>

            {loading ? (
              <div className="empty">Loading leaderboard...</div>
            ) : error ? (
              <div className="empty" style={{ color: '#ff6b6b' }}>Error: {error}</div>
            ) : data.length === 0 ? (
              <div className="empty">No records found with current filters</div>
            ) : (
              data.map((row, i)=> (
                <div key={row.id || i} className="row">
                  <div className={`rankBadge ${i===0?'rank1':i===1?'rank2':i===2?'rank3':''}`}>
                    {i+1}
                  </div>
                  <div className={row.user === username ? '' : 'muted'}>{row.user}</div>
                  <div className="muted">{row.category}</div>
                  <div>
                    <span className="mode-pill">
                      {row.mode==='multiplayer' ? '👥 Multi' : '👤 Single'}
                    </span>
                  </div>
                  <div className="score">{row.score}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
