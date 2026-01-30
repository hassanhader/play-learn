import React, { useEffect, useState } from 'react'
import '../styles/history.css'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import scoresService from '../services/scoresService'

export default function History(){
  const { username: authUsername, user, logout } = useAuth()
  const username = authUsername || localStorage.getItem('username') || 'username'
  const navigate = useNavigate()
  
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState(localStorage.getItem('history_filter_category') || 'All')
  const [mode, setMode] = useState(localStorage.getItem('history_filter_mode') || 'All')
  const [diff, setDiff] = useState(localStorage.getItem('history_filter_diff') || 'All')

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login', { replace: true })
    }
  }

  // Fetch scores from API
  useEffect(() => {
    const fetchScores = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const result = await scoresService.getUserScores(user.id)
        
        if (result.success) {
          console.log('✅ Scores loaded:', result.data)
          setScores(result.data || [])
        } else {
          console.error('❌ Failed to load scores:', result.message)
          setError(result.message)
        }
      } catch (err) {
        console.error('❌ Error loading scores:', err)
        setError('Failed to load scores')
      } finally {
        setLoading(false)
      }
    }

    fetchScores()
  }, [user?.id])

  // Save filter preferences
  useEffect(() => {
    localStorage.setItem('history_filter_category', category)
  }, [category])

  useEffect(() => {
    localStorage.setItem('history_filter_mode', mode)
  }, [mode])

  useEffect(() => {
    localStorage.setItem('history_filter_diff', diff)
  }, [diff])

  function matchFilter(r) {
    if (category !== 'All' && r.category !== category) return false
    if (mode !== 'All' && r.mode !== mode) return false
    if (diff !== 'All' && r.difficulty !== diff) return false
    return true
  }

  // Filter and normalize data from API
  const userScores = scores
    .map(s => ({
      ...s,
      category: s.category || 'Uncategorized',
      diff: s.difficulty || 'medium',
      date: s.completedAt ? new Date(s.completedAt).toLocaleString() : new Date().toLocaleString()
    }))
    .filter(matchFilter)
    .sort((a, b) => b.score - a.score)

  return (
    <div className="history-wrap">
      <header className="topbar">
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
            <h2>Personal History</h2>
            <div className="controls">
              <label className="label">Category:</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="select">
                <option>All</option>
                <option>Physics</option>
                <option>Mathematics</option>
                <option>Computer Science</option>
                <option>Geography</option>
              </select>
              
              <label className="label">Mode:</label>
              <select value={mode} onChange={e => setMode(e.target.value)} className="select">
                <option>All</option>
                <option value="single">Single</option>
                <option value="multi">Multi</option>
              </select>
              
              <label className="label">Difficulty:</label>
              <select value={diff} onChange={e => setDiff(e.target.value)} className="select">
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
              <div>Category</div>
              <div>Difficulty</div>
              <div>Mode</div>
              <div>Score</div>
            </div>

            {loading ? (
              <div className="empty">Loading scores...</div>
            ) : error ? (
              <div className="empty" style={{ color: '#ff6b6b' }}>Error: {error}</div>
            ) : userScores.length === 0 ? (
              <div className="empty">No records found with current filters</div>
            ) : (
              userScores.map((row, i) => (
                <div key={row.id || i} className="row">
                  <div className={`rankBadge ${i===0?'rank1':i===1?'rank2':i===2?'rank3':''}`}>
                    {i+1}
                  </div>
                  <div className="muted">{row.category}</div>
                  <div className="muted">{row.diff}</div>
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
      
      <Link className="back" to="/">Back</Link>
    </div>
  )
}