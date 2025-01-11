'use client'

import { useState, useRef, ChangeEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import { FaStar } from 'react-icons/fa'
import { addDoc, collection, getDocs, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase/config'
import Image from 'next/image'
import { Camera, Plus, Coins } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"


interface TipoServico {
  id: string;
  nome: string;
}

export default function Indicar() {
  const [nome, setNome] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [servico, setServico] = useState('')
  const [novoServico, setNovoServico] = useState('')
  const [contato, setContato] = useState('')
  const [descricao, setDescricao] = useState('')
  const [avaliacao, setAvaliacao] = useState(0)
  const [hover, setHover] = useState(0)
  const [loading, setLoading] = useState(false)
  const [cartaoVisita, setCartaoVisita] = useState<File | null>(null)
  const [cartaoVisitaPreview, setCartaoVisitaPreview] = useState<string | null>(null)
  const [servicoPrestadoPara, setServicoPrestadoPara] = useState('proprio')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const router = useRouter()

  const [tiposServico, setTiposServico] = useState<TipoServico[]>([])

  useEffect(() => {
    fetchTiposServico()
  }, [])

  const fetchTiposServico = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tipos'))
      const tipos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome
      }))
      setTiposServico(tipos)
    } catch (error) {
      console.error('Erro ao buscar tipos de serviço:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tipos de serviço.",
        variant: "destructive",
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setCartaoVisita(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setCartaoVisitaPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        alert('Por favor, selecione uma imagem ou um vídeo.')
      }
    }
  }

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    let formattedValue = ''

    if (value.length <= 11) {
      formattedValue = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else {
      formattedValue = value.slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }

    setContato(formattedValue)
  }

  const sendToWebhook = async (data: any) => {
    try {
      const response = await fetch('https://webhook.nexuinsolution.com.br/webhook/2a85dafb-2c6d-48db-8975-2f808ccbb8ed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar dados para o webhook');
      }

      console.log('Dados enviados com sucesso para o webhook');
    } catch (error) {
      console.error('Erro ao enviar dados para o webhook:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !nome.trim() || !empresa.trim() || (!servico && !novoServico) || !contato.trim() || !descricao.trim() || avaliacao === 0) {
      alert('Por favor, preencha todos os campos e faça uma avaliação.')
      return
    }

    setLoading(true)

    try {
      let servicoFinal = servico || novoServico

      if (novoServico) {
        const novoTipoRef = await addDoc(collection(db, 'tipos'), { nome: novoServico })
        setTiposServico([...tiposServico, { id: novoTipoRef.id, nome: novoServico }])
      }

      let cartaoVisitaUrl = ''
      if (cartaoVisita) {
        const cartaoVisitaRef = ref(storage, `cartoes-visita/${user.uid}/${Date.now()}-${cartaoVisita.name}`)
        await uploadBytes(cartaoVisitaRef, cartaoVisita)
        cartaoVisitaUrl = await getDownloadURL(cartaoVisitaRef)
      }

      const indicacaoData = {
        nome,
        empresa,
        servico: servicoFinal,
        contato,
        descricao,
        avaliacao,
        cartaoVisitaUrl,
        servicoPrestadoPara,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Usuário Anônimo',
        timestamp: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'indicacoes'), indicacaoData)

      await sendToWebhook({
        ...indicacaoData,
        id: docRef.id
      });

      // Award points to the user
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        points: increment(20)
      })

      // Add a transaction to the points history
      await addDoc(collection(db, 'pontosTransactions'), {
        userId: user.uid,
        indicacaoId: docRef.id,
        amount: 20,
        description: 'Indicação de serviço',
        createdAt: serverTimestamp()
      })

      toast({
        title: "Indicação enviada com sucesso!",
        description: (
          <div className="flex items-center">
            <Coins className="w-6 h-6 text-yellow-500 mr-2" />
            <span>Você ganhou <strong>20 coins</strong> pela sua indicação!</span>
          </div>
        ),
        className: "bg-green-50 border-green-200",
      })

      // Resetar o formulário
      setNome('')
      setEmpresa('')
      setServico('')
      setNovoServico('')
      setContato('')
      setDescricao('')
      setAvaliacao(0)
      setCartaoVisita(null)
      setCartaoVisitaPreview(null)
      setServicoPrestadoPara('proprio')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Erro ao enviar indicação:', error)
      toast({
        title: "Erro",
        description: "Erro ao enviar indicação. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddNewServiceType = async () => {
    if (!novoServico.trim()) {
      toast({
        title: "Erro",
        description: "O nome do tipo de serviço não pode estar vazio.",
        variant: "destructive",
      })
      return
    }

    try {
      const docRef = await addDoc(collection(db, 'tipos'), { nome: novoServico })
      const newType = { id: docRef.id, nome: novoServico }
      setTiposServico([...tiposServico, newType])
      setServico(docRef.id)
      setNovoServico('')
      toast({
        title: "Sucesso",
        description: "Novo tipo de serviço adicionado com sucesso!",
      })
    } catch (error) {
      console.error('Erro ao adicionar novo tipo de serviço:', error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o novo tipo de serviço.",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Indicar um Serviço</h1>
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="nome">Nome do Profissional</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="empresa">Nome da Empresa (se aplicável)</Label>
              <Input
                id="empresa"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="servico">Tipo de Serviço</Label>
              <div className="flex space-x-2">
                <Select value={servico} onValueChange={setServico}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposServico.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.nome}>{tipo.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex">
                  <Input
                    placeholder="Novo tipo de serviço"
                    value={novoServico}
                    onChange={(e) => setNovoServico(e.target.value)}
                    className="rounded-r-none"
                  />
                  <Button 
                    type="button"
                    onClick={handleAddNewServiceType}
                    className="rounded-l-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <Label htmlFor="contato">Contato</Label>
              <Input
                id="contato"
                value={contato}
                onChange={handlePhoneChange}
                placeholder="(99) 99999-9999"
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="descricao">Descrição do Serviço</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="mb-4">
              <Label>Avaliação</Label>
              <div className="flex">
                {[...Array(5)].map((star, index) => {
                  const ratingValue = index + 1
                  return (
                    <label key={index}>
                      <input
                        type="radio"
                        name="rating"
                        value={ratingValue}
                        onClick={() => setAvaliacao(ratingValue)}
                        className="hidden"
                      />
                      <FaStar
                        className="cursor-pointer"
                        color={ratingValue <= (hover || avaliacao) ? "#ffc107" : "#e4e5e9"}
                        size={30}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                      />
                    </label>
                  )
                })}
              </div>
            </div>
            <div className="mb-4">
              <Label htmlFor="cartaoVisita">Cartão de Visita (opcional)</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {cartaoVisitaPreview ? (
                    <div className="relative w-full h-48 mb-4">
                      <Image
                        src={cartaoVisitaPreview}
                        alt="Prévia do cartão de visita"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  ) : (
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="cartaoVisita"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Carregar um arquivo</span>
                      <input
                        id="cartaoVisita"
                        name="cartaoVisita"
                        type="file"
                        className="sr-only"
                        onChange={handleImageChange}
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
            <div className="mb-4">
              <Label>O serviço foi prestado para:</Label>
              <div className="flex">
                <label className="mr-4 flex items-center">
                  <input
                    type="radio"
                    value="proprio"
                    checked={servicoPrestadoPara === 'proprio'}
                    onChange={(e) => setServicoPrestadoPara(e.target.value)}
                    className="mr-2"
                  />
                  <span>Você mesmo</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="amigo"
                    checked={servicoPrestadoPara === 'amigo'}
                    onChange={(e) => setServicoPrestadoPara(e.target.value)}
                    className="mr-2"
                  />
                  <span>Amigo/Conhecido</span>
                </label>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Enviando...' : 'Enviar Indicação'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}

