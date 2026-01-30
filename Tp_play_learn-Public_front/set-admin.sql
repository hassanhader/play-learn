-- Script pour configurer le premier administrateur
-- Exécutez ce script dans votre base de données MySQL après avoir redémarré le backend

-- Option 1: Définir un utilisateur spécifique comme admin par son ID
-- Remplacez '1' par l'ID de l'utilisateur que vous voulez promouvoir admin
UPDATE users SET isAdmin = 1 WHERE id = 1;

-- Option 2: Définir un utilisateur comme admin par son username
-- Remplacez 'votre_username' par le username de votre choix
-- UPDATE users SET isAdmin = 1 WHERE username = 'votre_username';

-- Option 3: Définir un utilisateur comme admin par son email
-- Remplacez 'votre@email.com' par l'email de votre choix
-- UPDATE users SET isAdmin = 1 WHERE email = 'votre@email.com';

-- Vérifier les administrateurs actuels
SELECT id, username, email, isAdmin, createdAt 
FROM users 
WHERE isAdmin = 1;

-- Voir tous les utilisateurs avec leur statut admin
SELECT id, username, email, isAdmin, createdAt 
FROM users 
ORDER BY isAdmin DESC, createdAt ASC;
