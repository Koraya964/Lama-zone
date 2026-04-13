import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AnnonceDetail from './pages/AnnonceDetail'
import NewAnnonce from './pages/NewAnnonce'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/annonces/:id" element={<AnnonceDetail />} />
        <Route path="/annonces/nouvelle" element={<NewAnnonce />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
