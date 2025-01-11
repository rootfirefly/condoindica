'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useMediaQuery } from '../hooks/useMediaQuery'

interface Indicacao {
  id: string
  nome: string
  servico: string
  avaliacao: number
  descricao: string
  timestamp: any
  contato: string
  userName: string
  condominio: string
}

export function IndicacoesCarousel() {
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isMobile = useMediaQuery('(max-width: 767px)')

  useEffect(() => {
    const fetchIndicacoes = async () => {
      const q = query(collection(db, 'indicacoes'), orderBy('timestamp', 'desc'), limit(12))
      const querySnapshot = await getDocs(q)
      const indicacoesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Indicacao[]
      setIndicacoes(indicacoesData)
    }

    fetchIndicacoes()
  }, [])

  const getItemsPerPage = () => {
    if (isMobile) return 1
    if (isTablet) return 2
    return 4
  }

  const itemsPerPage = getItemsPerPage()

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % indicacoes.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + indicacoes.length) % indicacoes.length)
  }

  if (indicacoes.length === 0) {
    return null
  }

  const visibleIndicacoes = [
    ...indicacoes.slice(currentIndex),
    ...indicacoes.slice(0, currentIndex)
  ].slice(0, itemsPerPage)

  return (
    <div className="relative w-full max-w-[90rem] mx-auto px-4">
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="flex transition-transform duration-500 ease-in-out">
          {visibleIndicacoes.map((indicacao) => (
            <div 
              key={indicacao.id} 
              className={`flex-shrink-0 p-4 ${
                isMobile ? 'w-full' : 
                isTablet ? 'w-1/2' : 
                'w-1/4'
              }`}
            >
              <div className="bg-white p-6 rounded-lg border border-gray-200 h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    {indicacao.nome.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{indicacao.nome}</h3>
                    <p className="text-sm text-gray-600">{indicacao.servico}</p>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < indicacao.avaliacao ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">{indicacao.avaliacao.toFixed(1)}</span>
                </div>
                <p className="text-[10px] text-gray-700 mb-4 flex-grow leading-tight">"{indicacao.descricao}"</p>
                <div className="text-[10px] text-gray-500 mt-auto">
                  <p className="mb-1">Avaliado por: {indicacao.userName}</p>
                  <p>{indicacao.condominio}</p>
                  <p>Indicado em: {new Date(indicacao.timestamp).toLocaleDateString()}</p>
                  <p>Contato: {indicacao.contato}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
      >
        <ChevronLeft className="w-6 h-6 text-blue-600" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
      >
        <ChevronRight className="w-6 h-6 text-blue-600" />
      </button>
    </div>
  )
}

