-- 🧪 Test de vérification du format des options
-- Vérifie que les options ne sont plus double-échappées

-- 1. Voir les dernières questions créées
SELECT 
    id,
    questionText,
    options,
    LENGTH(options) as options_length,
    SUBSTRING(options, 1, 50) as options_preview
FROM questions
ORDER BY id DESC
LIMIT 5;

-- 2. Vérifier le format exact des options
-- Les options doivent ressembler à: ["Option1","Option2","Option3"]
-- PAS à: "\"[\\\"Option1\\\",\\\"Option2\\\",\\\"Option3\\\"]\""

-- 3. Compter les jeux créés aujourd'hui
SELECT 
    COUNT(*) as games_created_today,
    MAX(createdAt) as last_game_time
FROM games
WHERE DATE(createdAt) = CURDATE();

-- 4. Voir les détails du dernier jeu créé
SELECT 
    g.gameId,
    g.title,
    g.type,
    l.id as level_id,
    l.name as level_name,
    COUNT(q.id) as question_count
FROM games g
LEFT JOIN levels l ON g.id = l.gameId
LEFT JOIN questions q ON l.id = q.levelId
WHERE g.id = (SELECT MAX(id) FROM games)
GROUP BY g.gameId, g.title, g.type, l.id, l.name;

-- 5. Format attendu des options (avec UN SEUL échappement):
-- CORRECT ✅: ["Paris","Londres","Berlin","Madrid"]
-- INCORRECT ❌: "\"[\\\"Paris\\\",\\\"Londres\\\",\\\"Berlin\\\",\\\"Madrid\\\"]\""
