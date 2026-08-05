const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'antic_distributeur.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Erreur DB:', err);
  else console.log('✅ Base SQLite connectée');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS info_entreprise (
    champ TEXT PRIMARY KEY,
    valeur TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS numeros (
    table_name TEXT PRIMARY KEY,
    prefix TEXT,
    dernier_numero INTEGER DEFAULT 0,
    format TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom_utilisateur TEXT UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL,
    role TEXT CHECK(role IN ('Administrateur','Vendeur','Comptable','Manager')),
    email TEXT,
    telephone TEXT,
    actif TEXT DEFAULT 'Oui',
    date_creation TEXT,
    derniere_connexion TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    categorie TEXT,
    quantite REAL DEFAULT 0,
    prix_achat REAL DEFAULT 0,
    prix_vente REAL DEFAULT 0,
    seuil_alert INTEGER DEFAULT 0,
    date_ajout TEXT,
    fournisseur TEXT,
    emplacement TEXT,
    image_url TEXT,
    notes TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS barcode (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_produit TEXT NOT NULL,
    code_barre TEXT NOT NULL,
    type TEXT DEFAULT 'EAN-13',
    date_ajout TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    telephone TEXT,
    email TEXT,
    adresse TEXT,
    ville TEXT,
    wilaya TEXT,
    type TEXT CHECK(type IN ('Grossiste','Détaillant')),
    solde REAL DEFAULT 0,
    date_ajout TEXT,
    notes TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS fournisseurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    telephone TEXT,
    email TEXT,
    adresse TEXT,
    ville TEXT,
    wilaya TEXT,
    type TEXT CHECK(type IN ('Principal','Secondaire','Occasionnel')),
    solde REAL DEFAULT 0,
    date_ajout TEXT,
    notes TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ventes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    num_facture TEXT NOT NULL,
    date TEXT,
    code_client TEXT,
    nom_client TEXT,
    code_produit TEXT,
    nom_produit TEXT,
    quantite REAL DEFAULT 0,
    prix_unitaire REAL DEFAULT 0,
    total REAL DEFAULT 0,
    mode_paiement TEXT,
    statut TEXT DEFAULT 'En attente',
    vendeur TEXT,
    montant_paye REAL DEFAULT 0,
    reste REAL DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS achats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    num_bon TEXT NOT NULL,
    date TEXT,
    code_fournisseur TEXT,
    nom_fournisseur TEXT,
    code_produit TEXT,
    nom_produit TEXT,
    quantite REAL DEFAULT 0,
    prix_achat REAL DEFAULT 0,
    total REAL DEFAULT 0,
    mode_paiement TEXT,
    statut TEXT DEFAULT 'En cours',
    responsable TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS depenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    num_depense TEXT NOT NULL,
    date TEXT,
    categorie TEXT,
    description TEXT,
    montant REAL DEFAULT 0,
    mode_paiement TEXT,
    beneficiaire TEXT,
    justificatif TEXT DEFAULT 'Oui',
    statut TEXT DEFAULT 'Payée',
    responsable TEXT
  )`);

  // Données par défaut
  const numeros = [
    ['STOCK', 'PRD', 5, 'PRD{000}'],
    ['CLIENT', 'CLT', 5, 'CLT{000}'],
    ['VENTES', 'FAC', 4, 'FAC-{000}'],
    ['ACHAT', 'BON', 5, 'BON-{000}'],
    ['FOURNISSEUR', 'FRN', 5, 'FRN{000}'],
    ['DEPENSES', 'DEP', 5, 'DEP-{000}'],
    ['USERS', 'USR', 5, 'USR{000}']
  ];
  numeros.forEach(n => {
    db.run(`INSERT OR IGNORE INTO numeros (table_name, prefix, dernier_numero, format) VALUES (?, ?, ?, ?)`, n);
  });

  const entreprise = [
    ['Nom', 'ANTIC Distributeur'],
    ['Adresse', 'Zone Industrielle, Alger'],
    ['Telephone', '0555 00 00 00'],
    ['Email', 'contact@antic-distributeur.com'],
    ['RC', '00/00-0000000A00'],
    ['NIF', '000000000000000'],
    ['NIS', '000000000000000'],
    ['AI', '000000000000000']
  ];
  entreprise.forEach(e => {
    db.run(`INSERT OR IGNORE INTO info_entreprise (champ, valeur) VALUES (?, ?)`, e);
  });

  const hash = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (nom_utilisateur, mot_de_passe, role, email, telephone, actif, date_creation) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`, 
          ['admin', hash, 'Administrateur', 'admin@company.com', '0555000000', 'Oui', '2025-01-01']);

  const hash2 = bcrypt.hashSync('vendeur123', 10);
  db.run(`INSERT OR IGNORE INTO users (nom_utilisateur, mot_de_passe, role, email, telephone, actif, date_creation) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`, 
          ['vendeur1', hash2, 'Vendeur', 'vendeur1@company.com', '0555111111', 'Oui', '2026-01-15']);
});

module.exports = db;
