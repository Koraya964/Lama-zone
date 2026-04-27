// Page d'accueil — hero immersif, catégories colorées, dernières annonces, CTA
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { annoncesService, categoriesService } from "../services/index.js";
import CarteAnnonce from "../components/common/CarteAnnonce.jsx";

// Icônes SVG par catégorie, inline pour éviter toute dépendance externe
const ICONES = {
  Véhicules: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v7a2 2 0 0 1-2 2h-2" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
  Immobilier: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Électronique: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Ameublement: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
      <path d="M2 11a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3z" />
      <path d="M4 15v4" />
      <path d="M20 15v4" />
    </svg>
  ),
  Vêtements: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
    </svg>
  ),
  "Sports & Loisirs": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  Emploi: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  ),
  Services: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  Animaux: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
      <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5" />
      <path d="M8 14v.5" />
      <path d="M16 14v.5" />
      <path d="M11.25 16.25h1.5L12 17l-.75-.75z" />
      <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306" />
    </svg>
  ),
  Autres: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  ),
};

const COULEURS = {
  Véhicules: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
  Immobilier: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
  Électronique: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
  Ameublement: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
  Vêtements: "bg-pink-50 text-pink-600 group-hover:bg-pink-100",
  "Sports & Loisirs": "bg-lime-50 text-lime-600 group-hover:bg-lime-100",
  Emploi: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100",
  Services: "bg-orange-50 text-orange-500 group-hover:bg-orange-100",
  Animaux: "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
  Autres: "bg-gray-100 text-gray-500 group-hover:bg-gray-200",
};

const SUGGESTIONS = [
  "Vélo",
  "iPhone",
  "Canapé",
  "Voiture",
  "Appartement",
  "PlayStation",
];

const IcôneRecherche = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const IcôneLieu = () => (
  <svg
    className="w-4 h-4 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SectionTitre = ({ id, children, lien }) => (
  <div className="flex items-center justify-between mb-5">
    <h2 id={id} className="text-xl font-bold text-gray-900">
      {children}
    </h2>
    {lien && (
      <Link
        to={lien}
        className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1 group"
      >
        Voir tout
        <svg
          className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>
    )}
  </div>
);

const Accueil = () => {
  const [annonces, setAnnonces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      annoncesService.getAll({ sort: "date_desc" }),
      categoriesService.getAll(),
    ])
      .then(([a, c]) => {
        setAnnonces(a.data.slice(0, 8));
        setCategories(c.data);
      })
      .catch((err) =>
        console.error("Erreur chargement accueil :", err.message),
      );
  }, []);

  const handleRecherche = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (recherche.trim()) p.set("search", recherche.trim());
    if (localisation.trim()) p.set("localisation", localisation.trim());
    navigate(`/annonces?${p.toString()}`);
  };

  return (
    <div>
      {/* ============================================================ */}
      {/* HERO                                                           */}
      {/* ============================================================ */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-14">
        {/* Fond sombre avec texture de points */}
        <div
          className="absolute inset-0 bg-gray-950"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Halos de couleur — orange centré + un bleu en coin pour la profondeur */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-20 w-[800px] h-[500px] rounded-full opacity-25"
            style={{
              background:
                "radial-gradient(ellipse, #f97316 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute -right-40 top-0 w-96 h-96 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(ellipse, #3b82f6 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-28 flex flex-col items-center text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-white/70 text-xs font-medium px-4 py-1.5 rounded-full mb-7 select-none">
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse"
              aria-hidden="true"
            />
            Plateforme de petites annonces entre particuliers — 100% gratuit
          </div>

          {/* Titre principal — fort et lisible */}
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5 max-w-3xl">
            Achetez, vendez,{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #fb923c, #f97316, #ea580c)",
              }}
            >
              trouvez
            </span>{" "}
            près de chez vous
          </h1>

          <p className="text-white/55 text-lg mb-10 max-w-lg leading-relaxed">
            Des milliers d'annonces de particuliers partout en France. Dépôt
            gratuit, réponse rapide.
          </p>

          {/* Barre de recherche — sans overflow-hidden pour ne pas rogner le bouton */}
          <form
            onSubmit={handleRecherche}
            role="search"
            aria-label="Rechercher une annonce"
            className="w-full max-w-2xl"
          >
            <div
              className={`flex flex-col sm:flex-row items-stretch bg-white rounded-2xl shadow-2xl shadow-black/40 transition-all duration-200 ${focused ? "ring-2 ring-primary-400 ring-offset-3 ring-offset-gray-950" : ""}`}
            >
              {/* Champ mot-clé */}
              <label
                className="flex items-center gap-3 flex-1 px-5 py-4 cursor-text"
                htmlFor="hero-search"
              >
                <span className="text-gray-400 flex-shrink-0">
                  <IcôneRecherche />
                </span>
                <input
                  ref={inputRef}
                  id="hero-search"
                  type="search"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Que recherchez-vous ?"
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-base font-medium min-w-0"
                />
              </label>

              {/* Séparateur desktop */}
              <div
                className="hidden sm:block w-px bg-gray-150 my-4 flex-shrink-0"
                style={{ backgroundColor: "#e5e7eb" }}
                aria-hidden="true"
              />
              {/* Séparateur mobile */}
              <div
                className="sm:hidden mx-5 h-px bg-gray-100"
                aria-hidden="true"
              />

              {/* Champ localisation */}
              <label
                className="flex items-center gap-3 flex-1 px-5 py-4 cursor-text"
                htmlFor="hero-localisation"
              >
                <span className="text-gray-400 flex-shrink-0">
                  <IcôneLieu />
                </span>
                <input
                  id="hero-localisation"
                  type="text"
                  value={localisation}
                  onChange={(e) => setLocalisation(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Ville ou département"
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-base min-w-0"
                />
              </label>

              {/* Bouton — dans un padding pour rester arrondi */}
              <div className="p-2 flex-shrink-0">
                <button
                  type="submit"
                  className="h-full w-full sm:w-auto bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-bold px-7 py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                >
                  <IcôneRecherche className="w-4 h-4" />
                  Rechercher
                </button>
              </div>
            </div>

            {/* Recherches populaires */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-white/35 text-xs self-center font-medium uppercase tracking-wider">
                Tendances
              </span>
              {SUGGESTIONS.map((terme) => (
                <button
                  key={terme}
                  type="button"
                  onClick={() =>
                    navigate(`/annonces?search=${encodeURIComponent(terme)}`)
                  }
                  className="text-xs text-white/65 hover:text-white bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all duration-150 font-medium"
                >
                  {terme}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CATÉGORIES                                                     */}
      {/* ============================================================ */}
      <section className="mb-14" aria-labelledby="titre-categories">
        <SectionTitre id="titre-categories" lien="/annonces">
          Toutes les catégories
        </SectionTitre>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/annonces?categorie_id=${cat.id}`)}
              className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm text-center focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              aria-label={`Voir les annonces ${cat.nom}`}
            >
              <span
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 ${COULEURS[cat.nom] || COULEURS["Autres"]}`}
              >
                {ICONES[cat.nom] || ICONES["Autres"]}
              </span>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 leading-tight transition-colors">
                {cat.nom}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* DERNIÈRES ANNONCES                                             */}
      {/* ============================================================ */}
      <section className="mb-14" aria-labelledby="titre-annonces">
        <SectionTitre id="titre-annonces" lien="/annonces">
          Dernières annonces
        </SectionTitre>

        {annonces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {annonces.map((annonce) => (
              <CarteAnnonce key={annonce.id} annonce={annonce} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-center gap-4">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="13" y2="16" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-1">
                Aucune annonce pour le moment
              </p>
              <p className="text-sm text-gray-400">
                Soyez le premier à publier
              </p>
            </div>
            <Link to="/annonces/nouvelle" className="btn-primary">
              Déposer une annonce
            </Link>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* COMMENT ÇA MARCHE                                              */}
      {/* ============================================================ */}
      <section
        className="mb-14 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        aria-labelledby="titre-comment"
      >
        <div className="px-8 py-10">
          <h2
            id="titre-comment"
            className="text-xl font-bold text-gray-900 text-center mb-10"
          >
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {/* Ligne de connexion entre les étapes sur desktop */}
            <div
              className="hidden sm:block absolute top-7 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gray-100"
              aria-hidden="true"
            />

            {[
              {
                num: "1",
                titre: "Créez votre annonce",
                desc: "Photos, description et prix. Publié en moins de 2 minutes, gratuitement.",
                couleur: "bg-orange-50 text-primary-500 border-orange-100",
              },
              {
                num: "2",
                titre: "Recevez des messages",
                desc: "Les acheteurs vous contactent via la messagerie intégrée et sécurisée.",
                couleur: "bg-blue-50 text-blue-500 border-blue-100",
              },
              {
                num: "3",
                titre: "Concluez la vente",
                desc: "Organisez la rencontre à votre convenance et finalisez la transaction.",
                couleur: "bg-emerald-50 text-emerald-500 border-emerald-100",
              },
            ].map(({ num, titre, desc, couleur }) => (
              <div
                key={num}
                className="relative flex flex-col items-center text-center gap-4"
              >
                <div
                  className={`w-14 h-14 rounded-2xl border ${couleur} flex items-center justify-center text-2xl font-black z-10 bg-white`}
                >
                  {num}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{titre}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA FINAL                                                      */}
      {/* ============================================================ */}
      <section
        className="relative overflow-hidden rounded-2xl mb-4 bg-gray-950"
        aria-labelledby="titre-cta"
      >
        {/* Texture de fond */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Halo orange à gauche */}
        <div
          className="absolute -left-20 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, #f97316, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="text-center sm:text-left">
            <h2 id="titre-cta" className="text-2xl font-black text-white mb-2">
              Prêt à vendre quelque chose ?
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              Rejoignez des milliers de particuliers qui achètent et vendent
              chaque jour. C'est gratuit, sans commission.
            </p>
          </div>

          {/* Deux actions distinctes avec hiérarchie claire */}
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
            <Link
              to="/annonces/nouvelle"
              className="bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-bold px-7 py-3 rounded-xl transition-all duration-150 whitespace-nowrap text-sm"
            >
              Déposer une annonce
            </Link>
            <Link
              to="/inscription"
              className="text-white/70 hover:text-white font-medium text-sm transition-colors underline-offset-2 hover:underline"
            >
              Créer un compte gratuit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Accueil;
