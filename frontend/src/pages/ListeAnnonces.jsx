// On affiche ici la liste des annonces avec la barre de filtres horizontale en haut
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { annoncesService } from "../services/index.js";
import CarteAnnonce from "../components/common/CarteAnnonce.jsx";
import FiltresRecherche from "../components/common/FiltresRecherche.jsx";

// Squelette de chargement — on affiche des cartes fantômes pendant la requête
const SqueletteCarte = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
    <div className="aspect-[4/3] bg-gray-100" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-100 rounded-full w-1/3" />
      <div className="h-4 bg-gray-100 rounded-full w-full" />
      <div className="h-4 bg-gray-100 rounded-full w-4/5" />
      <div className="h-5 bg-gray-100 rounded-full w-1/2 mt-2" />
      <div className="flex justify-between pt-2 border-t border-gray-50">
        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
        <div className="h-3 bg-gray-100 rounded-full w-1/4" />
      </div>
    </div>
  </div>
);

const EtatVide = ({ aFiltresActifs, onReset }) => (
  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 text-center gap-4">
    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
      <svg
        className="w-8 h-8 text-gray-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </div>
    <div>
      <p className="font-semibold text-gray-700 mb-1">
        {aFiltresActifs
          ? "Aucun résultat pour ces filtres"
          : "Aucune annonce disponible"}
      </p>
      <p className="text-sm text-gray-400 max-w-xs mx-auto">
        {aFiltresActifs
          ? "Essayez d'élargir votre recherche ou de modifier les filtres."
          : "Revenez bientôt, de nouvelles annonces arrivent chaque jour."}
      </p>
    </div>
    {aFiltresActifs && (
      <button onClick={onReset} className="btn-secondary text-sm">
        Effacer tous les filtres
      </button>
    )}
  </div>
);

const ListeAnnonces = () => {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [filtresActuels, setFiltresActuels] = useState({});
  const [searchParams] = useSearchParams();

  // On initialise les filtres depuis les paramètres URL pour permettre le partage de recherche
  const filtresInitiaux = {
    search: searchParams.get("search") || "",
    categorie_id: searchParams.get("categorie_id") || "",
    prix_min: searchParams.get("prix_min") || "",
    prix_max: searchParams.get("prix_max") || "",
    localisation: searchParams.get("localisation") || "",
    sort: searchParams.get("sort") || "date_desc",
  };

  const chargerAnnonces = useCallback(async (filtres) => {
    setLoading(true);
    setErreur("");
    setFiltresActuels(filtres);
    try {
      const params = Object.fromEntries(
        Object.entries(filtres).filter(([, v]) => v !== "" && v !== null),
      );
      const { data } = await annoncesService.getAll(params);
      setAnnonces(data);
    } catch {
      setErreur("Impossible de charger les annonces. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerAnnonces(filtresInitiaux);
  }, []);

  const handleReset = () => {
    chargerAnnonces({
      search: "",
      categorie_id: "",
      prix_min: "",
      prix_max: "",
      localisation: "",
      sort: "date_desc",
    });
  };

  const aFiltresActifs = Object.entries(filtresActuels).some(
    ([k, v]) => k !== "sort" && v !== "",
  );

  return (
    <div>
      {/* En-tête */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {filtresActuels.search
            ? `Résultats pour "${filtresActuels.search}"`
            : "Toutes les annonces"}
        </h1>
        {!loading && (
          <p className="text-sm text-gray-400">
            {annonces.length} annonce{annonces.length > 1 ? "s" : ""}
            {aFiltresActifs ? " avec ces filtres" : ""}
          </p>
        )}
      </div>

      {/* Barre de filtres horizontale — sticky sous le header */}
      <div className="sticky top-16 z-30 bg-gray-50 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6 border-b border-gray-100">
        <FiltresRecherche
          onFiltresChange={chargerAnnonces}
          filtresInitiaux={filtresInitiaux}
        />
      </div>

      {/* Grille des annonces */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SqueletteCarte key={i} />
          ))}
        </div>
      ) : erreur ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-red-100 text-center gap-3">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm font-medium text-red-600">{erreur}</p>
          <button
            onClick={() => chargerAnnonces(filtresActuels)}
            className="btn-secondary text-sm"
          >
            Réessayer
          </button>
        </div>
      ) : annonces.length === 0 ? (
        <EtatVide aFiltresActifs={aFiltresActifs} onReset={handleReset} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {annonces.map((annonce) => (
            <CarteAnnonce key={annonce.id} annonce={annonce} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListeAnnonces;
