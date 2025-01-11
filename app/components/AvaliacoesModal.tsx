import { useState, useEffect } from 'react'
import { FaStar, FaTimes } from 'react-icons/fa'
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

interface AvaliacoesModalProps {
  servicoId: string
  onClose: () => void
}

interface Avaliacao {
  id: string
  authorId: string
  authorName: string
  content: string
  rating: number
  timestamp: any
}

export default function AvaliacoesModal({ servicoId, onClose }: AvaliacoesModalProps) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [novaAvaliacao, setNovaAvaliacao] = useState(0)
  const [novoComentario, setNovoComentario] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchAvaliacoes()
  }, [servicoId])

  const fetchAvaliacoes = async () => {
    try {
      const q = query(
        collection(db, 'indicacaoComments'),
        where('indicacaoId', '==', servicoId)
      )
      const querySnapshot = await getDocs(q)
      const avaliacoesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Avaliacao[]
      
      // Sort the avaliacoes by timestamp in descending order
      avaliacoesData.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
      
      setAvaliacoes(avaliacoesData)
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error)
      setAvaliacoes([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAvaliacao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || novaAvaliacao === 0) return

    try {
      await addDoc(collection(db, 'indicacaoComments'), {
        indicacaoId: servicoId,
        authorId: user.uid,
        authorName: user.displayName || 'Usuário anônimo',
        content: novoComentario,
        rating: novaAvaliacao,
        timestamp: serverTimestamp()
      })

      setNovaAvaliacao(0)
      setNovoComentario('')
      fetchAvaliacoes()
    } catch (error) {
      console.error('Erro ao adicionar avaliação:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Avaliações</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>
        {loading ? (
          <p>Carregando avaliações...</p>
        ) : (
          <>
            <div className="mb-4 max-h-60 overflow-y-auto">
              {avaliacoes.length === 0 ? (
                <p>Nenhuma avaliação ainda.</p>
              ) : (
                avaliacoes.map((avaliacao) => (
                  <div key={avaliacao.id} className="mb-3 pb-3 border-b last:border-b-0">
                    <div className="flex items-center mb-1">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, index) => (
                          <FaStar
                            key={index}
                            className={index < avaliacao.rating ? "text-yellow-400" : "text-gray-300"}
                            size={16}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{avaliacao.authorName}</span>
                    </div>
                    <p className="text-sm text-gray-600">{avaliacao.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {avaliacao.timestamp?.toDate().toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSubmitAvaliacao} className="mt-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sua avaliação</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`cursor-pointer ${star <= novaAvaliacao ? "text-yellow-400" : "text-gray-300"}`}
                      size={24}
                      onClick={() => setNovaAvaliacao(star)}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mb-1">
                  Comentário
                </label>
                <textarea
                  id="comentario"
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar Avaliação
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

