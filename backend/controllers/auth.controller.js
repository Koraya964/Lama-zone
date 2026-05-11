// On gère ici l'inscription, la connexion, le refresh et la déconnexion
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import UtilisateurModel from '../models/utilisateur.model.js';
import RefreshTokenModel from '../models/refreshToken.model.js';

// L'access token est intentionnellement court — 15 minutes
// Si volé, il devient inutile rapidement
const ACCESS_TOKEN_EXPIRY = '15m';

// On génère un access token JWT de courte durée
const genererAccessToken = (utilisateur) =>
    jwt.sign(
        {
            id: utilisateur.id,
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
            email: utilisateur.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

// On pose le refresh token dans un cookie httpOnly inaccessible au JavaScript
// C'est ce qui protège contre le vol via XSS
const poserRefreshTokenCookie = (res, token) => {
    res.cookie('refresh_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en ms
        path: '/api/auth',               // On restreint le cookie aux routes auth uniquement
    });
};

export const register = async (req, res, next) => {
    try {
        const { nom, prenom, email, mot_de_passe } = req.body;

        const existant = await UtilisateurModel.findByEmail(email);
        if (existant) {
            return res.status(409).json({ message: 'Cet email est déjà associé à un compte.' });
        }

        const motDePasseHashe = await argon2.hash(mot_de_passe, { type: argon2.argon2id });
        const id = await UtilisateurModel.create({ nom, prenom, email, mot_de_passe: motDePasseHashe });

        const utilisateur = { id, nom, prenom, email };

        // On crée les deux tokens dès l'inscription pour connecter directement l'utilisateur
        const accessToken = genererAccessToken(utilisateur);
        const refreshToken = RefreshTokenModel.generer();
        await RefreshTokenModel.create(id, refreshToken);

        poserRefreshTokenCookie(res, refreshToken);

        // On renvoie uniquement l'access token dans le body — le refresh token est dans le cookie
        res.status(201).json({ accessToken, utilisateur });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, mot_de_passe } = req.body;

        const utilisateur = await UtilisateurModel.findByEmail(email);
        if (!utilisateur) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        const motDePasseValide = await argon2.verify(utilisateur.mot_de_passe, mot_de_passe);
        if (!motDePasseValide) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        const { id, nom, prenom } = utilisateur;
        const accessToken = genererAccessToken({ id, nom, prenom, email });
        const refreshToken = RefreshTokenModel.generer();
        await RefreshTokenModel.create(id, refreshToken);

        poserRefreshTokenCookie(res, refreshToken);

        res.json({ accessToken, utilisateur: { id, nom, prenom, email } });
    } catch (error) {
        next(error);
    }
};

// On renouvelle l'access token à partir du refresh token dans le cookie
export const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refresh_token;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Session expirée. Veuillez vous reconnecter.' });
        }

        const tokenEnBase = await RefreshTokenModel.findValide(refreshToken);
        if (!tokenEnBase) {
            // On efface le cookie invalide ou expiré pour ne pas laisser de résidu
            res.clearCookie('refresh_token', { path: '/api/auth' });
            return res.status(401).json({ message: 'Session expirée. Veuillez vous reconnecter.' });
        }

        // On fait une rotation du refresh token — l'ancien est invalidé, un nouveau est créé
        // Ça permet de détecter les tentatives de réutilisation d'un token volé
        await RefreshTokenModel.delete(refreshToken);
        const nouveauRefreshToken = RefreshTokenModel.generer();
        await RefreshTokenModel.create(tokenEnBase.utilisateur_id, nouveauRefreshToken);

        const utilisateur = {
            id: tokenEnBase.uid,
            nom: tokenEnBase.nom,
            prenom: tokenEnBase.prenom,
            email: tokenEnBase.email,
        };

        const accessToken = genererAccessToken(utilisateur);
        poserRefreshTokenCookie(res, nouveauRefreshToken);

        res.json({ accessToken, utilisateur });
    } catch (error) {
        next(error);
    }
};

// On invalide le refresh token en base et on efface le cookie
export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refresh_token;

        if (refreshToken) {
            await RefreshTokenModel.delete(refreshToken);
        }

        res.clearCookie('refresh_token', { path: '/api/auth' });
        res.json({ message: 'Déconnexion réussie.' });
    } catch (error) {
        next(error);
    }
};