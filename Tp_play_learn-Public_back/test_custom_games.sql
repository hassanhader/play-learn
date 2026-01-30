-- ================================================
-- SCRIPT DE VÉRIFICATION - Play & Learn
-- Test de la création de jeux custom
-- ================================================

-- 🔍 1. VÉRIFIER LES JEUX CUSTOM CRÉÉS
-- ================================================
SELECT 
    gameId,
    title,
    type,
    category,
    difficulty,
    icon,
    timeLimit,
    isEnabled,
    settings,
    createdAt
FROM games 
WHERE gameId LIKE 'custom-%' 
ORDER BY createdAt DESC 
LIMIT 5;

-- 🔍 2. VÉRIFIER LES NIVEAUX CRÉÉS
-- ================================================
SELECT 
    l.id AS level_id,
    l.levelNumber,
    l.name AS level_name,
    l.difficulty,
    l.timeLimit,
    l.order,
    g.gameId,
    g.title AS game_title,
    g.type AS game_type
FROM levels l
JOIN games g ON l.gameId = g.id
WHERE g.gameId LIKE 'custom-%'
ORDER BY g.createdAt DESC, l.order ASC
LIMIT 10;

-- 🔍 3. VÉRIFIER LES QUESTIONS CRÉÉES
-- ================================================
SELECT 
    q.id AS question_id,
    q.type AS question_type,
    q.questionText,
    q.options,
    q.correctAnswer,
    q.points,
    q.order,
    l.levelNumber,
    l.name AS level_name,
    g.gameId,
    g.title AS game_title,
    g.type AS game_type
FROM questions q
JOIN levels l ON q.levelId = l.id
JOIN games g ON l.gameId = g.id
WHERE g.gameId LIKE 'custom-%'
ORDER BY g.createdAt DESC, q.order ASC
LIMIT 20;

-- 🔍 4. COMPTER LES ÉLÉMENTS PAR JEU CUSTOM
-- ================================================
SELECT 
    g.gameId,
    g.title,
    g.type,
    COUNT(DISTINCT l.id) AS levels_count,
    COUNT(DISTINCT q.id) AS questions_count,
    g.createdAt
FROM games g
LEFT JOIN levels l ON l.gameId = g.id
LEFT JOIN questions q ON q.levelId = l.id
WHERE g.gameId LIKE 'custom-%'
GROUP BY g.id, g.gameId, g.title, g.type, g.createdAt
ORDER BY g.createdAt DESC;

-- 🔍 5. VÉRIFIER LE SETTINGS JSON (Quiz)
-- ================================================
SELECT 
    gameId,
    title,
    type,
    JSON_EXTRACT(settings, '$.totalQuestions') AS total_questions,
    JSON_LENGTH(settings, '$.questions') AS questions_in_settings,
    settings
FROM games 
WHERE gameId LIKE 'custom-%' 
AND type = 'quiz'
ORDER BY createdAt DESC 
LIMIT 3;

-- 🔍 6. VÉRIFIER LE SETTINGS JSON (Memory)
-- ================================================
SELECT 
    gameId,
    title,
    type,
    JSON_EXTRACT(settings, '$.memoryConfig.pairCount') AS pair_count,
    JSON_EXTRACT(settings, '$.memoryConfig.elementType') AS element_type,
    settings
FROM games 
WHERE gameId LIKE 'custom-%' 
AND type = 'memory'
ORDER BY createdAt DESC 
LIMIT 3;

-- 🔍 7. VÉRIFIER LE SETTINGS JSON (Math)
-- ================================================
SELECT 
    gameId,
    title,
    type,
    JSON_EXTRACT(settings, '$.mathConfig.operations') AS operations,
    JSON_EXTRACT(settings, '$.mathConfig.numberRange') AS number_range,
    settings
FROM games 
WHERE gameId LIKE 'custom-%' 
AND type = 'math'
ORDER BY createdAt DESC 
LIMIT 3;

-- 🔍 8. VÉRIFIER LES METADATA DES QUESTIONS MEMORY/MATH
-- ================================================
SELECT 
    q.id,
    q.type,
    q.questionText,
    q.metadata,
    g.gameId,
    g.title,
    g.type AS game_type
FROM questions q
JOIN levels l ON q.levelId = l.id
JOIN games g ON l.gameId = g.id
WHERE g.gameId LIKE 'custom-%'
AND q.type IN ('memory_card', 'math_problem')
ORDER BY q.createdAt DESC;

-- 🔍 9. DERNIER JEU CRÉÉ AVEC TOUS LES DÉTAILS
-- ================================================
SELECT 
    g.gameId,
    g.title,
    g.type,
    g.category,
    g.difficulty,
    g.timeLimit,
    g.isEnabled,
    g.icon,
    l.id AS level_id,
    l.levelNumber,
    l.name AS level_name,
    COUNT(q.id) AS questions_count,
    g.settings
FROM games g
LEFT JOIN levels l ON l.gameId = g.id
LEFT JOIN questions q ON q.levelId = l.id
WHERE g.gameId LIKE 'custom-%'
GROUP BY g.id, l.id
ORDER BY g.createdAt DESC
LIMIT 1;

-- 🔍 10. VÉRIFIER LES RELATIONS (INTÉGRITÉ)
-- ================================================
-- Jeux sans niveaux (ne devrait pas arriver)
SELECT 
    g.gameId,
    g.title,
    'No levels' AS issue
FROM games g
LEFT JOIN levels l ON l.gameId = g.id
WHERE g.gameId LIKE 'custom-%'
AND l.id IS NULL;

-- Niveaux sans questions (peut arriver pour des jeux vides)
SELECT 
    l.id AS level_id,
    l.name,
    g.gameId,
    'No questions' AS issue
FROM levels l
JOIN games g ON l.gameId = g.id
LEFT JOIN questions q ON q.levelId = l.id
WHERE g.gameId LIKE 'custom-%'
AND q.id IS NULL;

-- ================================================
-- 🧹 NETTOYAGE (OPTIONNEL - DÉCOMMENTER POUR SUPPRIMER)
-- ================================================

-- ⚠️ ATTENTION: Supprime TOUS les jeux custom et leurs données
-- DÉCOMMENTER les lignes ci-dessous pour nettoyer

/*
DELETE FROM questions 
WHERE levelId IN (
    SELECT l.id FROM levels l
    JOIN games g ON l.gameId = g.id
    WHERE g.gameId LIKE 'custom-%'
);

DELETE FROM levels 
WHERE gameId IN (
    SELECT id FROM games WHERE gameId LIKE 'custom-%'
);

DELETE FROM games 
WHERE gameId LIKE 'custom-%';

SELECT 'All custom games deleted' AS result;
*/

-- ================================================
-- 📊 RÉSUMÉ GLOBAL
-- ================================================
SELECT 
    'Total Custom Games' AS metric,
    COUNT(*) AS value
FROM games 
WHERE gameId LIKE 'custom-%'

UNION ALL

SELECT 
    'Total Custom Levels' AS metric,
    COUNT(*) AS value
FROM levels l
JOIN games g ON l.gameId = g.id
WHERE g.gameId LIKE 'custom-%'

UNION ALL

SELECT 
    'Total Custom Questions' AS metric,
    COUNT(*) AS value
FROM questions q
JOIN levels l ON q.levelId = l.id
JOIN games g ON l.gameId = g.id
WHERE g.gameId LIKE 'custom-%'

UNION ALL

SELECT 
    CONCAT(type, ' Games') AS metric,
    COUNT(*) AS value
FROM games 
WHERE gameId LIKE 'custom-%'
GROUP BY type;
