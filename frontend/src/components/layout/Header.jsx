// On gère ici la navigation principale et l'affichage conditionnel selon l'état de connexion
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const Header = () => {
  const { estConnecte, utilisateur, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary-500">
            Lamazone
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {estConnecte && (
              <>
                <NavLink
                  to="/mes-annonces"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary-500 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }
                >
                  Mes annonces
                </NavLink>
                <NavLink
                  to="/messagerie"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary-500 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }
                >
                  Messages
                </NavLink>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {estConnecte ? (
              <>
                <Link to="/annonces/nouvelle" className="btn-primary text-sm">
                  Deposer une annonce
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                    <span className="text-sm font-medium">
                      {utilisateur?.prenom}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profil"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    >
                      Mon profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                    >
                      Se deconnecter
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/connexion" className="btn-secondary text-sm">
                  Se connecter
                </Link>
                <Link to="/inscription" className="btn-primary text-sm">
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
