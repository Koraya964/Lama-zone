import { useState, useEffect } from 'react'
import { getAnnonces } from '../services/api'

export default function Home() {
  const [annonces, setAnnonces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnnonces()
      .then((res) => setAnnonces(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Chargement...</p>

  return (
    <main>
      <h1>Annonces récentes</h1>
      {annonces.length === 0 ? (
        <p>Aucune annonce pour le moment.</p>
      ) : (
        <ul>
          {annonces.map((a) => (
            <li key={a.id}>
              <a href={`/annonces/${a.id}`}>{a.titre}</a> — {a.prix} €
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
