// On retourne simplement la liste des catégories disponibles
import CategorieModel from '../models/categorie.model.js';

export const getCategories = async (req, res, next) => {
    try {
        const categories = await CategorieModel.findAll();
        res.json(categories);
    } catch (error) {
        next(error);
    }
};
