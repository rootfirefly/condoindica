'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import MainMenu from '../components/MainMenu'
import { collection, query, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { FaStar, FaUser, FaSearch, FaWhatsapp, FaComments, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import ServicoCard from '../components/ServicoCard'
import AvaliacoesModal from '../components/AvaliacoesModal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Servico {
  id: string
  nome: string
  empresa: string
  servico: string // Isso agora representa o nome do serviço
  contato: string
  descricao: string
  avaliacao: number
  userEmail: string
  userName: string
}

export default function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [filteredServicos, setFilteredServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterServico, setFilterServico] = useState('all')
  const [filterAvaliacao, setFilterAvaliacao] = useState(0)
  const [avaliacoesModalOpen, setAvaliacoesModalOpen] = useState(false)
  const [selectedServicoId, setSelectedServicoId] = useState<string | null>(null)
  const [tiposServico, setTiposServico] = useState<string[]>([])
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      fetchServicos()
    }
  }, [user, router])

  const fetchServicos = async () => {
    try {
      const q = query(collection(db, 'indicacoes'))
      const querySnapshot = await getDocs(q)
      const servicosData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          servico: data.servico || 'Serviço não especificado' // Garante que sempre temos um nome de serviço
        } as Servico;
      })
      setServicos(servicosData)
      setFilteredServicos(servicosData)

      // Coletar tipos de serviço únicos
      const tiposUnicos = Array.from(new Set(servicosData
        .map(servico => servico.servico)
        .filter(tipo => tipo && tipo.trim() !== '')
      ))
      setTiposServico(tiposUnicos)
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = servicos.filter(servico => 
      (servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
       servico.servico.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterServico === 'all' || servico.servico.toLowerCase() === filterServico.toLowerCase()) &&
      (filterAvaliacao === 0 || servico.avaliacao >= filterAvaliacao)
    )
    setFilteredServicos(filtered)
  }, [searchTerm, filterServico, filterAvaliacao, servicos])

  const handleStarClick = (rating: number) => {
    setFilterAvaliacao(rating === filterAvaliacao ? 0 : rating)
  }

  const handleOpenAvaliacoes = (servicoId: string) => {
    setSelectedServicoId(servicoId)
    setAvaliacoesModalOpen(true)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* <MainMenu currentPage="servicos" /> */}
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Serviços Indicados</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Barra lateral de filtros */}
          <aside className="w-full md:w-64 bg-white p-6 rounded-lg shadow-md space-y-6">
            <h2 className="text-xl font-semibold mb-4">Filtros</h2>
            
            <div className="mb-4">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder="Nome ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">Tipo de Serviço</label>
              <Select onValueChange={(value) => setFilterServico(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos os serviços" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os serviços</SelectItem>
                  {tiposServico
                    .filter(tipo => tipo && tipo.trim() !== '')
                    .map((tipo) => (
                      <SelectItem key={tipo} value={tipo.toLowerCase()}>{tipo}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avaliação Mínima</label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`cursor-pointer ${star <= filterAvaliacao ? "text-yellow-400" : "text-gray-300"} text-2xl mr-1`}
                    onClick={() => handleStarClick(star)}
                  />
                ))}
              </div>
            </div>
          </aside>

          {/* Lista de serviços */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center">
                <p className="text-xl text-gray-600">Carregando serviços...</p>
              </div>
            ) : filteredServicos.length === 0 ? (
              <div className="text-center">
                <p className="text-xl text-gray-600">Nenhum serviço encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServicos.map((servico) => (
                  <ServicoCard
                    key={servico.id}
                    servico={servico}
                    onOpenAvaliacoes={handleOpenAvaliacoes}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {avaliacoesModalOpen && selectedServicoId && (
        <AvaliacoesModal
          servicoId={selectedServicoId}
          onClose={() => setAvaliacoesModalOpen(false)}
        />
      )}
    </div>
  )
}

