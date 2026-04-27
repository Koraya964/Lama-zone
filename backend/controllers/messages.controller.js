// On gère ici l'envoi et la consultation des messages
import MessageModel from '../models/message.model.js';
import AnnonceModel from '../models/annonce.model.js';
import { sendContactEmail } from '../config/mailer.js';

// On retourne la liste des conversations de l'utilisateur connecté
export const getConversations = async (req, res, next) => {
    try {
        const conversations = await MessageModel.findConversations(req.utilisateur.id);
        res.json(conversations);
    } catch (error) {
        next(error);
    }
};

// On retourne les messages échangés avec un interlocuteur donné sur une annonce précise
export const getMessages = async (req, res, next) => {
    try {
        const { annonce_id, interlocuteur_id } = req.query;
        const messages = await MessageModel.findByConversation(
            annonce_id,
            req.utilisateur.id,
            interlocuteur_id
        );
        res.json(messages);
    } catch (error) {
        next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { contenu, annonce_id, destinataire_id } = req.body;
        const expediteur_id = req.utilisateur.id;

        // On récupère l'annonce pour valider qu'elle existe et obtenir le vendeur si besoin
        const annonce = await AnnonceModel.findById(annonce_id);
        if (!annonce) {
            return res.status(404).json({ message: 'Annonce introuvable.' });
        }

        // On détermine le destinataire :
        // - si fourni explicitement (depuis la messagerie), on l'utilise directement
        // - sinon on prend le propriétaire de l'annonce (première prise de contact depuis la page annonce)
        const idDestinataire = destinataire_id ? parseInt(destinataire_id) : annonce.utilisateur_id;

        if (expediteur_id === idDestinataire) {
            return res.status(400).json({ message: 'Vous ne pouvez pas vous envoyer un message.' });
        }

        const messageId = await MessageModel.create({
            contenu,
            expediteur_id,
            destinataire_id: idDestinataire,
            annonce_id,
        });

        // On envoie un email de notification de manière asynchrone sans bloquer la réponse
        sendContactEmail({
            destinataire: annonce.utilisateur_email,
            expediteurNom: req.utilisateur.nom,
            annonceTitre: annonce.titre,
            contenu,
        }).catch((err) => console.error('Erreur envoi email de notification :', err.message));

        res.status(201).json({ id: messageId, message: 'Message envoyé.' });
    } catch (error) {
        next(error);
    }
};