-- Script SQL pour promouvoir un utilisateur en administrateur
-- Exécutez ce fichier dans MySQL Workbench, phpMyAdmin ou en ligne de commande

-- Voir tous les utilisateurs actuels
SELECT id, username, email, isAdmin, createdAt 
FROM users 
ORDER BY id;

-- Option 1: Promouvoir l'utilisateur ID 2 (larrylalong20@gmail.com) en admin
UPDATE users SET isAdmin = 1 WHERE id = 2;

-- Option 2: Promouvoir un utilisateur par son username
-- UPDATE users SET isAdmin = 1 WHERE username = 'votre_username';

-- Option 3: Promouvoir un utilisateur par son email
-- UPDATE users SET isAdmin = 1 WHERE email = 'votre@email.com';

-- Vérifier les administrateurs
SELECT id, username, email, isAdmin 
FROM users 
WHERE isAdmin = 1;

-- Statistiques
SELECT 
    COUNT(*) as total_users,
    SUM(isAdmin = 1) as total_admins,
    SUM(isGuest = 1) as total_guests
FROM users;
