-- Script de création de la base de données
-- À importer avec : mysql -u root -p < database.sql

CREATE DATABASE IF NOT EXISTS lama_zone CHARACTER SET utf8 COLLATE utf8_unicode_ci;

USE lama_zone;

-- Table des utilisateurs avec informations complètes
CREATE TABLE utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) DEFAULT NULL,
    adresse VARCHAR(255) DEFAULT NULL,
    ville VARCHAR(100) DEFAULT NULL,
    code_postal VARCHAR(10) DEFAULT NULL,
    date_naissance DATE DEFAULT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE
);

-- Table des annonces
CREATE TABLE annonces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    prix DECIMAL(10, 2) NOT NULL,
    localisation VARCHAR(255) NOT NULL,
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    utilisateur_id INT NOT NULL,
    categorie_id INT NOT NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Table des images liées aux annonces
CREATE TABLE images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    annonce_id INT NOT NULL,
    FOREIGN KEY (annonce_id) REFERENCES annonces(id) ON DELETE CASCADE
);

-- Table des messages entre utilisateurs
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contenu TEXT NOT NULL,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expediteur_id INT NOT NULL,
    destinataire_id INT NOT NULL,
    annonce_id INT NOT NULL,
    FOREIGN KEY (expediteur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (destinataire_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (annonce_id) REFERENCES annonces(id) ON DELETE CASCADE
);

-- Table des avis laissés sur les vendeurs
-- Un utilisateur ne peut laisser qu'un seul avis par vendeur
CREATE TABLE avis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note TINYINT NOT NULL CHECK (note BETWEEN 1 AND 5),
    commentaire TEXT DEFAULT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    auteur_id INT NOT NULL,
    vendeur_id INT NOT NULL,
    UNIQUE KEY avis_unique (auteur_id, vendeur_id),
    FOREIGN KEY (auteur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (vendeur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Insertion des catégories de base
INSERT INTO categories (nom) VALUES
    ('Véhicules'),
    ('Immobilier'),
    ('Électronique'),
    ('Ameublement'),
    ('Vêtements'),
    ('Sports & Loisirs'),
    ('Emploi'),
    ('Services'),
    ('Animaux'),
    ('Autres');