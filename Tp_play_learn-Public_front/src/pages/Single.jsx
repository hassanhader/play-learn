import React, { useEffect, useState } from 'react'
import '../styles/single.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { CATEGORIES, DIFFICULTY_LEVELS } from '../games/gameConfig'
import gamesService from '../services/gamesService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Single(){
  const navigate = useNavigate()
  const location = useLocation()
  
  // Fonction pour tronquer le texte
  const truncateText = (text, maxLength) => {
    if (!text) return 'No description';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  // Si une catégorie est passée depuis MainMenu, on la présélectionne
  const initialCategory = location.state?.category || 'all'
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [allGames, setAllGames] = useState([])
  const [sortBy, setSortBy] = useState('title')
  const [viewMode, setViewMode] = useState('list') // 'list' ou 'grid'
  const [currentPage, setCurrentPage] = useState(1)
  const gamesPerPage = 10
  const [userStats, setUserStats] = useState({ totalGames: 0, totalScore: 0, avgScore: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Charger les statistiques utilisateur
  useEffect(() => {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]')
    const singleGames = scores.filter(s => s.mode === 'single')
    
    if (singleGames.length > 0) {
      const totalScore = singleGames.reduce((sum, game) => sum + game.score, 0)
      setUserStats({
        totalGames: singleGames.length,
        totalScore: totalScore,
        avgScore: Math.round(totalScore / singleGames.length)
      })
    }
  }, [])

  // Charger les jeux depuis l'API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await gamesService.getAllGames({ _t: Date.now() })
        
        if (response.success) {
          setAllGames(response.data)
          console.log('✅ Games loaded from API:', response.data.length, 'games')
        } else {
          setError('Failed to load games')
          console.error('Error loading games:', response.message)
        }
      } catch (err) {
        setError('Failed to connect to server')
        console.error('Error fetching games:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  // Filtrer et trier les jeux
  const filteredGames = allGames
    .filter(g => {
      // ✅ EXCLURE les jeux multiplayer (ne montrer QUE les jeux single-player)
      const isMulti = g.isMultiplayer === true || g.isMultiplayer === 'true' || g.isMultiplayer === 1
      const isSinglePlayer = !isMulti
      
      // Filtre de recherche
      const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
      
      // Filtre par catégorie
      const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory
      
      // Filtre par statut (seulement les jeux actifs pour les joueurs)
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'active' && g.isEnabled) ||
                           (selectedStatus === 'inactive' && !g.isEnabled)
      
      // Filtre par difficulté
      const gameDifficulty = (g.difficulty || 'medium').toLowerCase()
      const matchesDifficulty = selectedDifficulty === 'all' || gameDifficulty === selectedDifficulty
      
      return isSinglePlayer && matchesSearch && matchesCategory && matchesStatus && matchesDifficulty
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'category':
          return a.category.localeCompare(b.category)
        case 'difficulty': {
          const diffOrder = { easy: 1, medium: 2, normal: 2, hard: 3, expert: 4 }
          return (diffOrder[a.difficulty] || 2) - (diffOrder[b.difficulty] || 2)
        }
        case 'plays':
          return (b.playCount || 0) - (a.playCount || 0)
        case 'questions':
          return (b.questionCount || 0) - (a.questionCount || 0)
        case 'timeLimit':
          return (a.timeLimit || 0) - (b.timeLimit || 0)
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt)
        default:
          return 0
      }
    })

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedDifficulty, selectedStatus, searchQuery, sortBy])

  // Pagination
  const indexOfLastGame = currentPage * gamesPerPage
  const indexOfFirstGame = indexOfLastGame - gamesPerPage
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame)
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Générer les numéros de page avec logique intelligente
  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  function clearFilters() {
    setSelectedCategory('all')
    setSelectedDifficulty('all')
    setSelectedStatus('all')
    setSearchQuery('')
    setSortBy('title')
  }

  function startGame(gameId) {
    navigate(`/game/${gameId}`)
  }

  return (
    <div className="single-wrap">
      <header className="topbar">
        <button className="back" onClick={()=>navigate('/')}>← Back</button>
        <h1 className="brand">Single Player</h1>
      </header>

      <main className="wrap">
        {/* User Stats Banner */}
        {userStats.totalGames > 0 && (
          <div className="stats-banner">
            <div className="stat-box">
              <span className="stat-icon">🎮</span>
              <div>
                <span className="stat-label">Games Played</span>
                <span className="stat-value">{userStats.totalGames}</span>
              </div>
            </div>
            <div className="stat-box">
              <span className="stat-icon">🏆</span>
              <div>
                <span className="stat-label">Total Score</span>
                <span className="stat-value">{userStats.totalScore}</span>
              </div>
            </div>
            <div className="stat-box">
              <span className="stat-icon">📊</span>
              <div>
                <span className="stat-label">Average Score</span>
                <span className="stat-value">{userStats.avgScore}</span>
              </div>
            </div>
          </div>
        )}

        <section className="panel">
          {/* Search and View Toggle */}
          <div className="games-header">
            <div className="search-container">
              <input
                type="text"
                placeholder="🔍 Search games by title, category or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                ☰
              </button>
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                ⊞
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="games-filters">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="title">Sort by Title</option>
              <option value="category">Sort by Category</option>
              <option value="difficulty">Sort by Difficulty</option>
              <option value="plays">Sort by Plays</option>
              <option value="questions">Sort by Questions</option>
              <option value="timeLimit">Sort by Time</option>
              <option value="createdAt">Sort by Date</option>
            </select>

            <button onClick={clearFilters} className="reset-filters-btn">
              🔄 Reset
            </button>
          </div>

          {/* Games Count */}
          <div className="games-count">
            Showing {currentGames.length} of {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="loading-state">
              <p>⏳ Loading games...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="error-state">
              <p>❌ {error}</p>
              <button onClick={() => window.location.reload()} className="retry-btn">
                🔄 Retry
              </button>
            </div>
          )}

          {/* Games Display */}
          {!loading && !error && (
            <>
              {filteredGames.length === 0 ? (
                <div className="no-games-found">
                  <p>😔 No games found with these filters</p>
                  <button onClick={clearFilters} className="clear-btn">Clear Filters</button>
                </div>
              ) : (
                <>
                  {viewMode === 'list' ? (
                    /* Vue Liste - Tableau */
                    <div className="games-list-table">
                      <table className="games-table">
                        <thead>
                          <tr>
                            <th>Icon</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Difficulty</th>
                            <th>Time</th>
                            <th>Questions</th>
                            <th>Plays</th>
                            {/* <th>Status</th> */}
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentGames.map(game => (
                            <tr key={game.id}>
                              <td className="text-center game-icon-cell">{game.icon}</td>
                              <td className="game-title-cell" title={game.title} style={{
                                maxWidth: '250px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {truncateText(game.title, 15)}
                              </td>
                              <td>{game.category}</td>
                              <td>
                                <span className={`difficulty-badge diff-${(game.difficulty || 'medium').toLowerCase()}`}>
                                  {(game.difficulty || 'medium').toUpperCase()}
                                </span>
                              </td>
                              <td className="text-center">{game.timeLimit || 'N/A'}s</td>
                              <td className="text-center">{game.questionCount || 0}</td>
                              <td className="text-center">{game.playCount || 0}</td>
                              {/* <td>
                                <span className={`game-status ${game.isEnabled ? 'active' : 'inactive'}`}>
                                  {game.isEnabled ? '✅ Active' : '❌ Inactive'}
                                </span>
                              </td> */}
                              <td className="actions-cell">
                                <button 
                                  onClick={() => startGame(game.gameId || game.id)}
                                  className="btn-play"
                                  title="Play this game"
                                >
                                  🎮 Play
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
                        <div key={game.id} className="game-card">
                          <div className="game-card-header">
                            <span className="game-icon-large">{game.icon}</span>
                          </div>
                          
                          <div className="game-card-body">
                            <h3 title={game.title} style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              maxHeight: '56px',
                              lineHeight: '1.3',
                              wordBreak: 'break-word'
                            }}>
                              {truncateText(game.title, 15)}
                            </h3>
                            <p className="game-category" title={game.category}>{game.category}</p>
                            <p className="game-description" title={game.description || 'No description'} style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              maxHeight: '71px',
                              lineHeight: '1.7',
                              wordBreak: 'break-word'
                            }}>
                              {truncateText(game.description, 15)}
                            </p>
                            
                            <div className="game-meta">
                              <span className={`difficulty-badge diff-${(game.difficulty || 'medium').toLowerCase()}`}>
                                {(game.difficulty || 'medium').toUpperCase()}
                              </span>
                              <span className="game-time">⏱️ {game.timeLimit || 'N/A'}s</span>
                            </div>
                            
                            <div className="game-stats">
                              <span>🎯 {game.questionCount || 0} Questions</span>
                              <span>👥 {game.playCount || 0} Plays</span>
                            </div>
                          </div>
                          
                          <div className="game-card-footer">
                            <button 
                              onClick={() => startGame(game.gameId || game.id)}
                              className="btn-play-card"
                            >
                              🎮 Play Game
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        onClick={() => paginate(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="pagination-btn"
                      >
                        ← Previous
                      </button>
                      
                      <div className="pagination-numbers">
                        {getPageNumbers().map((page, index) => (
                          page === '...' ? (
                            <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => paginate(page)}
                              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                            >
                              {page}
                            </button>
                          )
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => paginate(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}
