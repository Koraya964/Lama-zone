// On regroupe ici les fonctions utilitaires de formatage utilisées dans plusieurs composants

// On formate un prix en euros selon les conventions françaises
export const formatPrix = (prix) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(prix);
};

// On formate une date ISO en date lisible en français
export const formatDate = (dateISO) => {
    return new Date(dateISO).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

// On formate une date avec l'heure pour la messagerie
export const formatDateHeure = (dateISO) => {
    return new Date(dateISO).toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// On tronque un texte à une longueur maximale pour les aperçus
export const tronquer = (texte, longueurMax = 100) => {
    if (!texte || texte.length <= longueurMax) return texte;
    return `${texte.slice(0, longueurMax).trim()}...`;
};
