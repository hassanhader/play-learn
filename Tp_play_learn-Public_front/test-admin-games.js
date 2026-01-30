// Test rapide de la route /api/admin/games
// Copiez ce code dans la console du navigateur (F12)

async function testAdminGames() {
  console.log('🧪 Testing /api/admin/games...')
  
  // 1. Vérifier le token
  const token = localStorage.getItem('token')
  if (!token) {
    console.error('❌ No token found! Please login first.')
    return
  }
  console.log('✅ Token found')
  
  // 2. Vérifier si admin
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!user.isAdmin) {
    console.error('❌ User is not admin!')
    return
  }
  console.log('✅ User is admin')
  
  // 3. Tester la route
  try {
    const response = await fetch('http://localhost:5000/api/admin/games', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Success!')
      console.log('📊 Response:', data)
      console.log(`🎮 Total games: ${data.count}`)
      console.log('Games:', data.data)
      return data
    } else {
      console.error('❌ Error:', response.status, response.statusText)
      console.error('Details:', data)
    }
  } catch (error) {
    console.error('❌ Request failed:', error)
  }
}

// Exécuter le test
testAdminGames()
