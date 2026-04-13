import { useState } from 'react'
import { createAnnonce } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function NewAnnonce() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ titre: '', description: '', prix: '', localisation: '' })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await createAnnonce(form)
      navigate('/')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main>
      <h1>Publier une annonce</h1>
      <form onSubmit={handleSubmit}>
        <input name="titre" placeholder="Titre" value={form.titre} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <input name="prix" type="number" placeholder="Prix (€)" value={form.prix} onChange={handleChange} required />
        <input name="localisation" placeholder="Localisation" value={form.localisation} onChange={handleChange} />
        <button type="submit">Publier</button>
      </form>
    </main>
  )
}
