'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase/config'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import { updateProfile } from 'firebase/auth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Condominio {
  id: string;
  nome: string;
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export default function Perfil() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    nomeCompleto: '',
    condominio: '',
    bloco: '',
    apartamento: '',
    cep: '',
    logradouro: '',
    bairro: '',
    cidade: '',
    estado: '',
    inquilino: false,
    whatsapp: '',
    status: 'pendente',
    photoURL: '',
    role: 'morador',
    profileCompleted: false,
    createdAt: null,
    updatedAt: null
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [condominios, setCondominios] = useState<Condominio[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      loadUserProfile()
      fetchCondominios()
    }
  }, [user, loading, router])

  const loadUserProfile = async () => {
    if (user) {
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const userData = docSnap.data()
        setFormData(prev => ({ ...prev, ...userData }))
        setPhotoPreview(userData.photoURL || null)
        if (userData.createdAt) {
          setFormData(prev => ({ ...prev, createdAt: userData.createdAt.toDate() }))
        }
        if (userData.updatedAt) {
          setFormData(prev => ({ ...prev, updatedAt: userData.updatedAt.toDate() }))
        }
      } else {
        console.log('Nenhum documento de usuário encontrado')
      }
    }
  }

  const fetchCondominios = async () => {
    try {
      const condominiosCollection = collection(db, 'condominios')
      const condominiosSnapshot = await getDocs(condominiosCollection)
      const condominiosList = condominiosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Condominio[]
      setCondominios(condominiosList)
    } catch (error) {
      console.error('Erro ao buscar condomínios:', error)
      setError('Erro ao carregar a lista de condomínios. Por favor, tente novamente.')
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleCondominioChange = (value: string) => {
    if (value === "no_selection") {
      setFormData(prev => ({
        ...prev,
        condominio: "",
        cep: "",
        logradouro: "",
        bairro: "",
        cidade: "",
        estado: ""
      }))
    } else {
      const selectedCondominio = condominios.find(cond => cond.nome === value)
      if (selectedCondominio) {
        setFormData(prev => ({
          ...prev,
          condominio: selectedCondominio.nome,
          cep: selectedCondominio.cep,
          logradouro: selectedCondominio.logradouro,
          bairro: selectedCondominio.bairro,
          cidade: selectedCondominio.cidade,
          estado: selectedCondominio.estado
        }))
      }
    }
  }

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && user) {
      try {
        setIsLoading(true)
        setError('')

        // Create a preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload to Firebase Storage
        const storageRef = ref(storage, `profile_photos/${user.uid}/${Date.now()}-${file.name}`)
        const snapshot = await uploadBytes(storageRef, file)

        // Get download URL
        const photoURL = await getDownloadURL(snapshot.ref)

        // Update form data
        setFormData(prev => ({ ...prev, photoURL }))

        // Update user document in Firestore
        const userDocRef = doc(db, 'users', user.uid)
        await setDoc(userDocRef, { photoURL }, { merge: true })

        // Update user profile in Firebase Auth
        await updateProfile(user, { photoURL })

      } catch (error) {
        console.error('Erro ao fazer upload da foto:', error)
        setError('Falha ao fazer upload da foto. Por favor, tente novamente.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const sendWebhook = async (profileData: any) => {
    try {
      const response = await fetch('https://webhook.nexuinsolution.com.br/webhook/aa8c569a-695c-425e-acf6-7dcc0513beb4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to send webhook');
      }

      console.log('Webhook sent successfully');
    } catch (error) {
      console.error('Error sending webhook:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError('')

    try {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid)
        const now = new Date()
        const updatedFormData = {
          ...formData,
          updatedAt: now
        }
        if (!formData.createdAt) {
          updatedFormData.createdAt = now
        }

        // Atualizar o estado local
        setFormData(updatedFormData)

        // Salvar os dados do perfil no Firestore
        await setDoc(userDocRef, updatedFormData, { merge: true })

        // Enviar o webhook com todas as informações do perfil, incluindo as datas
        await sendWebhook({
          ...updatedFormData,
          userId: user.uid,
          email: user.email,
          createdAt: updatedFormData.createdAt ? updatedFormData.createdAt.toISOString() : null,
          updatedAt: updatedFormData.updatedAt.toISOString()
        });

        console.log('Perfil atualizado com sucesso e webhook enviado')
        alert('Perfil atualizado com sucesso!')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Erro ao salvar o perfil ou enviar webhook:', error)
      setError('Erro ao salvar o perfil. Por favor, tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">Complete seu Perfil</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full transition-colors"
          >
            Voltar
          </button>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
          <div className="mb-6 flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="Foto de perfil"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                  <Camera size={48} className="text-gray-400" />
                </div>
              )}
            </div>
            <label htmlFor="photo" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors">
              {photoPreview ? 'Alterar foto' : 'Adicionar foto'}
            </label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="nomeCompleto">Nome Completo</Label>
            <Input
              id="nomeCompleto"
              name="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="condominio">Nome do Condomínio</Label>
            <Select onValueChange={handleCondominioChange} value={formData.condominio || "no_selection"} defaultValue="no_selection">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha seu condomínio..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_selection">Escolha seu condomínio...</SelectItem>
                {condominios.map((condominio) => (
                  <SelectItem key={condominio.id} value={condominio.nome}>
                    {condominio.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label htmlFor="bloco">Bloco</Label>
            <Input
              id="bloco"
              name="bloco"
              value={formData.bloco}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="apartamento">Apartamento</Label>
            <Input
              id="apartamento"
              name="apartamento"
              value={formData.apartamento}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              name="cep"
              value={formData.cep}
              onChange={handleInputChange}
              disabled
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="logradouro">Logradouro</Label>
            <Input
              id="logradouro"
              name="logradouro"
              value={formData.logradouro}
              onChange={handleInputChange}
              disabled
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              name="bairro"
              value={formData.bairro}
              onChange={handleInputChange}
              disabled
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              name="cidade"
              value={formData.cidade}
              onChange={handleInputChange}
              disabled
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="estado">Estado</Label>
            <Input
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              disabled
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="inquilino"
                checked={formData.inquilino}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-gray-700 font-bold">Sou inquilino</span>
            </label>
          </div>

          <div className="mb-4">
            <Label htmlFor="whatsapp">Número do WhatsApp</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

