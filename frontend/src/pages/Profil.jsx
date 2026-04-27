// On gère ici la modification du profil complet, du mot de passe et la suppression du compte
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { utilisateursService } from "../services/index.js";

// On affiche les étoiles d'une note sous forme visuelle
const Etoiles = ({ note, taille = "sm" }) => {
  const classes = taille === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className="flex gap-0.5" aria-label={`Note : ${note} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`${classes} ${i <= note ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
};

const Profil = () => {
  const { utilisateur, login, logout } = useAuth();
  const navigate = useNavigate();

  const [profilData, setProfilData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    code_postal: "",
    date_naissance: "",
  });
  const [avisRecus, setAvisRecus] = useState([]);
  const [passwordData, setPasswordData] = useState({
    ancien_mot_de_passe: "",
    nouveau_mot_de_passe: "",
    confirmation: "",
  });

  const [profilStatut, setProfilStatut] = useState({
    loading: false,
    succes: "",
    erreur: "",
  });
  const [passwordStatut, setPasswordStatut] = useState({
    loading: false,
    succes: "",
    erreur: "",
  });
  const [suppressionLoading, setSuppressionLoading] = useState(false);

  // On charge le profil complet depuis l'API au montage pour avoir toutes les informations à jour
  useEffect(() => {
    utilisateursService.getProfil().then(({ data }) => {
      setProfilData({
        nom: data.nom || "",
        prenom: data.prenom || "",
        email: data.email || "",
        telephone: data.telephone || "",
        adresse: data.adresse || "",
        ville: data.ville || "",
        code_postal: data.code_postal || "",
        date_naissance: data.date_naissance
          ? data.date_naissance.split("T")[0]
          : "",
      });
    });

    // On charge les avis reçus par l'utilisateur connecté
    utilisateursService
      .getAvis(utilisateur?.id)
      .then(({ data }) => {
        setAvisRecus(data);
      })
      .catch(() => {});
  }, [utilisateur?.id]);

  const handleProfilChange = (e) => {
    setProfilData({ ...profilData, [e.target.name]: e.target.value });
    setProfilStatut({ loading: false, succes: "", erreur: "" });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordStatut({ loading: false, succes: "", erreur: "" });
  };

  const handleUpdateProfil = async (e) => {
    e.preventDefault();
    setProfilStatut({ loading: true, succes: "", erreur: "" });
    try {
      const { data } = await utilisateursService.updateProfil(profilData);
      const token = localStorage.getItem("token");
      login(token, {
        ...utilisateur,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
      });
      setProfilStatut({
        loading: false,
        succes: "Profil mis à jour avec succès.",
        erreur: "",
      });
    } catch (err) {
      setProfilStatut({
        loading: false,
        succes: "",
        erreur: err.response?.data?.message || "Une erreur est survenue.",
      });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.nouveau_mot_de_passe !== passwordData.confirmation) {
      setPasswordStatut({
        loading: false,
        succes: "",
        erreur: "Les mots de passe ne correspondent pas.",
      });
      return;
    }
    setPasswordStatut({ loading: true, succes: "", erreur: "" });
    try {
      await utilisateursService.updatePassword({
        ancien_mot_de_passe: passwordData.ancien_mot_de_passe,
        nouveau_mot_de_passe: passwordData.nouveau_mot_de_passe,
      });
      setPasswordData({
        ancien_mot_de_passe: "",
        nouveau_mot_de_passe: "",
        confirmation: "",
      });
      setPasswordStatut({
        loading: false,
        succes: "Mot de passe mis à jour avec succès.",
        erreur: "",
      });
    } catch (err) {
      setPasswordStatut({
        loading: false,
        succes: "",
        erreur: err.response?.data?.message || "Une erreur est survenue.",
      });
    }
  };

  const handleSupprimerCompte = async () => {
    const confirmation = window.confirm(
      "Êtes-vous certain de vouloir supprimer votre compte ? Cette action est irréversible.",
    );
    if (!confirmation) return;

    setSuppressionLoading(true);
    try {
      await utilisateursService.deleteCompte();
      logout();
      navigate("/");
    } catch {
      alert("Impossible de supprimer le compte. Veuillez réessayer.");
      setSuppressionLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>

      {/* Informations personnelles */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informations personnelles
        </h2>

        {profilStatut.succes && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {profilStatut.succes}
          </div>
        )}
        {profilStatut.erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {profilStatut.erreur}
          </div>
        )}

        <form onSubmit={handleUpdateProfil} className="space-y-4">
          {/* Nom et prénom sur la même ligne */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="prenom"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prénom
              </label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={profilData.prenom}
                onChange={handleProfilChange}
                autoComplete="given-name"
                className="input-field"
              />
            </div>
            <div>
              <label
                htmlFor="nom"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nom
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={profilData.nom}
                onChange={handleProfilChange}
                autoComplete="family-name"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profilData.email}
              onChange={handleProfilChange}
              autoComplete="email"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="telephone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Téléphone
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={profilData.telephone}
                onChange={handleProfilChange}
                autoComplete="tel"
                placeholder="06 00 00 00 00"
                className="input-field"
              />
            </div>
            <div>
              <label
                htmlFor="date_naissance"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date de naissance
              </label>
              <input
                type="date"
                id="date_naissance"
                name="date_naissance"
                value={profilData.date_naissance}
                onChange={handleProfilChange}
                autoComplete="bday"
                // On limite la date à aujourd'hui pour éviter les dates futures
                max={new Date().toISOString().split("T")[0]}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="adresse"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Adresse
            </label>
            <input
              type="text"
              id="adresse"
              name="adresse"
              value={profilData.adresse}
              onChange={handleProfilChange}
              autoComplete="street-address"
              placeholder="12 rue de la Paix"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label
                htmlFor="ville"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ville
              </label>
              <input
                type="text"
                id="ville"
                name="ville"
                value={profilData.ville}
                onChange={handleProfilChange}
                autoComplete="address-level2"
                className="input-field"
              />
            </div>
            <div>
              <label
                htmlFor="code_postal"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Code postal
              </label>
              <input
                type="text"
                id="code_postal"
                name="code_postal"
                value={profilData.code_postal}
                onChange={handleProfilChange}
                autoComplete="postal-code"
                placeholder="75000"
                className="input-field"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={profilStatut.loading}
            className="btn-primary"
          >
            {profilStatut.loading
              ? "Enregistrement..."
              : "Enregistrer les modifications"}
          </button>
        </form>
      </div>

      {/* Avis reçus */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Avis reçus
          {avisRecus.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({avisRecus.length} avis)
            </span>
          )}
        </h2>

        {avisRecus.length === 0 ? (
          <p className="text-sm text-gray-500">
            Vous n'avez pas encore reçu d'avis.
          </p>
        ) : (
          <ul className="space-y-4">
            {avisRecus.map((avis) => (
              <li
                key={avis.id}
                className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {avis.auteur_prenom} {avis.auteur_nom}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(avis.date_creation).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <Etoiles note={avis.note} />
                {avis.commentaire && (
                  <p className="text-sm text-gray-600 mt-2">
                    {avis.commentaire}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modification du mot de passe */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Modifier le mot de passe
        </h2>

        {passwordStatut.succes && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {passwordStatut.succes}
          </div>
        )}
        {passwordStatut.erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {passwordStatut.erreur}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {[
            {
              id: "ancien_mot_de_passe",
              label: "Mot de passe actuel",
              autoComplete: "current-password",
            },
            {
              id: "nouveau_mot_de_passe",
              label: "Nouveau mot de passe",
              autoComplete: "new-password",
            },
            {
              id: "confirmation",
              label: "Confirmer le nouveau mot de passe",
              autoComplete: "new-password",
            },
          ].map(({ id, label, autoComplete }) => (
            <div key={id}>
              <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {label}
              </label>
              <input
                type="password"
                id={id}
                name={id}
                value={passwordData[id]}
                onChange={handlePasswordChange}
                autoComplete={autoComplete}
                className="input-field"
                required
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={passwordStatut.loading}
            className="btn-primary"
          >
            {passwordStatut.loading
              ? "Modification..."
              : "Modifier le mot de passe"}
          </button>
        </form>
      </div>

      {/* Zone de suppression du compte */}
      <div className="card p-6 border-red-100">
        <h2 className="text-lg font-semibold text-red-700 mb-2">
          Zone de danger
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          La suppression du compte est définitive. Toutes vos annonces et
          messages seront supprimés.
        </p>
        <button
          onClick={handleSupprimerCompte}
          disabled={suppressionLoading}
          className="btn-danger"
        >
          {suppressionLoading ? "Suppression..." : "Supprimer mon compte"}
        </button>
      </div>
    </div>
  );
};

export default Profil;
