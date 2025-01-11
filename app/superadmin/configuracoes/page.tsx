'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CadastroCondominios from '../../components/superadmin/CadastroCondominios'
import CadastroPublicidade from '../../components/superadmin/CadastroPublicidade'
import CadastroFornecedores from '../../components/superadmin/CadastroFornecedores'
import CadastroTipoServico from '../../components/superadmin/CadastroTipoServico'
import ListaMoradores from '../../components/superadmin/ListaMoradores'
import ListaIndicacoes from '../../components/superadmin/ListaIndicacoes'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function ConfiguracoesSuperAdmin() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      // Aqui você deve implementar a lógica para verificar se o usuário é um superadmin
      // Por exemplo, verificando um campo 'role' no documento do usuário no Firestore
      // Esta é uma implementação de exemplo e deve ser ajustada conforme sua lógica de autenticação
      const userDoc = await getUserDoc(user.uid)
      if (userDoc?.role === 'superadmin') {
        setIsSuperAdmin(true)
      } else {
        router.push('/dashboard')
      }
      setLoading(false)
    }

    checkUserRole()
  }, [user, router])

  if (loading) {
    return <div>Carregando...</div>
  }

  if (!isSuperAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Configurações do SuperAdmin</h1>
        
        <Tabs defaultValue="condominios" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="condominios">Condomínios</TabsTrigger>
            <TabsTrigger value="publicidade">Publicidade</TabsTrigger>
            <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
            <TabsTrigger value="tiposervico">Tipos de Serviço</TabsTrigger>
            <TabsTrigger value="moradores">Moradores</TabsTrigger>
            <TabsTrigger value="indicacoes">Indicações</TabsTrigger>
            <TabsTrigger value="cupons">Cupons</TabsTrigger>
          </TabsList>
          <TabsContent value="condominios">
            <CadastroCondominios />
          </TabsContent>
          <TabsContent value="publicidade">
            <CadastroPublicidade />
          </TabsContent>
          <TabsContent value="fornecedores">
            <CadastroFornecedores />
          </TabsContent>
          <TabsContent value="tiposervico">
            <CadastroTipoServico />
          </TabsContent>
          <TabsContent value="moradores">
            <ListaMoradores />
          </TabsContent>
          <TabsContent value="indicacoes">
            <ListaIndicacoes />
          </TabsContent>
          <TabsContent value="cupons">
            <Link href="/superadmin/cupons">
              <Button>Gerenciar Cupons</Button>
            </Link>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Função de exemplo para obter o documento do usuário
// Substitua isso pela sua implementação real
async function getUserDoc(uid: string) {
  // Implemente a lógica para buscar o documento do usuário no Firestore
  // e retornar os dados, incluindo a role
  return { role: 'superadmin' } // Exemplo
}

