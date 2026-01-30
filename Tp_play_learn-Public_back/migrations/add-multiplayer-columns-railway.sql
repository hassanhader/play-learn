-- Migration SQL manuelle pour ajouter les colonnes multiplayer sur Railway
-- À exécuter sur Railway MySQL Dashboard

-- Vérifier la structure actuelle de la table games
DESCRIBE games;

-- Ajouter la colonne isMultiplayer si elle n'existe pas
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS isMultiplayer TINYINT(1) NOT NULL DEFAULT 0 
COMMENT 'Le jeu supporte-t-il le mode multijoueur ?';

-- Ajouter la colonne minPlayers si elle n'existe pas
ALTER TABLE games
ADD COLUMN IF NOT EXISTS minPlayers INT NULL DEFAULT 1;

-- Ajouter la colonne maxPlayers si elle n'existe pas  
ALTER TABLE games  
ADD COLUMN IF NOT EXISTS maxPlayers INT NULL DEFAULT 1;

-- Vérifier que les colonnes ont été ajoutées
DESCRIBE games;

-- Optionnel: Mettre à jour les jeux existants
-- UPDATE games SET isMultiplayer = 0 WHERE isMultiplayer IS NULL;
-- UPDATE games SET minPlayers = 1 WHERE minPlayers IS NULL;
-- UPDATE games SET maxPlayers = 1 WHERE maxPlayers IS NULL;
