'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from 'next/link'

interface Indicacao {
  id: string
  nome: string
  servico: string
  timestamp: Date
  status: string
}

export default function MinhasIndicacoes() {
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  console.log('Component rendered, user:', user?.uid);

  useEffect(() => {
    if (user) {
      fetchIndicacoes()
    }
  }, [user])

  const fetchIndicacoes = async () => {
  if (!user) {
    console.log('No user found, skipping fetch');
    return;
  }

  console.log('Current user ID:', user.uid);

  const q = query(
    collection(db, 'indicacoes'),
    where('userId', '==', user.uid)
  );

  try {
    console.log('Executing query for userId:', user.uid);
    const querySnapshot = await getDocs(q);
    console.log('Query executed, documents found:', querySnapshot.size);

    // Log each document for debugging
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Document data:', {
        id: doc.id,
        userId: data.userId,
        nome: data.nome,
        servico: data.servico,
        timestamp: data.timestamp
      });
    });

    const indicacoesData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert timestamp string to Date if it's a string
      let timestamp;
      if (typeof data.timestamp === 'string') {
        timestamp = new Date(data.timestamp);
      } else if (data.timestamp?.toDate) {
        timestamp = data.timestamp.toDate();
      } else {
        timestamp = new Date();
      }

      return {
        id: doc.id,
        nome: data.nome || 'Nome não disponível',
        servico: data.servico || 'Serviço não especificado',
        timestamp,
        status: data.status || 'Pendente'
      };
    });

    // Sort the indicacoes locally
    indicacoesData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    console.log('Processed indicacoes:', indicacoesData);
    setIndicacoes(indicacoesData);
  } catch (error) {
    console.error('Erro ao buscar indicações:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  } finally {
    setLoading(false);
  }
};

  if (!user || loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Minhas Indicações</h1>
        
        {indicacoes.length === 0 ? (
          <div className="text-center">
            <p className="mb-4">Você ainda não fez nenhuma indicação.</p>
            <Link href="/indicar">
              <Button>Fazer uma indicação agora</Button>
            </Link>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indicacoes.map((indicacao) => (
                  <TableRow key={indicacao.id}>
                    <TableCell>{indicacao.nome}</TableCell>
                    <TableCell>{indicacao.servico}</TableCell>
                    <TableCell>{indicacao.timestamp.toLocaleDateString()}</TableCell>
                    <TableCell>{indicacao.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-6 text-center">
              <Link href="/indicar">
                <Button>Fazer nova indicação</Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

