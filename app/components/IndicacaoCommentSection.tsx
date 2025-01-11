'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { collection, query, where, addDoc, onSnapshot, Timestamp, serverTimestamp, doc, updateDoc, increment, runTransaction } from 'firebase/firestore'
import { db } from '../firebase/config'
import { FaStar } from 'react-icons/fa'
import { toast } from 'react-hot-toast'

interface Comment {
  id: string
  authorId: string
  authorName: string
  authorEmail: string
  content: string
  rating: number
  timestamp: Timestamp | null
}

interface IndicacaoCommentSectionProps {
  indicacaoId: string
  onUpdateAverageRating: (averageRating: number) => void
}

export default function IndicacaoCommentSection({ indicacaoId, onUpdateAverageRating }: IndicacaoCommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [newRating, setNewRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!indicacaoId) {
      console.error('indicacaoId is undefined');
      return;
    }

    const q = query(
      collection(db, 'indicacaoComments'),
      where('indicacaoId', '==', indicacaoId)
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedComments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      
      // Sort comments locally
      fetchedComments.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return b.timestamp.toMillis() - a.timestamp.toMillis();
        }
        return 0; // If either timestamp is null, don't change order
      });

      setComments(fetchedComments)

      // Calcular a média das avaliações
      const totalRating = fetchedComments.reduce((sum, comment) => sum + comment.rating, 0)
      const averageRating = fetchedComments.length > 0 ? totalRating / fetchedComments.length : 0
      onUpdateAverageRating(averageRating)
    })

    return () => unsubscribe()
  }, [indicacaoId, onUpdateAverageRating])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || newRating === 0 || !indicacaoId) {
      console.error('Missing required data for comment submission');
      return;
    }

    setLoading(true);

    try {
      await runTransaction(db, async (transaction) => {
        // Add the comment
        const commentRef = doc(collection(db, 'indicacaoComments'));
        transaction.set(commentRef, {
          indicacaoId,
          authorId: user.uid,
          authorName: user.displayName || 'Usuário Anônimo',
          authorEmail: user.email,
          content: newComment,
          rating: newRating,
          timestamp: serverTimestamp()
        });

        // Update user's points
        const userRef = doc(db, 'users', user.uid);
        transaction.update(userRef, {
          points: increment(5)
        });

        // Add a transaction to the points history
        const pointsTransactionRef = doc(collection(db, 'pontosTransactions'));
        transaction.set(pointsTransactionRef, {
          userId: user.uid,
          amount: 5,
          description: 'Avaliação de indicação no feed',
          createdAt: serverTimestamp()
        });
      });

      setNewComment('');
      setNewRating(0);
      toast({
        title: "Sucesso",
        description: "Avaliação enviada com sucesso! Você ganhou 5 coins.",
      });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar avaliação. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: Timestamp | null) => {
    if (timestamp) {
      return timestamp.toDate().toLocaleString();
    }
    return 'Data não disponível';
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Comentários e Avaliações</h3>
      <form onSubmit={handleSubmitComment} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Adicione seu comentário..."
          className="w-full p-2 border rounded-md mb-2"
          rows={3}
          required
        />
        <div className="flex items-center mb-2">
          <span className="mr-2">Avaliação:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`cursor-pointer ${star <= newRating ? 'text-yellow-400' : 'text-gray-300'}`}
              onClick={() => setNewRating(star)}
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Comentário'}
        </button>
      </form>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-100 p-4 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{comment.authorName}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={star <= comment.rating ? 'text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
            </div>
            <p>{comment.content}</p>
            <p className="text-sm text-gray-500 mt-2">
              {formatTimestamp(comment.timestamp)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

