'use client'

import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import PontosExtrato from '../components/PontosExtrato'

export default function PontosPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Extrato de Pontos</h1>
        <PontosExtrato userId={user.uid} />
      </main>
    </div>
  )
}

