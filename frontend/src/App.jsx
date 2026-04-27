// On définit ici toutes les routes de l'application et on enveloppe le tout dans les providers
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/layout/Layout.jsx';
import RoutePrivee from './components/common/RoutePrivee.jsx';

import Accueil from './pages/Accueil.jsx';
import ListeAnnonces from './pages/ListeAnnonces.jsx';
import DetailAnnonce from './pages/DetailAnnonce.jsx';
import CreerAnnonce from './pages/CreerAnnonce.jsx';
import ModifierAnnonce from './pages/ModifierAnnonce.jsx';
import Connexion from './pages/Connexion.jsx';
import Inscription from './pages/Inscription.jsx';
import Profil from './pages/Profil.jsx';
import MesAnnonces from './pages/MesAnnonces.jsx';
import Messagerie from './pages/Messagerie.jsx';
import NotFound from './pages/NotFound.jsx';

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Accueil />} />
                        <Route path="annonces" element={<ListeAnnonces />} />
                        <Route path="annonces/:id" element={<DetailAnnonce />} />
                        <Route path="connexion" element={<Connexion />} />
                        <Route path="inscription" element={<Inscription />} />

                        {/* Routes accessibles uniquement aux utilisateurs connectés */}
                        <Route element={<RoutePrivee />}>
                            <Route path="annonces/nouvelle" element={<CreerAnnonce />} />
                            <Route path="annonces/:id/modifier" element={<ModifierAnnonce />} />
                            <Route path="profil" element={<Profil />} />
                            <Route path="mes-annonces" element={<MesAnnonces />} />
                            <Route path="messagerie" element={<Messagerie />} />
                        </Route>

                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
