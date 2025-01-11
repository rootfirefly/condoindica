'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../firebase/config'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Publicidade {
  id: string;
  titulo: string;
  descricao: string;
  link: string;
  bannerMobileUrl: string;
  bannerDesktopUrl: string;
  bannerFeedUrl: string;
  status: 'on' | 'off';
}

export default function CadastroPublicidade() {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [link, setLink] = useState('')
  const [bannerMobile, setBannerMobile] = useState<File | null>(null)
  const [bannerDesktop, setBannerDesktop] = useState<File | null>(null)
  const [bannerFeed, setBannerFeed] = useState<File | null>(null)
  const [bannerMobilePreview, setBannerMobilePreview] = useState<string | null>(null)
  const [bannerDesktopPreview, setBannerDesktopPreview] = useState<string | null>(null)
  const [bannerFeedPreview, setBannerFeedPreview] = useState<string | null>(null)
  const [publicidades, setPublicidades] = useState<Publicidade[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const fileInputRefMobile = useRef<HTMLInputElement>(null)
  const fileInputRefDesktop = useRef<HTMLInputElement>(null)
  const fileInputRefFeed = useRef<HTMLInputElement>(null)
  const [editingPublicidade, setEditingPublicidade] = useState<Publicidade | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleBannerChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setBanner: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    currentUrl?: string
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setBanner(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else if (currentUrl) {
      setPreview(currentUrl)
    }
  }

  const validateImageSize = (file: File, width: number, height: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(img.src)
        resolve(img.width === width && img.height === height)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!bannerMobile || !bannerDesktop || !bannerFeed) {
      setError('Por favor, faça o upload de todos os banners.')
      setLoading(false)
      return
    }

    try {
      console.log('Iniciando upload dos banners...')
      const uploadBanner = async (banner: File, path: string) => {
        const bannerRef = ref(storage, `publicidades/${path}/${Date.now()}-${banner.name}`)
        await uploadBytes(bannerRef, banner)
        return getDownloadURL(bannerRef)
      }

      const [bannerMobileUrl, bannerDesktopUrl, bannerFeedUrl] = await Promise.all([
        uploadBanner(bannerMobile, 'mobile'),
        uploadBanner(bannerDesktop, 'desktop'),
        uploadBanner(bannerFeed, 'feed')
      ])
      console.log('Upload dos banners concluído.')

      const novaPublicidade = {
        titulo,
        descricao,
        link,
        bannerMobileUrl,
        bannerDesktopUrl,
        bannerFeedUrl,
        status: 'on' as const
      }

      console.log('Adicionando nova publicidade ao Firestore:', novaPublicidade)
      const docRef = await addDoc(collection(db, 'publicidades'), novaPublicidade)
      console.log('Publicidade adicionada com ID:', docRef.id)

      setPublicidades(prevPublicidades => [...prevPublicidades, { id: docRef.id, ...novaPublicidade }])

      // Limpar o formulário
      setTitulo('')
      setDescricao('')
      setLink('')
      setBannerMobile(null)
      setBannerDesktop(null)
      setBannerFeed(null)
      setBannerMobilePreview(null)
      setBannerDesktopPreview(null)
      setBannerFeedPreview(null)
      if (fileInputRefMobile.current) fileInputRefMobile.current.value = ''
      if (fileInputRefDesktop.current) fileInputRefDesktop.current.value = ''
      if (fileInputRefFeed.current) fileInputRefFeed.current.value = ''

      toast({
        title: "Sucesso",
        description: "Publicidade cadastrada com sucesso.",
      })

      // Atualizar a lista de publicidades
      await fetchPublicidades()
    } catch (error) {
      console.error('Erro ao cadastrar publicidade:', error)
      setError('Erro ao cadastrar publicidade. Por favor, tente novamente.')
      toast({
        title: "Erro",
        description: "Erro ao cadastrar publicidade. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPublicidades = async () => {
    try {
      console.log('Buscando publicidades...')
      const querySnapshot = await getDocs(collection(db, 'publicidades'))
      console.log('Número de publicidades encontradas:', querySnapshot.size)
      const publicidadesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Publicidade[]
      setPublicidades(publicidadesData)
      console.log('Publicidades atualizadas no estado:', publicidadesData)
    } catch (error) {
      console.error('Erro ao buscar publicidades:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as publicidades.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchPublicidades()
  }, [])

  const handleEdit = (publicidade: Publicidade) => {
    setEditingPublicidade(publicidade)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta publicidade?')) {
      try {
        await deleteDoc(doc(db, 'publicidades', id))
        setPublicidades(publicidades.filter(pub => pub.id !== id))
        toast({
          title: "Sucesso",
          description: "Publicidade excluída com sucesso.",
        })
      } catch (error) {
        console.error('Erro ao excluir publicidade:', error)
        toast({
          title: "Erro",
          description: "Não foi possível excluir a publicidade.",
          variant: "destructive",
        })
      }
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: 'on' | 'off') => {
    const newStatus = currentStatus === 'on' ? 'off' : 'on'
    try {
      await updateDoc(doc(db, 'publicidades', id), { status: newStatus })
      setPublicidades(publicidades.map(pub =>
        pub.id === id ? { ...pub, status: newStatus } : pub
      ))
      toast({
        title: "Sucesso",
        description: `Status da publicidade alterado para ${newStatus}.`,
      })
    } catch (error) {
      console.error('Erro ao atualizar status da publicidade:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da publicidade.",
        variant: "destructive",
      })
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPublicidade) return

    setLoading(true)
    setError(null)

    try {
      const updatedPublicidade = { ...editingPublicidade }

      // Upload new banners if they were changed
      if (bannerMobile) {
        updatedPublicidade.bannerMobileUrl = await uploadBanner(bannerMobile, 'mobile')
      }
      if (bannerDesktop) {
        updatedPublicidade.bannerDesktopUrl = await uploadBanner(bannerDesktop, 'desktop')
      }
      if (bannerFeed) {
        updatedPublicidade.bannerFeedUrl = await uploadBanner(bannerFeed, 'feed')
      }

      await updateDoc(doc(db, 'publicidades', editingPublicidade.id), updatedPublicidade)

      setPublicidades(prevPublicidades =>
        prevPublicidades.map(pub =>
          pub.id === editingPublicidade.id ? updatedPublicidade : pub
        )
      )

      setIsEditModalOpen(false)
      setEditingPublicidade(null)
      resetForm()

      toast({
        title: "Sucesso",
        description: "Publicidade atualizada com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao atualizar publicidade:', error)
      setError('Erro ao atualizar publicidade. Por favor, tente novamente.')
      toast({
        title: "Erro",
        description: "Erro ao atualizar publicidade. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitulo('')
    setDescricao('')
    setLink('')
    setBannerMobile(null)
    setBannerDesktop(null)
    setBannerFeed(null)
    setBannerMobilePreview(null)
    setBannerDesktopPreview(null)
    setBannerFeedPreview(null)
    if (fileInputRefMobile.current) fileInputRefMobile.current.value = ''
    if (fileInputRefDesktop.current) fileInputRefDesktop.current.value = ''
    if (fileInputRefFeed.current) fileInputRefFeed.current.value = ''
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Cadastro de Publicidade</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="link">Link</Label>
          <Input id="link" type="url" value={link} onChange={(e) => setLink(e.target.value)} required />
        </div>
        <div>
          <Label>Banner Mobile (320x480px)</Label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {bannerMobilePreview ? (
                <Image src={bannerMobilePreview} alt="Banner Mobile preview" width={160} height={240} objectFit="contain" />
              ) : (
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600">
                <label htmlFor="banner-mobile-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload banner mobile</span>
                  <input
                    id="banner-mobile-upload"
                    name="banner-mobile-upload"
                    type="file"
                    className="sr-only"
                    onChange={(e) => handleBannerChange(e, setBannerMobile, setBannerMobilePreview)}
                    ref={fileInputRefMobile}
                    accept="image/*"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF até 5MB</p>
            </div>
          </div>
        </div>
        <div>
          <Label>Banner Desktop (728x90px)</Label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {bannerDesktopPreview ? (
                <Image src={bannerDesktopPreview} alt="Banner Desktop preview" width={364} height={45} objectFit="contain" />
              ) : (
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600">
                <label htmlFor="banner-desktop-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload banner desktop</span>
                  <input
                    id="banner-desktop-upload"
                    name="banner-desktop-upload"
                    type="file"
                    className="sr-only"
                    onChange={(e) => handleBannerChange(e, setBannerDesktop, setBannerDesktopPreview)}
                    ref={fileInputRefDesktop}
                    accept="image/*"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF até 5MB</p>
            </div>
          </div>
        </div>
        <div>
          <Label>Banner Feed (1000x1000px)</Label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {bannerFeedPreview ? (
                <Image src={bannerFeedPreview} alt="Banner Feed preview" width={200} height={200} objectFit="contain" />
              ) : (
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600">
                <label htmlFor="banner-feed-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload banner feed</span>
                  <input
                    id="banner-feed-upload"
                    name="banner-feed-upload"
                    type="file"
                    className="sr-only"
                    onChange={(e) => handleBannerChange(e, setBannerFeed, setBannerFeedPreview)}
                    ref={fileInputRefFeed}
                    accept="image/*"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF até 5MB</p>
            </div>
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar Publicidade'}
        </Button>
      </form>

      <h3 className="text-xl font-bold mb-2">Lista de Publicidades</h3>
      <Table>
  <TableHeader>
    <TableRow>
      <TableHead>Título</TableHead>
      <TableHead>Descrição</TableHead>
      <TableHead>Link</TableHead>
      <TableHead>Banners</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Ações</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {publicidades.map((publicidade) => (
      <TableRow key={publicidade.id}>
        <TableCell>{publicidade.titulo}</TableCell>
        <TableCell>{publicidade.descricao}</TableCell>
        <TableCell>
          <a href={publicidade.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {publicidade.link}
          </a>
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Image src={publicidade.bannerMobileUrl} alt="Banner Mobile" width={40} height={60} objectFit="contain" />
            <Image src={publicidade.bannerDesktopUrl} alt="Banner Desktop" width={72} height={9} objectFit="contain" />
            <Image src={publicidade.bannerFeedUrl} alt="Banner Feed" width={50} height={50} objectFit="contain" />
          </div>
        </TableCell>
        <TableCell>
          <Switch
            checked={publicidade.status === 'on'}
            onCheckedChange={() => handleToggleStatus(publicidade.id, publicidade.status)}
          />
        </TableCell>
        <TableCell>
          <Button variant="outline" size="sm" onClick={() => handleEdit(publicidade)} className="mr-2">
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(publicidade.id)}>
            Excluir
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Editar Publicidade</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleEditSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-titulo">Título</Label>
        <Input
          id="edit-titulo"
          value={editingPublicidade?.titulo || ''}
          onChange={(e) => setEditingPublicidade(prev => prev ? {...prev, titulo: e.target.value} : null)}
          required
        />
      </div>
      <div>
        <Label htmlFor="edit-descricao">Descrição</Label>
        <Textarea
          id="edit-descricao"
          value={editingPublicidade?.descricao || ''}
          onChange={(e) => setEditingPublicidade(prev => prev ? {...prev, descricao: e.target.value} : null)}
          required
        />
      </div>
      <div>
        <Label htmlFor="edit-link">Link</Label>
        <Input
          id="edit-link"
          type="url"
          value={editingPublicidade?.link || ''}
          onChange={(e) => setEditingPublicidade(prev => prev ? {...prev, link: e.target.value} : null)}
          required
        />
      </div>
      <div>
        <Label>Banner Mobile (320x480px)</Label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {bannerMobilePreview || editingPublicidade?.bannerMobileUrl ? (
              <Image
                src={bannerMobilePreview || editingPublicidade?.bannerMobileUrl || ''}
                alt="Banner Mobile preview"
                width={160}
                height={240}
                objectFit="contain"
              />
            ) : (
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
            )}
            <div className="flex text-sm text-gray-600">
              <label htmlFor="edit-banner-mobile-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                <span>Alterar banner mobile</span>
                <input
                  id="edit-banner-mobile-upload"
                  name="edit-banner-mobile-upload"
                  type="file"
                  className="sr-only"
                  onChange={(e) => handleBannerChange(e, setBannerMobile, setBannerMobilePreview, editingPublicidade?.bannerMobileUrl)}
                  accept="image/*"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Label>Banner Desktop (728x90px)</Label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {bannerDesktopPreview || editingPublicidade?.bannerDesktopUrl ? (
              <Image
                src={bannerDesktopPreview || editingPublicidade?.bannerDesktopUrl || ''}
                alt="Banner Desktop preview"
                width={364}
                height={45}
                objectFit="contain"
              />
            ) : (
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
            )}
            <div className="flex text-sm text-gray-600">
              <label htmlFor="edit-banner-desktop-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                <span>Alterar banner desktop</span>
                <input
                  id="edit-banner-desktop-upload"
                  name="edit-banner-desktop-upload"
                  type="file"
                  className="sr-only"
                  onChange={(e) => handleBannerChange(e, setBannerDesktop, setBannerDesktopPreview, editingPublicidade?.bannerDesktopUrl)}
                  accept="image/*"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Label>Banner Feed (1000x1000px)</Label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {bannerFeedPreview || editingPublicidade?.bannerFeedUrl ? (
              <Image
                src={bannerFeedPreview || editingPublicidade?.bannerFeedUrl || ''}
                alt="Banner Feed preview"
                width={200}
                height={200}
                objectFit="contain"
              />
            ) : (
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
            )}
            <div className="flex text-sm text-gray-600">
              <label htmlFor="edit-banner-feed-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                <span>Alterar banner feed</span>
                <input
                  id="edit-banner-feed-upload"
                  name="edit-banner-feed-upload"
                  type="file"
                  className="sr-only"
                  onChange={(e) => handleBannerChange(e, setBannerFeed, setBannerFeedPreview, editingPublicidade?.bannerFeedUrl)}
                  accept="image/*"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
    </div>
  )
}

