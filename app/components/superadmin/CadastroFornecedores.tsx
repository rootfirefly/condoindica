import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CadastroFornecedores() {
  const [nome, setNome] = useState('')
  const [servico, setServico] = useState('')
  const [contato, setContato] = useState('')
  const [fornecedores, setFornecedores] = useState([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implementar lógica de cadastro
    console.log('Cadastrar fornecedor:', { nome, servico, contato })
    // Após cadastro, atualizar a lista de fornecedores
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Cadastro de Fornecedores</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <Label htmlFor="nome">Nome do Fornecedor</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="servico">Serviço</Label>
          <Input id="servico" value={servico} onChange={(e) => setServico(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="contato">Contato</Label>
          <Input id="contato" value={contato} onChange={(e) => setContato(e.target.value)} required />
        </div>
        <Button type="submit">Cadastrar Fornecedor</Button>
      </form>

      <h3 className="text-xl font-bold mb-2">Lista de Fornecedores</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fornecedores.map((fornecedor: any) => (
            <TableRow key={fornecedor.id}>
              <TableCell>{fornecedor.nome}</TableCell>
              <TableCell>{fornecedor.servico}</TableCell>
              <TableCell>{fornecedor.contato}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">Editar</Button>
                <Button variant="destructive" size="sm" className="ml-2">Excluir</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

