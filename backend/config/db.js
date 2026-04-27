// On configure la connexion à la base de données via un pool pour éviter les connexions orphelines
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On précise le chemin absolu pour que le .env soit trouvé peu importe d'où le serveur est lancé
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// On vérifie que la connexion fonctionne au démarrage
pool.getConnection()
    .then((connection) => {
        console.log('Connexion à la base de données établie.');
        connection.release();
    })
    .catch((err) => {
        console.error('Impossible de se connecter à la base de données :', err.message);
        process.exit(1);
    });

export default pool;