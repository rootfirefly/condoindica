import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface TipoServico {
  id: string;
  nome: string;
  count: number;
}

export default function CadastroTipoServico() {
  const [nome, setNome] = useState('')
  const [tiposServico, setTiposServico] = useState<TipoServico[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTipo, setEditingTipo] = useState<TipoServico | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchTiposServico()
  }, [])

  const fetchTiposServico = async () => {
    setLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, 'tipos'))
      const tipos = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const tipoData = doc.data()
        const indicacoesQuery = query(collection(db, 'indicacoes'), where('servico', '==', tipoData.nome))
        const indicacoesSnapshot = await getDocs(indicacoesQuery)
        return {
          id: doc.id,
          nome: tipoData.nome,
          count: indicacoesSnapshot.size
        }
      }))
      setTiposServico(tipos)
    } catch (error) {
      console.error('Erro ao buscar tipos de serviço:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tipos de serviço.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) return

    try {
      await addDoc(collection(db, 'tipos'), { nome })
      setNome('')
      fetchTiposServico()
      toast({
        title: "Sucesso",
        description: "Tipo de serviço cadastrado com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao cadastrar tipo de serviço:', error)
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o tipo de serviço.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (tipo: TipoServico) => {
    setEditingTipo(tipo)
    setIsDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingTipo || !editingTipo.nome.trim()) return

    try {
      const tipoRef = doc(db, 'tipos', editingTipo.id)
      await updateDoc(tipoRef, { nome: editingTipo.nome })
      setIsDialogOpen(false)
      fetchTiposServico()
      toast({
        title: "Sucesso",
        description: "Tipo de serviço atualizado com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao atualizar tipo de serviço:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tipo de serviço.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este tipo de serviço?')) {
      try {
        await deleteDoc(doc(db, 'tipos', id))
        fetchTiposServico()
        toast({
          title: "Sucesso",
          description: "Tipo de serviço excluído com sucesso.",
        })
      } catch (error) {
        console.error('Erro ao excluir tipo de serviço:', error)
        toast({
          title: "Erro",
          description: "Não foi possível excluir o tipo de serviço.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Cadastro de Tipos de Serviço</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <Label htmlFor="nome">Nome do Tipo de Serviço</Label>
          <Input 
            id="nome" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            required 
          />
        </div>
        <Button type="submit">Cadastrar Tipo de Serviço</Button>
      </form>

      <h3 className="text-xl font-bold mb-2">Lista de Tipos de Serviço</h3>
      {loading ? (
        <p>Carregando tipos de serviço...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Quantidade de Indicações</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiposServico.map((tipo) => (
              <TableRow key={tipo.id}>
                <TableCell>{tipo.nome}</TableCell>
                <TableCell>{tipo.count}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(tipo)}>Editar</Button>
                  <Button variant="destructive" size="sm" className="ml-2" onClick={() => handleDelete(tipo.id)}>Excluir</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tipo de Serviço</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="editNome">Nome do Tipo de Serviço</Label>
            <Input 
              id="editNome" 
              value={editingTipo?.nome || ''} 
              onChange={(e) => setEditingTipo(prev => prev ? {...prev, nome: e.target.value} : null)} 
              required 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdate}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

