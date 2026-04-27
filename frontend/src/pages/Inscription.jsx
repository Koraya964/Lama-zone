// On gère ici le formulaire d'inscription avec toutes les normes d'accessibilité actuelles
import { useState, useId } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { authService } from "../services/index.js";

const CRITERES = [
  {
    id: "longueur",
    label: "Au moins 8 caractères",
    test: (v) => v.length >= 8,
  },
  {
    id: "majuscule",
    label: "Une lettre majuscule",
    test: (v) => /[A-Z]/.test(v),
  },
  {
    id: "minuscule",
    label: "Une lettre minuscule",
    test: (v) => /[a-z]/.test(v),
  },
  { id: "chiffre", label: "Un chiffre", test: (v) => /[0-9]/.test(v) },
  {
    id: "special",
    label: "Un caractère spécial (!@#$...)",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

const calculerForce = (mot_de_passe) => {
  const score = CRITERES.filter((c) => c.test(mot_de_passe)).length;
  if (score <= 1)
    return {
      niveau: "Très faible",
      couleur: "bg-red-500",
      largeur: "w-1/5",
      textColor: "text-red-600",
    };
  if (score === 2)
    return {
      niveau: "Faible",
      couleur: "bg-orange-400",
      largeur: "w-2/5",
      textColor: "text-orange-500",
    };
  if (score === 3)
    return {
      niveau: "Moyen",
      couleur: "bg-yellow-400",
      largeur: "w-3/5",
      textColor: "text-yellow-600",
    };
  if (score === 4)
    return {
      niveau: "Fort",
      couleur: "bg-lime-500",
      largeur: "w-4/5",
      textColor: "text-lime-600",
    };
  return {
    niveau: "Très fort",
    couleur: "bg-green-500",
    largeur: "w-full",
    textColor: "text-green-600",
  };
};

const IconeOeilOuvert = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconeOeilFerme = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconeCoche = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3.5 h-3.5"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChampMotDePasse = ({
  id,
  label,
  value,
  onChange,
  erreur,
  describedBy,
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          aria-describedby={describedBy}
          aria-invalid={!!erreur}
          className={`input-field pr-11 ${erreur ? "border-red-400 focus:ring-red-400" : ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={
            visible
              ? `Masquer le ${label.toLowerCase()}`
              : `Afficher le ${label.toLowerCase()}`
          }
          aria-pressed={visible}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
        >
          {visible ? <IconeOeilFerme /> : <IconeOeilOuvert />}
        </button>
      </div>
      {erreur && (
        <p role="alert" className="text-red-500 text-xs mt-1">
          {erreur}
        </p>
      )}
    </div>
  );
};

const Inscription = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    mot_de_passe: "",
    confirmation: "",
  });
  const [erreurs, setErreurs] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const idBase = useId();
  const idForce = `${idBase}-force`;
  const idCriteres = `${idBase}-criteres`;

  const criteresValidation = CRITERES.map((c) => ({
    ...c,
    valide: formData.mot_de_passe.length > 0 && c.test(formData.mot_de_passe),
  }));
  const force =
    formData.mot_de_passe.length > 0
      ? calculerForce(formData.mot_de_passe)
      : null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (erreurs[e.target.name]) setErreurs({ ...erreurs, [e.target.name]: "" });
  };

  const valider = () => {
    const nouvellesErreurs = {};
    if (!formData.prenom.trim() || formData.prenom.length < 2)
      nouvellesErreurs.prenom =
        "Le prénom doit contenir au moins 2 caractères.";
    if (!formData.nom.trim() || formData.nom.length < 2)
      nouvellesErreurs.nom = "Le nom doit contenir au moins 2 caractères.";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      nouvellesErreurs.email = "L'email n'est pas valide.";
    if (formData.mot_de_passe.length < 8)
      nouvellesErreurs.mot_de_passe =
        "Le mot de passe doit contenir au moins 8 caractères.";
    if (formData.mot_de_passe !== formData.confirmation)
      nouvellesErreurs.confirmation = "Les mots de passe ne correspondent pas.";
    return nouvellesErreurs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const erreursValidation = valider();
    if (Object.keys(erreursValidation).length > 0) {
      setErreurs(erreursValidation);
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        mot_de_passe: formData.mot_de_passe,
      });
      login(data.token, data.utilisateur);
      navigate("/");
    } catch (err) {
      setErreurs({
        global: err.response?.data?.message || "Une erreur est survenue.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Créer un compte
        </h1>

        <div aria-live="polite" aria-atomic="true">
          {erreurs.global && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"
            >
              {erreurs.global}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "prenom", label: "Prénom", autoComplete: "given-name" },
              { id: "nom", label: "Nom", autoComplete: "family-name" },
            ].map(({ id, label, autoComplete }) => (
              <div key={id}>
                <label
                  htmlFor={id}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {label}
                </label>
                <input
                  type="text"
                  id={id}
                  name={id}
                  value={formData[id]}
                  onChange={handleChange}
                  autoComplete={autoComplete}
                  aria-invalid={!!erreurs[id]}
                  className={`input-field ${erreurs[id] ? "border-red-400" : ""}`}
                />
                {erreurs[id] && (
                  <p role="alert" className="text-red-500 text-xs mt-1">
                    {erreurs[id]}
                  </p>
                )}
              </div>
            ))}
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
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              aria-invalid={!!erreurs.email}
              className={`input-field ${erreurs.email ? "border-red-400" : ""}`}
            />
            {erreurs.email && (
              <p role="alert" className="text-red-500 text-xs mt-1">
                {erreurs.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <ChampMotDePasse
              id="mot_de_passe"
              label="Mot de passe"
              value={formData.mot_de_passe}
              onChange={handleChange}
              erreur={erreurs.mot_de_passe}
              describedBy={`${idForce} ${idCriteres}`}
            />

            {force && (
              <div id={idForce} aria-live="polite">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">
                    Force du mot de passe
                  </span>
                  <span className={`text-xs font-medium ${force.textColor}`}>
                    <span className="sr-only">Force : </span>
                    {force.niveau}
                  </span>
                </div>
                <div
                  className="h-1.5 bg-gray-200 rounded-full overflow-hidden"
                  role="img"
                  aria-label={`Force du mot de passe : ${force.niveau}`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${force.couleur} ${force.largeur}`}
                  />
                </div>
              </div>
            )}

            <ul
              id={idCriteres}
              className="space-y-1 pt-1"
              aria-label="Critères requis pour le mot de passe"
            >
              {criteresValidation.map((critere) => (
                <li
                  key={critere.id}
                  className={`flex items-center gap-2 text-xs transition-colors duration-200 ${critere.valide ? "text-green-600" : "text-gray-400"}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${critere.valide ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-300"}`}
                    aria-hidden="true"
                  >
                    {critere.valide && <IconeCoche />}
                  </span>
                  <span>
                    <span className="sr-only">
                      {critere.valide ? "Validé : " : "Non validé : "}
                    </span>
                    {critere.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <ChampMotDePasse
            id="confirmation"
            label="Confirmer le mot de passe"
            value={formData.confirmation}
            onChange={handleChange}
            erreur={erreurs.confirmation}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
            aria-busy={loading}
          >
            {loading ? "Création du compte..." : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Déjà un compte ?{" "}
          <Link
            to="/connexion"
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Inscription;
