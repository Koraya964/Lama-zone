CREATE DATABASE IF NOT EXISTS lamazone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lamazone;

CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL
);

CREATE TABLE annonces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  prix DECIMAL(10,2),
  localisation VARCHAR(150),
  date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  utilisateur_id INT NOT NULL,
  categorie_id INT,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE SET NULL
);

INSERT INTO categories (nom) VALUES
  ('Véhicules'), ('Immobilier'), ('Électronique'),
  ('Mode'), ('Maison & Jardin'), ('Loisirs'), ('Emploi'), ('Services');
