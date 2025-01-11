'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from 'react-day-picker'
import { Button } from "@/components/ui/button"

interface User {
  id: string
  displayName: string
}

interface PontosTransaction {
  id: string
  userId: string
  amount: number
  description: string
  createdAt: Timestamp | any
  registeredBy?: string
}

const formatNumber = (num: number): string => {
  return num.toLocaleString('pt-BR');
};

export default function PontosExtrato() {
  const [transactions, setTransactions] = useState<PontosTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<PontosTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      setLoading(true)
      try {
        const pontosTransactionsQuery = query(
          collection(db, 'pontosTransactions'),
          where('userId', '==', user.uid)
        )
        const pointsTransactionsQuery = query(
          collection(db, 'pointsTransactions'),
          where('userId', '==', user.uid)
        )

        const [pontosSnapshot, pointsSnapshot] = await Promise.all([
          getDocs(pontosTransactionsQuery),
          getDocs(pointsTransactionsQuery)
        ])

        const pontosTransactions = pontosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          registeredBy: 'Sistema'
        }))

        const pointsTransactions = pointsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          registeredBy: user.displayName || 'Usuário'
        }))

        const allTransactions = [...pontosTransactions, ...pointsTransactions]
        allTransactions.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())

        setTransactions(allTransactions)
        setFilteredTransactions(allTransactions)
      } catch (error) {
        console.error('Erro ao buscar transações:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [user])

  const applyDateFilter = () => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      setFilteredTransactions(transactions)
      return
    }

    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = transaction.createdAt.toDate()
      return transactionDate >= dateRange.from && transactionDate <= dateRange.to
    })

    setFilteredTransactions(filteredTransactions)
  }

  useEffect(() => {
    applyDateFilter()
  }, [dateRange, transactions])

  const resetFilter = () => {
    setDateRange(undefined)
    setFilteredTransactions(transactions)
  }

  const totalPoints = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extrato de Pontos</CardTitle>
        <p className="text-sm font-medium">Total de pontos: {formatNumber(totalPoints)} coins</p>
        <div className="flex items-center space-x-4 mt-4">
          <DateRangePicker value={dateRange} onValueChange={setDateRange} />
          <Button onClick={resetFilter}>Limpar Filtro</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando transações...</p>
        ) : filteredTransactions.length === 0 ? (
          <p>Nenhuma transação encontrada.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Pontos</TableHead>
                <TableHead>Registrado por</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(transaction.createdAt.toDate(), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </TableCell>
                  <TableCell>{transaction.registeredBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

