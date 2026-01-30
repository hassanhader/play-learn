/**
 * Test des routes admin
 */
require('dotenv').config()
const axios = require('axios')

const API_URL = 'http://localhost:5000/api'

async function testAdminRoutes() {
  try {
    console.log('🧪 Test des routes admin\n')

    // 1. Se connecter avec un admin
    console.log('1️⃣ Connexion en tant qu\'admin...')
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'larrylalong20@gmail.com',
      password: 'votre_mot_de_passe_ici' // ⚠️ REMPLACER par le vrai mot de passe
    })

    if (!loginResponse.data.success) {
      console.error('❌ Échec de la connexion')
      return
    }

    const token = loginResponse.data.token
    const user = loginResponse.data.user
    console.log('✅ Connecté:', user.username)
    console.log('   isAdmin:', user.isAdmin)
    console.log('   Token:', token.substring(0, 20) + '...\n')

    if (!user.isAdmin) {
      console.error('❌ Cet utilisateur n\'est pas admin')
      return
    }

    // 2. Tester /api/admin/stats
    console.log('2️⃣ Test GET /api/admin/stats')
    const statsResponse = await axios.get(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('✅ Statistiques:', JSON.stringify(statsResponse.data, null, 2))
    console.log()

    // 3. Tester /api/admin/users
    console.log('3️⃣ Test GET /api/admin/users')
    const usersResponse = await axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log(`✅ Utilisateurs: ${usersResponse.data.count} trouvés`)
    console.log()

    // 4. Tester /api/admin/games
    console.log('4️⃣ Test GET /api/admin/games')
    const gamesResponse = await axios.get(`${API_URL}/admin/games`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log(`✅ Jeux: ${gamesResponse.data.count} trouvés`)
    console.log()

    console.log('🎉 Tous les tests ont réussi!')
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message)
  }
}

testAdminRoutes()
