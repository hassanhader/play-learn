-- Migration: Add multiplayer fields to Games table
-- Run this manually on Railway database if needed

-- Add isMultiplayer column if it doesn't exist
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS isMultiplayer BOOLEAN NOT NULL DEFAULT false 
COMMENT 'Le jeu supporte-t-il le mode multijoueur ?';

-- Add minPlayers column if it doesn't exist
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS minPlayers INTEGER DEFAULT 1 
CHECK (minPlayers >= 1 AND minPlayers <= 10);

-- Add maxPlayers column if it doesn't exist
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS maxPlayers INTEGER DEFAULT 1 
CHECK (maxPlayers >= 1 AND maxPlayers <= 10);

-- Verify the changes
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'games' 
AND COLUMN_NAME IN ('isMultiplayer', 'minPlayers', 'maxPlayers');
