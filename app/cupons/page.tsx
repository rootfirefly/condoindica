'use client'

import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import CuponsDisponiveis from '../components/CuponsDisponiveis'
import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { formatNumber } from '../utils/formatNumber';

export default function CuponsPage() {
  const { user } = useAuth()
  const [userPoints, setUserPoints] = useState(0)

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setUserPoints(userDoc.data().points || 0)
        }
      }
    }
    fetchUserPoints()
  }, [user])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Cupons Disponíveis</h1>
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <p className="text-xl font-semibold">Seus pontos: {formatNumber(userPoints)} coins</p>
        </div>
        <CuponsDisponiveis />
      </main>
    </div>
  )
}

