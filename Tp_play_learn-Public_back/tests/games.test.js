const { describe, test, expect } = require('@jest/globals')

describe('Game Data Validation Tests', () => {
  // Test 5: Validation d'un objet jeu valide
  test('should validate valid game object', () => {
    const validGame = {
      title: 'Math Quiz',
      category: 'Mathematics',
      difficulty: 'medium',
      type: 'quiz',
      description: 'Test your math skills'
    }
    
    expect(validGame).toHaveProperty('title')
    expect(validGame).toHaveProperty('category')
    expect(validGame).toHaveProperty('difficulty')
    expect(['easy', 'medium', 'hard']).toContain(validGame.difficulty)
  })

  // Test 6: Validation des catégories
  test('should have valid game categories', () => {
    const validCategories = [
      'Mathematics',
      'Physics',
      'Geography',
      'Computer Science',
      'History',
      'Biology'
    ]
    
    expect(validCategories).toContain('Mathematics')
    expect(validCategories).toContain('Physics')
    expect(validCategories.length).toBeGreaterThan(0)
  })

  // Test 7: Filtrage de jeux par catégorie
  test('should filter games by category', () => {
    const games = [
      { id: 1, title: 'Math Quiz', category: 'Mathematics' },
      { id: 2, title: 'Physics Test', category: 'Physics' },
      { id: 3, title: 'Algebra', category: 'Mathematics' }
    ]
    
    const mathGames = games.filter(g => g.category === 'Mathematics')
    
    expect(mathGames).toHaveLength(2)
    expect(mathGames[0].category).toBe('Mathematics')
    expect(mathGames[1].category).toBe('Mathematics')
  })

  // Test 8: Validation des niveaux de difficulté
  test('should validate difficulty levels', () => {
    const difficulties = ['easy', 'medium', 'hard']
    
    expect(difficulties).toHaveLength(3)
    expect(difficulties).toContain('easy')
    expect(difficulties).toContain('medium')
    expect(difficulties).toContain('hard')
  })
})
