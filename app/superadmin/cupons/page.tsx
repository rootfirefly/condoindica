'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"

interface Coupon {
  id: string
  title: string
  description: string
  cost: number
  expirationDate: Date
}

export default function GerenciarCupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      fetchCoupons()
    }
  }, [user, router])

  const fetchCoupons = async () => {
    const querySnapshot = await getDocs(collection(db, 'coupons'))
    const couponsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expirationDate: doc.data().expirationDate.toDate()
    })) as Coupon[]
    setCoupons(couponsData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !cost || !expirationDate) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await addDoc(collection(db, 'coupons'), {
        title,
        description,
        cost: Number(cost),
        expirationDate: new Date(expirationDate),
        createdAt: serverTimestamp()
      })

      toast({
        title: "Sucesso",
        description: "Cupom criado com sucesso!",
      })

      setTitle('')
      setDescription('')
      setCost('')
      setExpirationDate('')
      fetchCoupons()
    } catch (error) {
      console.error('Erro ao criar cupom:', error)
      toast({
        title: "Erro",
        description: "Erro ao criar cupom. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cupom?')) {
      try {
        await deleteDoc(doc(db, 'coupons', id))
        toast({
          title: "Sucesso",
          description: "Cupom excluído com sucesso!",
        })
        fetchCoupons()
      } catch (error) {
        console.error('Erro ao excluir cupom:', error)
        toast({
          title: "Erro",
          description: "Erro ao excluir cupom. Por favor, tente novamente.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Gerenciar Cupons</h1>
        
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Criar Novo Cupom</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="cost">Custo (em coins)</Label>
              <Input
                id="cost"
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="expirationDate">Data de Expiração</Label>
              <Input
                id="expirationDate"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="mt-4" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Cupom'}
          </Button>
        </form>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cupons Existentes</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Expiração</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>{coupon.title}</TableCell>
                  <TableCell>{coupon.description}</TableCell>
                  <TableCell>{coupon.cost} coins</TableCell>
                  <TableCell>{coupon.expirationDate.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(coupon.id)}>
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}

