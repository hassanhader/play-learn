-- Script pour ajouter des questions de test au jeu 63 (ddd)
-- À exécuter dans votre base de données MySQL

-- Vérifier si le jeu existe
SELECT * FROM Games WHERE id = 63;

-- Créer un niveau pour ce jeu (si pas déjà existant)
INSERT INTO Levels (gameId, title, difficulty, orderIndex, createdAt, updatedAt)
VALUES (63, 'Niveau 1', 'easy', 1, NOW(), NOW());

-- Récupérer l'ID du niveau créé (remplacer XXX par l'ID retourné)
SET @levelId = LAST_INSERT_ID();

-- Ajouter des questions de test
INSERT INTO Questions (levelId, text, correctAnswer, wrongAnswers, timeLimit, points, createdAt, updatedAt)
VALUES 
(@levelId, 'Quelle est la capitale de la France?', 'Paris', '["Londres", "Berlin", "Madrid"]', 30, 100, NOW(), NOW()),
(@levelId, 'Combien font 2 + 2?', '4', '["3", "5", "6"]', 30, 100, NOW(), NOW()),
(@levelId, 'Quel est le langage de programmation pour le web?', 'JavaScript', '["Python", "Java", "C++"]', 30, 100, NOW(), NOW()),
(@levelId, 'Quelle est la couleur du ciel?', 'Bleu', '["Vert", "Rouge", "Jaune"]', 30, 100, NOW(), NOW()),
(@levelId, 'Combien de jours dans une semaine?', '7', '["5", "6", "8"]', 30, 100, NOW(), NOW());

-- Vérifier les questions créées
SELECT q.* FROM Questions q
JOIN Levels l ON q.levelId = l.id
WHERE l.gameId = 63;

-- Vérifier le nombre total de questions pour ce jeu
SELECT COUNT(*) as totalQuestions FROM Questions q
JOIN Levels l ON q.levelId = l.id
WHERE l.gameId = 63;
