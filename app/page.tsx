'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './contexts/AuthContext'
import Header from './components/Header'
import { CondominioCard } from './components/CondominioCard'
import { CTASection } from './components/CTASection'
import { IndicacoesCarousel } from './components/IndicacoesCarousel'
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore'
import { db } from './firebase/config'
import { Handshake, Users, Clock, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { HeroSection } from './components/HeroSection'
import { HowToUse } from './components/HowToUse'
import Footer from './components/Footer'

interface Condominio {
  id: string
  nome: string
  endereco: string
  logoUrl: string
}

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [condominios, setCondominios] = useState<Condominio[]>([])

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchCondominios = async () => {
      const q = query(collection(db, 'condominios'), limit(6))
      const querySnapshot = await getDocs(q)
      const condominiosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Condominio[]
      setCondominios(condominiosData)
    }

    fetchCondominios()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl font-semibold text-blue-600">Carregando...</div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection
          imageUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20456.jpg-x8ke592Y5z9cA89bVt2ELQGBMiueQA.jpeg"
          title='Bem-vindo ao <span class="text-yellow-400">CondoIndica</span>'
          subtitle="Conectando vizinhos e serviços de confiança"
        />

        {/* How to Use Section */}
        <HowToUse />

        {/* Indicações Carousel Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-blue-800">
              Últimas Indicações
            </h2>
            <IndicacoesCarousel />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-blue-800">
              Por que escolher o CondoIndica?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Handshake className="w-12 h-12 mb-4 text-blue-600" />,
                  title: 'Confiabilidade',
                  description: 'Recomendações de pessoas que você conhece e confia.'
                },
                {
                  icon: <Users className="w-12 h-12 mb-4 text-blue-600" />,
                  title: 'Comunidade',
                  description: 'Fortaleça os laços com seus vizinhos e sua comunidade.'
                },
                {
                  icon: <Clock className="w-12 h-12 mb-4 text-blue-600" />,
                  title: 'Economia de Tempo',
                  description: 'Encontre serviços de qualidade rapidamente.'
                },
                {
                  icon: <CheckCircle className="w-12 h-12 mb-4 text-blue-600" />,
                  title: 'Qualidade Garantida',
                  description: 'Acesse profissionais e produtos testados e aprovados.'
                }
              ].map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center transition-transform duration-300 ease-in-out hover:scale-105">
                  <div className="flex justify-center">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-blue-800">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Condomínios Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-blue-800">
              Condomínios que confiam em nós
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {condominios.map((condominio) => (
                <CondominioCard
                  key={condominio.id}
                  nome={condominio.nome}
                  endereco={condominio.endereco}
                  logoUrl={condominio.logoUrl}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

