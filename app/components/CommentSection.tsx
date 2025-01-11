'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { collection, query, where, orderBy, addDoc, onSnapshot, Timestamp, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

interface Comment {
  id: string
  author: string
  authorId: string
  authorPhotoURL?: string
  content: string
  timestamp: Timestamp
}

interface CommentSectionProps {
  postId: string;
  onCommentCountChange: (count: number) => void;
}

export default function CommentSection({ postId, onCommentCountChange }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('timestamp', 'desc')
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedComments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[]
      setComments(fetchedComments)
      setLoading(false)
      onCommentCountChange(fetchedComments.length)
    })

    return () => unsubscribe()
  }, [postId, onCommentCountChange])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setLoading(true)

    try {
      await addDoc(collection(db, 'comments'), {
        postId,
        author: user.displayName || 'Usuário Anônimo',
        authorId: user.uid,
        authorPhotoURL: user.photoURL || '',
        content: newComment,
        timestamp: serverTimestamp()
      })

      setNewComment('')
      onCommentCountChange(comments.length + 1)
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-4">Comentários</h3>
      <form onSubmit={handleSubmitComment} className="mb-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Adicione seu comentário..."
          className="w-full p-2 border rounded-md mb-2"
          rows={3}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Comentário'}
        </Button>
      </form>
      <div className="space-y-4">
        {loading ? (
          <CommentSkeleton />
        ) : comments.length === 0 ? (
          <p className="text-gray-500">Nenhum comentário ainda.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={comment.authorPhotoURL} alt={comment.author} />
                <AvatarFallback>{comment.author[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="font-semibold">{comment.author}</p>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {comment.timestamp?.toDate().toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const CommentSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="flex items-start space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-1/4 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    ))}
  </div>
)

