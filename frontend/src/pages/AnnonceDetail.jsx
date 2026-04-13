import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getAnnonce } from '../services/api'

export default function AnnonceDetail() {
  const { id } = useParams()
  const [annonce, setAnnonce] = useState(null)

  useEffect(() => {
    getAnnonce(id)
      .then((res) => setAnnonce(res.data))
      .catch((err) => console.error(err))
  }, [id])

  if (!annonce) return <p>Chargement...</p>

  return (
    <main>
      <h1>{annonce.titre}</h1>
      <p>{annonce.description}</p>
      <p><strong>Prix :</strong> {annonce.prix} €</p>
      <p><strong>Localisation :</strong> {annonce.localisation}</p>
      <p><strong>Vendeur :</strong> {annonce.auteur_nom}</p>
    </main>
  )
}
