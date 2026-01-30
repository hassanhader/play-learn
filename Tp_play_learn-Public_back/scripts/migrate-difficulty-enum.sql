-- ============================================================================
-- MIGRATION: Mise à jour de la colonne difficulty
-- Date: 2025-12-16
-- Description: Change ENUM('easy','normal','hard','expert') 
--              vers ENUM('easy','medium','hard','expert')
-- ============================================================================

-- ÉTAPE 1: Vérifier la structure actuelle
SELECT 
    TABLE_NAME, 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
    AND COLUMN_NAME = 'difficulty'
    AND TABLE_NAME IN ('Games', 'Scores');

-- ÉTAPE 2: Afficher les valeurs actuelles
SELECT 'Games - Valeurs actuelles:' as info;
SELECT DISTINCT difficulty, COUNT(*) as count FROM Games GROUP BY difficulty;

SELECT 'Scores - Valeurs actuelles:' as info;
SELECT DISTINCT difficulty, COUNT(*) as count FROM Scores GROUP BY difficulty;

-- ÉTAPE 3: Modifier la colonne difficulty dans la table Games
-- Ajouter 'medium' à l'ENUM et retirer 'normal'
ALTER TABLE Games 
MODIFY COLUMN difficulty ENUM('easy', 'medium', 'hard', 'expert') 
NOT NULL DEFAULT 'medium';

-- ÉTAPE 4: Mettre à jour les anciennes valeurs 'normal' vers 'medium'
UPDATE Games 
SET difficulty = 'medium' 
WHERE difficulty = 'normal' OR difficulty = '';

-- ÉTAPE 5: Modifier la colonne difficulty dans la table Levels
-- Ajouter 'medium' à l'ENUM et retirer 'normal'
ALTER TABLE Levels 
MODIFY COLUMN difficulty ENUM('easy', 'medium', 'hard', 'expert') 
NOT NULL;

-- ÉTAPE 5b: Mettre à jour les anciennes valeurs 'normal' vers 'medium' dans Levels
UPDATE Levels 
SET difficulty = 'medium' 
WHERE difficulty = 'normal' OR difficulty = '';

-- ÉTAPE 6: Modifier la colonne difficulty dans la table Scores
-- Ajouter 'expert' à l'ENUM
ALTER TABLE Scores 
MODIFY COLUMN difficulty ENUM('easy', 'medium', 'hard', 'expert') 
NOT NULL DEFAULT 'medium';

-- ÉTAPE 7: Mettre à jour les anciennes valeurs dans Scores si nécessaire
UPDATE Scores 
SET difficulty = 'medium' 
WHERE difficulty NOT IN ('easy', 'medium', 'hard', 'expert') OR difficulty = '';

-- ÉTAPE 8: Vérifier les modifications
SELECT 'Games - Après migration:' as info;
SELECT DISTINCT difficulty, COUNT(*) as count FROM Games GROUP BY difficulty;

SELECT 'Levels - Après migration:' as info;
SELECT DISTINCT difficulty, COUNT(*) as count FROM Levels GROUP BY difficulty;

SELECT 'Scores - Après migration:' as info;
SELECT DISTINCT difficulty, COUNT(*) as count FROM Scores GROUP BY difficulty;

-- ÉTAPE 9: Vérifier la nouvelle structure
SELECT 
    TABLE_NAME, 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
    AND COLUMN_NAME = 'difficulty'
    AND TABLE_NAME IN ('Games', 'Levels', 'Scores');

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
