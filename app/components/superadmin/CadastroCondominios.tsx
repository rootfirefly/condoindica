'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { addDoc, collection, getDocs } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../firebase/config'
import Image from 'next/image'
import { Camera } from 'lucide-react'

interface Condominio {
  id: string;
  nome: string;
  logoUrl: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export default function CadastroCondominios() {
  const [nome, setNome] = useState('')
  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const consultarCEP = async () => {
    if (cep.length !== 8) {
      alert('CEP inválido')
      return
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()

      if (data.erro) {
        alert('CEP não encontrado')
        return
      }

      setLogradouro(data.logradouro)
      setBairro(data.bairro)
      setCidade(data.localidade)
      setEstado(data.uf)
    } catch (error) {
      console.error('Erro ao consultar CEP:', error)
      alert('Erro ao consultar CEP. Tente novamente.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let logoUrl = ''
      if (logo) {
        const logoRef = ref(storage, `condominios/${Date.now()}-${logo.name}`)
        await uploadBytes(logoRef, logo)
        logoUrl = await getDownloadURL(logoRef)
      }

      const novoCondominio = {
        nome,
        logoUrl,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado
      }

      const docRef = await addDoc(collection(db, 'condominios'), novoCondominio)
      setCondominios([...condominios, { id: docRef.id, ...novoCondominio }])

      // Limpar o formulário
      setNome('')
      setCep('')
      setLogradouro('')
      setNumero('')
      setComplemento('')
      setBairro('')
      setCidade('')
      setEstado('')
      setLogo(null)
      setLogoPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      alert('Condomínio cadastrado com sucesso!')
    } catch (error) {
      console.error('Erro ao cadastrar condomínio:', error)
      alert('Erro ao cadastrar condomínio. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const fetchCondominios = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'condominios'))
      const condominiosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Condominio[]
      setCondominios(condominiosData)
    } catch (error) {
      console.error('Erro ao buscar condomínios:', error)
    }
  }

  useState(() => {
    fetchCondominios()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Cadastro de Condomínios</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <Label htmlFor="nome">Nome do Condomínio</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="logo">Logo do Condomínio</Label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {logoPreview ? (
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              ) : (
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="logo-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload da logo</span>
                  <input
                    id="logo-upload"
                    name="logo-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleLogoChange}
                    ref={fileInputRef}
                    accept="image/*"
                  />
                </label>
                <p className="pl-1">ou arraste e solte</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="cep">CEP</Label>
          <div className="flex space-x-2">
            <Input
              id="cep"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              maxLength={8}
              required
            />
            <Button type="button" onClick={consultarCEP}>Consultar CEP</Button>
          </div>
        </div>
        <div>
          <Label htmlFor="logradouro">Logradouro</Label>
          <Input id="logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="numero">Número</Label>
          <Input id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="complemento">Complemento</Label>
          <Input id="complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="bairro">Bairro</Label>
          <Input id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="cidade">Cidade</Label>
          <Input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="estado">Estado</Label>
          <Input id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} required />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar Condomínio'}
        </Button>
      </form>

      <h3 className="text-xl font-bold mb-2">Lista de Condomínios</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {condominios.map((condominio) => (
            <TableRow key={condominio.id}>
              <TableCell>
                {condominio.logoUrl && (
                  <Image
                    src={condominio.logoUrl}
                    alt={`Logo de ${condominio.nome}`}
                    width={50}
                    height={50}
                    objectFit="contain"
                  />
                )}
              </TableCell>
              <TableCell>{condominio.nome}</TableCell>
              <TableCell>{`${condominio.logradouro}, ${condominio.numero}, ${condominio.bairro}, ${condominio.cidade} - ${condominio.estado}`}</TableCell>
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

