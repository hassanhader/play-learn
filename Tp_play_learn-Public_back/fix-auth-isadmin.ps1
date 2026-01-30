# Script pour ajouter isAdmin dans les réponses d'authController.js
$filePath = "d:\MES DOSSIERS PERSONNELS\Documents personnels\Dossiers d'études\Trois rivierres\cours\SESSION D'AUTOMNE 2025\INF1011-00\TP\Tp_play_learn-Public_front\Tp_play_learn-Public_back\controllers\authController.js"

# Lire le fichier
$content = Get-Content $filePath -Raw

# Pattern pour trouver et remplacer
$pattern = 'isGuest: user\.isGuest,`n\s+isAdmin: user\.isAdmin \|\| false'
$replacement = @"
isGuest: user.isGuest,
        isAdmin: user.isAdmin || false
"@

# Remplacer
$content = $content -replace $pattern, $replacement

# Sauvegarder
$content | Set-Content $filePath -NoNewline

Write-Host "✅ authController.js mis à jour avec isAdmin" -ForegroundColor Green
