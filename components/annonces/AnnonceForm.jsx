'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['Véhicules', 'Immobilier', 'Électronique', 'Vêtements', 'Maison', 'Loisirs', 'Autres']

export default function AnnonceForm({ annonce }) {
  const router = useRouter()
  const [form, setForm] = useState({
    titre: annonce?.titre || '',
    description: annonce?.description || '',
    prix: annonce?.prix || '',
    localisation: annonce?.localisation || '',
    categorie: annonce?.categorie || '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const method = annonce ? 'PUT' : 'POST'
    const url = annonce ? `/api/annonces/${annonce.id}` : '/api/annonces'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) router.push('/annonces')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl flex flex-col gap-4">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Titre *</label>
        <input className="border p-2 rounded w-full" placeholder="Ex: Vélo de route en bon état"
          value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} required />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Catégorie *</label>
        <select className="border p-2 rounded w-full" value={form.categorie}
          onChange={e => setForm({ ...form, categorie: e.target.value })} required>
          <option value="">Choisir une catégorie</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Prix (€) *</label>
          <input type="number" className="border p-2 rounded w-full" placeholder="0"
            value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} required />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Localisation *</label>
          <input className="border p-2 rounded w-full" placeholder="Ex: Paris 75001"
            value={form.localisation} onChange={e => setForm({ ...form, localisation: e.target.value })} required />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Description *</label>
        <textarea className="border p-2 rounded w-full h-32 resize-none" placeholder="Décrivez votre article..."
          value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Images</label>
        <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center text-sm text-gray-400">
          {/* TODO: module 11 — upload avec /api/upload */}
          Glisser des images ici ou cliquer pour sélectionner
        </div>
      </div>

      <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        {annonce ? "Modifier l'annonce" : "Publier l'annonce"}
      </button>
    </form>
  )
}
