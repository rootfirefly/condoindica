import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

interface EditMoradorFormProps {
  morador: {
    id: string;
    nomeCompleto: string;
    condominio: string;
    complemento: string;
    status: string;
  };
  onClose: () => void;
  onUpdate: () => void;
}

export function EditMoradorForm({ morador, onClose, onUpdate }: EditMoradorFormProps) {
  const [status, setStatus] = useState(morador.status)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const moradorRef = doc(db, 'users', morador.id)
      await updateDoc(moradorRef, { status })
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Erro ao atualizar morador:', error)
      alert('Erro ao atualizar morador. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nomeCompleto">Nome Completo</Label>
        <Input id="nomeCompleto" value={morador.nomeCompleto} disabled />
      </div>
      <div>
        <Label htmlFor="condominio">Condomínio</Label>
        <Input id="condominio" value={morador.condominio} disabled />
      </div>
      <div>
        <Label htmlFor="complemento">Apartamento</Label>
        <Input id="complemento" value={morador.complemento} disabled />
      </div>
      <div>
        <Label>Status</Label>
        <RadioGroup value={status} onValueChange={setStatus}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="aprovado" id="aprovado" />
            <Label htmlFor="aprovado">Aprovado</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bloqueado" id="bloqueado" />
            <Label htmlFor="bloqueado">Bloqueado</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pendente" id="pendente" />
            <Label htmlFor="pendente">Pendente</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

