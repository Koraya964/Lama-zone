// On définit ici la structure commune à toutes les pages : header, contenu principal, footer
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
