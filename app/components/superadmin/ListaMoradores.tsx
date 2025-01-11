import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { EditMoradorForm } from './EditMoradorForm'
import { VerifiedBadge } from '../icons/VerifiedBadge'

interface Morador {
  id: string;
  nomeCompleto: string;
  condominio: string;
  bloco: string;
  apartamento: string;
  status: string;
}

export default function ListaMoradores() {
  const [moradores, setMoradores] = useState<Morador[]>([])
  const [condominios, setCondominios] = useState<string[]>([])
  const [selectedCondominio, setSelectedCondominio] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingMorador, setEditingMorador] = useState<Morador | null>(null)

  useEffect(() => {
    fetchCondominios()
    fetchMoradores()
  }, [])

  const fetchCondominios = async () => {
    try {
      const condominiosQuery = query(collection(db, 'condominios'))
      const querySnapshot = await getDocs(condominiosQuery)
      const condominiosData = querySnapshot.docs.map(doc => doc.data().nome)
      setCondominios(condominiosData)
    } catch (error) {
      console.error('Erro ao buscar condomínios:', error)
    }
  }

  const fetchMoradores = async () => {
    setLoading(true)
    try {
      const moradoresQuery = query(
        collection(db, 'users'),
        where('role', '==', 'morador')
      )
      const querySnapshot = await getDocs(moradoresQuery)
      const moradoresData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Morador[]
      setMoradores(moradoresData)
    } catch (error) {
      console.error('Erro ao buscar moradores:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMoradores = moradores.filter(
    (morador) =>
      (selectedCondominio === 'all' || morador.condominio === selectedCondominio) &&
      (morador.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${morador.bloco} - ${morador.apartamento}`.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleEdit = (morador: Morador) => {
    setEditingMorador(morador)
  }

  const handleCloseEdit = () => {
    setEditingMorador(null)
  }

  const handleUpdateMorador = () => {
    fetchMoradores()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Lista de Moradores</h2>
      <div className="flex space-x-4 mb-4">
        <div className="w-1/2">
          <Label htmlFor="condominio">Filtrar por Condomínio</Label>
          <Select onValueChange={setSelectedCondominio} value={selectedCondominio}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os condomínios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os condomínios</SelectItem>
              {condominios.map((condominio) => (
                <SelectItem key={condominio} value={condominio}>
                  {condominio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-1/2">
          <Label htmlFor="search">Buscar Morador</Label>
          <Input
            id="search"
            placeholder="Nome ou Bloco/AP"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Carregando moradores...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Condomínio</TableHead>
              <TableHead>Bloco/AP</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMoradores.map((morador) => (
              <TableRow key={morador.id}>
                <TableCell>
                  <div className="flex items-center">
                    <span className="mr-2">{morador.nomeCompleto}</span>
                    {morador.status === 'aprovado' && (
                      <VerifiedBadge className="w-5 h-5 text-green-500" title="Morador Aprovado" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{morador.condominio}</TableCell>
                <TableCell>{`${morador.bloco} - ${morador.apartamento}`}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(morador)}>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!editingMorador} onOpenChange={() => setEditingMorador(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Morador</DialogTitle>
          </DialogHeader>
          {editingMorador && (
            <EditMoradorForm
              morador={editingMorador}
              onClose={handleCloseEdit}
              onUpdate={handleUpdateMorador}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

