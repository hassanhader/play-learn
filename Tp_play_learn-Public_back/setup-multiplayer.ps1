# Script de setup backend multijoueur
# Exécuter: .\setup-multiplayer.ps1

Write-Host "🎮 Setup Système Multijoueur - Play&Learn" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier que nous sommes dans le bon dossier
if (-not (Test-Path "models")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis Tp_play_learn-Public_back" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm install socket.io

Write-Host ""
Write-Host "✅ Socket.io installé!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Démarrer le backend: npm run dev" -ForegroundColor White
Write-Host "2. Dans un autre terminal, démarrer le frontend" -ForegroundColor White
Write-Host "3. Se connecter et aller au Lobby" -ForegroundColor White
Write-Host "4. Créer une salle ou rejoindre une existante!" -ForegroundColor White
Write-Host ""
Write-Host "📖 Voir MULTIPLAYER_GUIDE.md pour plus de détails" -ForegroundColor Cyan
