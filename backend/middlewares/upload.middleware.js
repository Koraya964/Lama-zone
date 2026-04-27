// On configure multer pour gérer l'upload des images avec vérification du type et de la taille
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On génère un nom de fichier unique pour éviter les collisions sur le disque
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const nomUnique = `${crypto.randomUUID()}${extension}`;
        cb(null, nomUnique);
    },
});

// On accepte uniquement les formats images courants
const fileFilter = (req, file, cb) => {
    const typesAutorises = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (typesAutorises.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non autorisé. Seuls JPEG, PNG, WEBP et GIF sont acceptés.'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        // On limite à 5 Mo par image pour éviter de saturer le serveur
        fileSize: 5 * 1024 * 1024,
        files: 5,
    },
});
