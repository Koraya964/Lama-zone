// On centralise ici la gestion des erreurs pour éviter les répétitions dans les controllers
export const errorHandler = (err, req, res, next) => {
    // On logue l'erreur en mode développement pour faciliter le débogage
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // On ne renvoie pas les détails de l'erreur en production pour des raisons de sécurité
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Une erreur interne est survenue.'
        : err.message || 'Une erreur interne est survenue.';

    res.status(statusCode).json({ message });
};
