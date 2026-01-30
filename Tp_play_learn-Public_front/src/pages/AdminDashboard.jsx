import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import './admin.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Fonction pour tronquer le texte
  const truncateText = (text, maxLength) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'stats')
  const [gameTypeTab, setGameTypeTab] = useState(location.state?.gameTypeTab || 'single') // 'single' ou 'multiplayer'
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [games, setGames] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [gameSearchTerm, setGameSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' ou 'grid'
  const [currentPage, setCurrentPage] = useState(1)
  const gamesPerPage = 10
  
  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate('/')
    }
  }, [isAuthenticated, user, navigate])
  
  // Charger les statistiques
  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats()
    } else if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'games') {
      fetchGames()
    }
  }, [activeTab])
  
  const fetchStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setUsers(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchGames = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      console.log('🎮 Fetching games from:', `${API_URL}/admin/games`)
      const response = await axios.get(`${API_URL}/admin/games`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📦 Games response:', response.data)
      
      if (response.data.success) {
        setGames(response.data.data)
        console.log('✅ Games loaded:', response.data.data.length, 'games')
        console.log('🔍 isMultiplayer values:', response.data.data.map(g => ({ 
          title: g.title, 
          isMultiplayer: g.isMultiplayer,
          type: typeof g.isMultiplayer
        })))
      } else {
        const errorMsg = response.data.message || 'Failed to fetch games'
        setError(errorMsg)
        console.error('❌ Failed to fetch games:', errorMsg)
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to connect to server'
      setError(errorMsg)
      console.error('❌ Error fetching games:', error)
      console.error('Error details:', error.response?.data)
    } finally {
      setLoading(false)
    }
  }
  
  const toggleUserAdmin = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `${API_URL}/admin/users/${userId}/toggle-admin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        fetchUsers() // Recharger la liste
      }
    } catch (error) {
      console.error('Error toggling admin:', error)
      alert('Failed to update user')
    }
  }
  
  const deleteUser = async (userId, username) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        fetchUsers() // Recharger la liste
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(error.response?.data?.message || 'Failed to delete user')
    }
  }
  
  const deleteGame = async (gameId, gameTitle) => {
    if (!confirm(`Are you sure you want to delete game "${gameTitle}"?`)) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`${API_URL}/admin/games/${gameId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        alert('Game deleted successfully!')
        fetchGames() // Recharger la liste
      }
    } catch (error) {
      console.error('Error deleting game:', error)
      alert(error.response?.data?.message || 'Failed to delete game')
    }
  }
  
  const toggleGameStatus = async (gameId, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `${API_URL}/admin/games/${gameId}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        // Mettre à jour le jeu localement sans recharger toute la liste
        setGames(prevGames => 
          prevGames.map(game => 
            game.id === gameId 
              ? { ...game, isEnabled: !currentStatus }
              : game
          )
        )
      }
    } catch (error) {
      console.error('Error toggling game status:', error)
      alert(error.response?.data?.message || 'Failed to update game status')
    }
  }
  
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Filtrer et trier les jeux
  const filteredGames = games
    .filter(g => {
      // Filtre par type de jeu (Single/Multiplayer)
      // Convertir en booléen pour gérer les cas où isMultiplayer est une chaîne
      const isMulti = g.isMultiplayer === true || g.isMultiplayer === 'true' || g.isMultiplayer === 1
      
      const matchesGameType = gameTypeTab === 'single' 
        ? !isMulti
        : isMulti
      
      // Debug log
      if (g.title.toLowerCase().includes('multi') || g.title.toLowerCase().includes('dd')) {
        console.log('🔍 Filter debug:', {
          title: g.title,
          isMultiplayer: g.isMultiplayer,
          isMulti,
          gameTypeTab,
          matchesGameType
        })
      }
      
      // Filtre de recherche
      const matchesSearch = g.title.toLowerCase().includes(gameSearchTerm.toLowerCase()) ||
                           g.category.toLowerCase().includes(gameSearchTerm.toLowerCase()) ||
                           (g.description && g.description.toLowerCase().includes(gameSearchTerm.toLowerCase()))
      
      // Filtre par catégorie
      const matchesCategory = categoryFilter === 'all' || g.category === categoryFilter
      
      // Filtre par statut
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && g.isEnabled) ||
                           (statusFilter === 'inactive' && !g.isEnabled)
      
      // Filtre par difficulté (normaliser les valeurs null/undefined à 'medium')
      const gameDifficulty = (g.difficulty || 'medium').toLowerCase()
      const matchesDifficulty = difficultyFilter === 'all' || gameDifficulty === difficultyFilter
      
      return matchesGameType && matchesSearch && matchesCategory && matchesStatus && matchesDifficulty
    })
    .sort((a, b) => {
      // Tri
      switch(sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'category':
          return a.category.localeCompare(b.category)
        case 'plays':
          return (b.playCount || 0) - (a.playCount || 0)
        case 'questions':
          return (b.questionCount || 0) - (a.questionCount || 0)
        case 'difficulty': {
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
          const aDiff = (a.difficulty || 'medium').toLowerCase()
          const bDiff = (b.difficulty || 'medium').toLowerCase()
          return (difficultyOrder[aDiff] || 2) - (difficultyOrder[bDiff] || 2)
        }
        case 'timeLimit':
          return (a.timeLimit || 0) - (b.timeLimit || 0)
        case 'createdAt':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })
  
  // Obtenir les catégories uniques des jeux
  const categories = [...new Set(games.map(g => g.category))].sort()
  
  // Pagination pour les jeux
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage)
  const indexOfLastGame = currentPage * gamesPerPage
  const indexOfFirstGame = indexOfLastGame - gamesPerPage
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame)
  
  // Réinitialiser la page quand on change la recherche ou les filtres
  useEffect(() => {
    setCurrentPage(1)
  }, [gameSearchTerm, categoryFilter, statusFilter, difficultyFilter, sortBy])
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  if (!user?.isAdmin) {
    return null
  }
  
  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <button onClick={() => navigate('/')} className="btn-back">
            ← Back to Home
          </button>
          <h1>🛡️ Admin Dashboard</h1>
        </div>
        <div className="admin-header-right">
          <span className="admin-badge">Admin: {user.username}</span>
        </div>
      </header>
      
      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users Management
        </button>
        <button 
          className={`tab ${activeTab === 'games' ? 'active' : ''}`}
          onClick={() => setActiveTab('games')}
        >
          🎮 Game Manager
        </button>
      </div>
      
      {/* Content */}
      <div className="admin-content">
        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {/* Statistics Tab */}
            {activeTab === 'stats' && stats && (
              <div className="stats-container">
                <h2>Platform Overview</h2>
                
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                      <h3>{stats.overview.totalUsers}</h3>
                      <p>Total Users</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">🎮</div>
                    <div className="stat-info">
                      <h3>{stats.overview.totalGames}</h3>
                      <p>Total Games</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-info">
                      <h3>{stats.overview.totalScores}</h3>
                      <p>Total Scores</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">🛡️</div>
                    <div className="stat-info">
                      <h3>{stats.overview.adminUsers}</h3>
                      <p>Admin Users</p>
                    </div>
                  </div>
                </div>
                
                <div className="stats-details">
                  <div className="stats-section">
                    <h3>🔥 Top Games</h3>
                    <div className="top-games-list">
                      {stats.topGames.map(game => (
                        <div key={game.id} className="top-game-item">
                          <span className="game-icon">{game.icon}</span>
                          <div className="game-info">
                            <h4>{game.title}</h4>
                            <p>{game.category}</p>
                          </div>
                          <span className="game-plays">{game.playCount} plays</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="stats-section">
                    <h3>🏅 Top Players</h3>
                    <div className="top-players-list">
                      {stats.topPlayers.map((player, index) => (
                        <div key={player.id} className="top-player-item">
                          <span className="player-rank">#{index + 1}</span>
                          <div className="player-info">
                            <h4>{player.username}</h4>
                            <p>{player.gamesPlayed} games</p>
                          </div>
                          <span className="player-score">{player.totalScore} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Users Management Tab */}
            {activeTab === 'users' && (
              <div className="users-container">
                <div className="users-header">
                  <h2>Users Management</h2>
                  <input 
                    type="text"
                    placeholder="🔍 Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Joined</th>
                        <th>Games Played</th>
                        <th>Best Score</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>
                            <span className="user-username">{user.username}</span>
                          </td>
                          <td>{user.email}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>{user.stats.totalGames}</td>
                          <td>{user.stats.bestScore}</td>
                          <td>
                            <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                              {user.isAdmin ? '🛡️ Admin' : '👤 User'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                onClick={() => toggleUserAdmin(user.id)}
                                className="btn-toggle-admin"
                                title={user.isAdmin ? 'Remove admin' : 'Make admin'}
                              >
                                {user.isAdmin ? '⬇️' : '⬆️'}
                              </button>
                              <button 
                                onClick={() => deleteUser(user.id, user.username)}
                                className="btn-delete"
                                title="Delete user"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Game Manager Tab */}
            {activeTab === 'games' && (
              <div className="games-container">
                <div className="games-header">
                  <h2>Game Manager</h2>
                  <div className="games-header-actions">
                    <input 
                      type="text"
                      placeholder="🔍 Search games..."
                      value={gameSearchTerm}
                      onChange={(e) => setGameSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <div className="view-toggle">
                      <button 
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List view"
                      >
                        ☰
                      </button>
                      <button 
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid view"
                      >
                        ⊞
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-tabs: Single / Multiplayer */}
                <div className="game-type-tabs">
                  <button
                    className={`game-type-tab ${gameTypeTab === 'single' ? 'active' : ''}`}
                    onClick={() => setGameTypeTab('single')}
                  >
                    🎮 Jeux Solo
                  </button>
                  <button
                    className={`game-type-tab ${gameTypeTab === 'multiplayer' ? 'active' : ''}`}
                    onClick={() => setGameTypeTab('multiplayer')}
                  >
                    👥 Jeux Multiplayer
                  </button>
                </div>

                {/* Create Game Button - Changes based on active tab */}
                <div className="create-game-section">
                  {gameTypeTab === 'single' ? (
                    <button 
                      onClick={() => navigate('/create-game')}
                      className="btn-create-game"
                    >
                      ➕ Créer un Jeu Solo
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate('/create-multiplayer-game-full')}
                      className="btn-create-game multiplayer"
                    >
                      ➕ Créer un Jeu Multiplayer
                    </button>
                  )}
                </div>
                
                {/* Filtres avancés */}
                <div className="games-filters">
                  <div className="filter-group">
                    <label htmlFor="category-filter">📂 Category:</label>
                    <select 
                      id="category-filter"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label htmlFor="status-filter">⚡ Status:</label>
                    <select 
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label htmlFor="difficulty-filter">🎯 Difficulty:</label>
                    <select 
                      id="difficulty-filter"
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label htmlFor="sort-by">📊 Sort by:</label>
                    <select 
                      id="sort-by"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="filter-select"
                    >
                      <option value="createdAt">Newest First</option>
                      <option value="title">Title (A-Z)</option>
                      <option value="category">Category</option>
                      <option value="difficulty">Difficulty</option>
                      <option value="timeLimit">Time Limit</option>
                      <option value="plays">Most Played</option>
                      <option value="questions">Most Questions</option>
                    </select>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setGameSearchTerm('')
                      setCategoryFilter('all')
                      setStatusFilter('all')
                      setDifficultyFilter('all')
                      setSortBy('createdAt')
                    }}
                    className="btn-reset-filters"
                    title="Reset all filters"
                  >
                    🔄 Reset
                  </button>
                </div>
                
                {/* Compteur de résultats */}
                {!loading && !error && games.length > 0 && (
                  <div className="games-results-info">
                    <span className="results-count">
                      Showing {currentGames.length} of {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
                      {filteredGames.length !== games.length && ` (${games.length} total)`}
                    </span>
                  </div>
                )}
                
                {/* Vue Liste ou Grille */}
                {loading ? (
                  <div className="no-games">
                    <p>Loading games...</p>
                  </div>
                ) : error ? (
                  <div className="no-games" style={{color: '#ff6b7a'}}>
                    <p>❌ Error: {error}</p>
                    <button 
                      onClick={fetchGames}
                      style={{
                        marginTop: '15px',
                        padding: '10px 20px',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      🔄 Retry
                    </button>
                  </div>
                ) : filteredGames.length === 0 ? (
                  <div className="no-games">
                    <p>No games found. Click "Create Game" to add one!</p>
                  </div>
                ) : viewMode === 'list' ? (
                  /* Vue Liste */
                  <div className="games-list">
                    <table className="games-table">
                      <thead>
                        <tr>
                          <th>Icon</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Difficulty</th>
                          <th>Time</th>
                          <th>Questions</th>
                          <th>Levels</th>
                          <th>Plays</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentGames.map(game => (
                          <tr key={game.id}>
                            <td className="game-icon-cell">{game.icon}</td>
                            <td className="game-title-cell">
                              <strong title={game.title}>{game.title}</strong>
                              <small title={game.gameId}>{game.gameId}</small>
                            </td>
                            <td title={game.category}>{game.category}</td>
                            <td>
                              <span className={`difficulty-badge diff-${(game.difficulty || 'medium').toLowerCase()}`}>
                                {(game.difficulty || 'medium').toUpperCase()}
                              </span>
                            </td>
                            <td className="text-center">
                              {game.timeLimit ? `${game.timeLimit}s` : '∞'}
                            </td>
                            <td className="text-center">{game.questionCount || 0}</td>
                            <td className="text-center">{game.levelCount || 0}</td>
                            <td className="text-center">{game.playCount || 0}</td>
                            <td>
                              <button
                                onClick={() => toggleGameStatus(game.id, game.isEnabled)}
                                className={`btn-toggle-status ${game.isEnabled ? 'active' : 'inactive'}`}
                                title={game.isEnabled ? 'Click to deactivate' : 'Click to activate'}
                              >
                                {game.isEnabled ? '✅ Active' : '❌ Inactive'}
                              </button>
                            </td>
                            <td>{new Date(game.createdAt).toLocaleDateString()}</td>
                            <td className="actions-cell">
                              {/* Pour les jeux Single: afficher tous les boutons */}
                              {gameTypeTab === 'single' && (
                                <>
                                  <button 
                                    onClick={() => navigate(`/game/${game.gameId}`)}
                                    className="btn-play-small"
                                    title="Play game"
                                  >
                                    🎮
                                  </button>
                                  <button 
                                    onClick={() => alert('Fonctionnalité en cours de développement')}
                                    className="btn-edit-small"
                                    title="Edit game (en développement)"
                                  >
                                    ✏️
                                  </button>
                                </>
                              )}
                              {/* Pour tous les jeux: afficher le bouton Delete */}
                              <button 
                                onClick={() => deleteGame(game.id, game.title)}
                                className="btn-delete-small"
                                title="Delete game"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Vue Grille */
                  <div className="games-grid">
                    {currentGames.map(game => (
                      <div key={game.id} className="game-card" style={{ position: 'relative' }}>
                        <span className={`game-status ${game.isEnabled ? 'active' : 'inactive'}`}>
                          {game.isEnabled ? '✅' : '❌'}
                        </span>
                        
                        <div className="game-card-header">
                          <span className="game-icon-large">{game.icon}</span>
                        </div>
                        
                        <div className="game-card-body">
                          <h3 title={game.title}>{truncateText(game.title, 15)}</h3>
                          <p className="game-category" title={game.category}>{truncateText(game.category, 15)}</p>
                          <p className="game-description" title={game.description}>{truncateText(game.description, 15)}</p>
                          
                          <div className="game-meta-row">
                            <span className={`difficulty-badge diff-${(game.difficulty || 'medium').toLowerCase()}`}>
                              {(game.difficulty || 'medium').toUpperCase()}
                            </span>
                            <span className="time-badge">
                              ⏱️ {game.timeLimit ? `${game.timeLimit}s` : 'Unlimited'}
                            </span>
                          </div>
                          
                          <div className="game-stats-row">
                            <div className="game-stat">
                              <span className="stat-label">Questions</span>
                              <span className="stat-value">{game.questionCount || 0}</span>
                            </div>
                            <div className="game-stat">
                              <span className="stat-label">Plays</span>
                              <span className="stat-value">{game.playCount || 0}</span>
                            </div>
                            <div className="game-stat">
                              <span className="stat-label">Created</span>
                              <span className="stat-value">
                                {new Date(game.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="game-card-footer">
                          {/* Pour les jeux Single: afficher tous les boutons */}
                          {gameTypeTab === 'single' && (
                            <>
                              <button 
                                onClick={() => navigate(`/game/${game.gameId}`)}
                                className="btn-play-game"
                              >
                                🎮 Play
                              </button>
                              <button 
                                onClick={() => alert('Fonctionnalité en cours de développement')}
                                className="btn-edit-game"
                              >
                                ✏️ Edit
                              </button>
                            </>
                          )}
                          {/* Pour tous les jeux: afficher le bouton Delete */}
                          <button 
                            onClick={() => deleteGame(game.id, game.title)}
                            className="btn-delete-game"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {filteredGames.length > 0 && totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      ← Previous
                    </button>
                    
                    <div className="pagination-numbers">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1
                        // Afficher seulement quelques pages autour de la page courante
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                            >
                              {pageNumber}
                            </button>
                          )
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return <span key={pageNumber} className="pagination-dots">...</span>
                        }
                        return null
                      })}
                    </div>
                    
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
