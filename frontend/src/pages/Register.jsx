import { useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nom: '', email: '', password: '' })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await api.post('/auth/register', form)
      navigate('/connexion')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main>
      <h1>Créer un compte</h1>
      <form onSubmit={handleSubmit}>
        <input name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} required />
        <button type="submit">S'inscrire</button>
      </form>
    </main>
  )
}
