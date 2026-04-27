// On affiche le résumé d'une annonce — image, prix proéminent, localisation, date relative
import { Link } from "react-router-dom";

// On calcule une date relative lisible plutôt qu'une date absolue
const dateRelative = (dateISO) => {
  const maintenant = new Date();
  const date = new Date(dateISO);
  const diffMs = maintenant - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffJ = Math.floor(diffH / 24);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffJ === 1) return "Hier";
  if (diffJ < 7) return `Il y a ${diffJ} jours`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

const prixFormate = (prix) =>
  Number(prix) === 0
    ? "Gratuit"
    : new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(prix);

const IcôneLieu = () => (
  <svg
    className="w-3 h-3 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IcôneImage = () => (
  <svg
    className="w-8 h-8 text-gray-300"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const CarteAnnonce = ({ annonce }) => {
  const {
    id,
    titre,
    prix,
    localisation,
    date_publication,
    image_principale,
    categorie_nom,
  } = annonce;

  return (
    <Link
      to={`/annonces/${id}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      aria-label={`${titre} — ${prixFormate(prix)}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        {image_principale ? (
          <img
            src={image_principale}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IcôneImage />
          </div>
        )}

        {/* Badge catégorie en overlay sur l'image */}
        <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm">
          {categorie_nom}
        </span>

        {/* Badge "Gratuit" si le prix est 0 */}
        {Number(prix) === 0 && (
          <span className="absolute top-2.5 right-2.5 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            Gratuit
          </span>
        )}
      </div>

      {/* Contenu */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Titre */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
          {titre}
        </h3>

        {/* Prix — élément le plus visible de la carte */}
        <p className="text-lg font-extrabold text-gray-900 mt-auto">
          {prixFormate(prix)}
        </p>

        {/* Métadonnées — localisation + date */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <span className="flex items-center gap-1 text-xs text-gray-400 truncate max-w-[60%]">
            <IcôneLieu />
            <span className="truncate">{localisation}</span>
          </span>
          <time
            dateTime={date_publication}
            className="text-xs text-gray-400 flex-shrink-0"
          >
            {dateRelative(date_publication)}
          </time>
        </div>
      </div>
    </Link>
  );
};

export default CarteAnnonce;
