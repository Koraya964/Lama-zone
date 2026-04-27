// On gère ici la barre de filtres horizontale style Leboncoin
// Chaque filtre est un bouton qui ouvre un dropdown positionné en absolu
import { useState, useEffect, useRef } from "react";
import { categoriesService } from "../../services/index.js";

const FILTRES_VIDES = {
  search: "",
  categorie_id: "",
  prix_min: "",
  prix_max: "",
  localisation: "",
  sort: "date_desc",
};

const TRIS = [
  { value: "date_desc", label: "Plus récentes" },
  { value: "date_asc", label: "Plus anciennes" },
  { value: "prix_asc", label: "Prix croissant" },
  { value: "prix_desc", label: "Prix décroissant" },
];

const IcôneChevron = ({ ouvert }) => (
  <svg
    className={`w-3.5 h-3.5 transition-transform duration-200 ${ouvert ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const IcôneReset = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// Hook qui ferme le dropdown au clic en dehors
const useClickDehors = (ref, callback) => {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callback();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, callback]);
};

// Bouton de filtre générique avec indicateur actif
const BoutonFiltre = ({
  label,
  actif,
  ouvert,
  onClick,
  children,
  ariaLabel,
}) => {
  const ref = useRef(null);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onClick}
        aria-expanded={ouvert}
        aria-label={ariaLabel || label}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150 whitespace-nowrap
                    ${
                      actif
                        ? "bg-primary-50 border-primary-300 text-primary-700"
                        : ouvert
                          ? "bg-gray-50 border-gray-300 text-gray-900"
                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
      >
        {label}
        {actif && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0"
            aria-hidden="true"
          />
        )}
        <IcôneChevron ouvert={ouvert} />
      </button>

      {/* Dropdown */}
      {ouvert && (
        <div
          className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl border border-gray-150 shadow-xl min-w-[220px] overflow-hidden"
          style={{ borderColor: "#e5e7eb" }}
          role="dialog"
          aria-label={`Options : ${label}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const FiltresRecherche = ({ onFiltresChange, filtresInitiaux = {} }) => {
  const [categories, setCategories] = useState([]);
  const [filtres, setFiltres] = useState({
    ...FILTRES_VIDES,
    ...filtresInitiaux,
  });
  const [ouvert, setOuvert] = useState(null); // 'categorie' | 'prix' | 'localisation' | 'tri'

  const barreRef = useRef(null);

  useEffect(() => {
    categoriesService
      .getAll()
      .then((res) => setCategories(res.data))
      .catch((err) =>
        console.error("Impossible de charger les catégories :", err.message),
      );
  }, []);

  // On ferme tous les dropdowns au clic en dehors de la barre
  useClickDehors(barreRef, () => setOuvert(null));

  const toggle = (nom) => setOuvert((v) => (v === nom ? null : nom));

  const set = (champ, valeur) => {
    const nouveauxFiltres = { ...filtres, [champ]: valeur };
    setFiltres(nouveauxFiltres);
    onFiltresChange(nouveauxFiltres);
  };

  const setMultiple = (obj) => {
    const nouveauxFiltres = { ...filtres, ...obj };
    setFiltres(nouveauxFiltres);
    onFiltresChange(nouveauxFiltres);
  };

  const reset = () => {
    setFiltres(FILTRES_VIDES);
    onFiltresChange(FILTRES_VIDES);
    setOuvert(null);
  };

  const nbFiltresActifs = Object.entries(filtres).filter(
    ([k, v]) => k !== "sort" && v !== "",
  ).length;

  const categorieSelectionnee = categories.find(
    (c) => String(c.id) === filtres.categorie_id,
  );
  const triSelectionne = TRIS.find((t) => t.value === filtres.sort);

  // On formate le label du filtre prix
  const labelPrix = () => {
    if (filtres.prix_min && filtres.prix_max)
      return `${filtres.prix_min} – ${filtres.prix_max} €`;
    if (filtres.prix_min) return `Dès ${filtres.prix_min} €`;
    if (filtres.prix_max) return `Jusqu'à ${filtres.prix_max} €`;
    return "Prix";
  };

  return (
    <div
      ref={barreRef}
      className="flex flex-wrap items-center gap-2"
      role="search"
      aria-label="Filtres de recherche"
    >
      {/* Champ recherche textuelle — toujours visible, pas de dropdown */}
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <label htmlFor="search-inline" className="sr-only">
          Rechercher
        </label>
        <input
          id="search-inline"
          type="search"
          name="search"
          value={filtres.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Rechercher..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 hover:border-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
        />
      </div>

      {/* Catégorie */}
      <BoutonFiltre
        label={categorieSelectionnee ? categorieSelectionnee.nom : "Catégorie"}
        actif={!!filtres.categorie_id}
        ouvert={ouvert === "categorie"}
        onClick={() => toggle("categorie")}
      >
        <div className="p-2 max-h-72 overflow-y-auto">
          <button
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${filtres.categorie_id === "" ? "bg-primary-50 text-primary-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
            onClick={() => {
              set("categorie_id", "");
              setOuvert(null);
            }}
          >
            Toutes les catégories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${filtres.categorie_id === String(cat.id) ? "bg-primary-50 text-primary-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
              onClick={() => {
                set("categorie_id", String(cat.id));
                setOuvert(null);
              }}
            >
              {cat.nom}
            </button>
          ))}
        </div>
      </BoutonFiltre>

      {/* Prix */}
      <BoutonFiltre
        label={labelPrix()}
        actif={!!(filtres.prix_min || filtres.prix_max)}
        ouvert={ouvert === "prix"}
        onClick={() => toggle("prix")}
        ariaLabel="Filtrer par prix"
      >
        <div className="p-4 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Fourchette de prix
          </p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <label htmlFor="prix-min-drop" className="sr-only">
                Prix minimum
              </label>
              <input
                id="prix-min-drop"
                type="number"
                value={filtres.prix_min}
                onChange={(e) => set("prix_min", e.target.value)}
                min="0"
                placeholder="Min"
                className="w-full pr-6 pl-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                €
              </span>
            </div>
            <span className="text-gray-300 text-sm">—</span>
            <div className="relative flex-1">
              <label htmlFor="prix-max-drop" className="sr-only">
                Prix maximum
              </label>
              <input
                id="prix-max-drop"
                type="number"
                value={filtres.prix_max}
                onChange={(e) => set("prix_max", e.target.value)}
                min="0"
                placeholder="Max"
                className="w-full pr-6 pl-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                €
              </span>
            </div>
          </div>
          <button
            onClick={() => setOuvert(null)}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
          >
            Appliquer
          </button>
        </div>
      </BoutonFiltre>

      {/* Localisation */}
      <BoutonFiltre
        label={filtres.localisation || "Localisation"}
        actif={!!filtres.localisation}
        ouvert={ouvert === "localisation"}
        onClick={() => toggle("localisation")}
      >
        <div className="p-4 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Ville ou département
          </p>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <label htmlFor="localisation-drop" className="sr-only">
              Localisation
            </label>
            <input
              id="localisation-drop"
              type="text"
              value={filtres.localisation}
              onChange={(e) => set("localisation", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setOuvert(null)}
              placeholder="Paris, Lyon, 75..."
              autoFocus
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>
          <button
            onClick={() => setOuvert(null)}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
          >
            Appliquer
          </button>
        </div>
      </BoutonFiltre>

      {/* Tri */}
      <BoutonFiltre
        label={triSelectionne?.label || "Trier par"}
        actif={filtres.sort !== "date_desc"}
        ouvert={ouvert === "tri"}
        onClick={() => toggle("tri")}
      >
        <div className="p-2">
          {TRIS.map(({ value, label }) => (
            <button
              key={value}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between gap-4 ${filtres.sort === value ? "bg-gray-100 text-gray-900 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
              onClick={() => {
                set("sort", value);
                setOuvert(null);
              }}
            >
              {label}
              {filtres.sort === value && (
                <svg
                  className="w-4 h-4 text-primary-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </BoutonFiltre>

      {/* Bouton reset — visible uniquement si des filtres sont actifs */}
      {nbFiltresActifs > 0 && (
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl transition-all duration-150 font-medium"
          aria-label={`Effacer les ${nbFiltresActifs} filtre${nbFiltresActifs > 1 ? "s" : ""} actif${nbFiltresActifs > 1 ? "s" : ""}`}
        >
          <IcôneReset />
          {nbFiltresActifs} filtre{nbFiltresActifs > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
};

export default FiltresRecherche;
