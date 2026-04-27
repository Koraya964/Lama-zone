// On configure ici le transporteur email et les templates d'envoi
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// On crée le transporteur une seule fois et on le réutilise
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// On envoie une notification au vendeur lorsqu'il reçoit un nouveau message via une annonce
export const sendContactEmail = async ({ destinataire, expediteurNom, annonceTitre, contenu }) => {
    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: destinataire,
        subject: `Nouveau message concernant votre annonce "${annonceTitre}"`,
        html: `
            <p>Bonjour,</p>
            <p><strong>${expediteurNom}</strong> vous a envoyé un message concernant votre annonce <strong>${annonceTitre}</strong> :</p>
            <blockquote style="border-left: 3px solid #ccc; padding-left: 1rem; color: #555;">
                ${contenu}
            </blockquote>
            <p>Connectez-vous à votre compte pour répondre.</p>
        `,
    });
};
