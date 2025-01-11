'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Post from '../components/Post';
import IndicacaoCommentSection from '../components/IndicacaoCommentSection';
import Link from 'next/link';
import { collection, query, orderBy, addDoc, onSnapshot, updateDoc, deleteDoc, doc, getDocs, where, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { Star, Home, Briefcase, PlusCircle, UserCircle, ThumbsUp, MessageCircle, Share2, Heart, Image, ImageIcon } from 'lucide-react';
import MainMenu from '../components/MainMenu';
import { checkUserProfile } from '../utils/userProfile';
import { PostSkeleton, IndicacaoSkeleton, NewPostSkeleton } from '../components/Skeletons';
import Footer from '../components/Footer';

interface PostData {
  id: string;
  author: string;
  authorId: string;
  authorPhotoURL?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | null;
  timestamp: string;
  likes: string[];
  loves: string[];
  comments: number;
}

interface IndicacaoData {
  id: string;
  nome: string;
  empresa: string;
  servico: string;
  descricao: string;
  avaliacao: number;
  timestamp: string;
  userEmail: string;
  userName: string;
  likes: string[];
  loves: string[];
  comments: number;
}

interface IndicacaoComment {
  rating: number;
}

type FeedItem = PostData | (IndicacaoData & { type: 'indicacao' });

export default function Dashboard() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [newPost, setNewPost] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profileCompleted } = useAuth();
  const router = useRouter();
  const [expandedIndicacao, setExpandedIndicacao] = useState<string | null>(null);
  //const [isProfileComplete, setIsProfileComplete] = useState(false);


  useEffect(() => {
    console.log('Dashboard: useEffect triggered', { user, profileCompleted });
    if (!user) {
      console.log('Dashboard: No user, redirecting to login');
      router.push('/login');
    } else if (!profileCompleted) {
      console.log('Dashboard: Profile not completed, redirecting to profile');
      router.push('/perfil');
    } else {
      console.log('Dashboard: User authorized, fetching feed items');
      fetchFeedItems();
    }
  }, [user, profileCompleted, router]);

  const fetchFeedItems = () => {
    if (user) {
      const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
      const indicacoesQuery = query(collection(db, 'indicacoes'), orderBy('timestamp', 'desc'));

      const unsubscribePosts = onSnapshot(postsQuery, (querySnapshot) => {
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PostData[];

        const unsubscribeIndicacoes = onSnapshot(indicacoesQuery, async (querySnapshot) => {
          const fetchedIndicacoes = await Promise.all(querySnapshot.docs.map(async doc => {
            const indicacao = { id: doc.id, ...doc.data() } as IndicacaoData & { type: 'indicacao' };
            indicacao.type = 'indicacao';

            // Buscar comentários para esta indicação
            const commentsQuery = query(collection(db, 'indicacaoComments'), where('indicacaoId', '==', doc.id));
            const commentsSnapshot = await getDocs(commentsQuery);
            const comments = commentsSnapshot.docs.map(commentDoc => commentDoc.data() as IndicacaoComment);

            // Calcular a média de avaliação
            const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0) + indicacao.avaliacao;
            const averageRating = (totalRating / (comments.length + 1)).toFixed(1);

            return {
              ...indicacao,
              avaliacao: parseFloat(averageRating),
              comments: comments.length,
              likes: indicacao.likes || [],
              loves: indicacao.loves || []
            };
          }));

          const allItems = [...fetchedPosts, ...fetchedIndicacoes].sort((a, b) =>
            b.timestamp.localeCompare(a.timestamp)
          );

          setFeedItems(allItems);
          setLoading(false);
        });

        return () => {
          unsubscribePosts();
          unsubscribeIndicacoes();
        };
      });
    }
  };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setImage(file);
      } else {
        alert('Por favor, selecione uma imagem ou um vídeo.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!newPost.trim() && !image)) return;

    setLoading(true);

    try {
      let mediaUrl = '';
      let mediaType = null;
      if (image) {
        const mediaRef = ref(storage, `posts/${user.uid}/${Date.now()}-${image.name}`);
        await uploadBytes(mediaRef, image);
        mediaUrl = await getDownloadURL(mediaRef);
        mediaType = image.type.startsWith('image/') ? 'image' : 'video';
      }

      await addDoc(collection(db, 'posts'), {
        author: user.displayName || user.email,
        authorId: user.uid,
        authorPhotoURL: user.photoURL || '',
        content: newPost,
        mediaUrl,
        mediaType,
        timestamp: new Date().toISOString(),
        likes: [],
        loves: [],
        comments: 0
      });

      setNewPost('');
      setImage(null);
    } catch (error) {
      console.error('Error adding post: ', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePost = async (id: string, newContent: string) => {
    try {
      const postRef = doc(db, 'posts', id);
      await updateDoc(postRef, { content: newContent });
    } catch (error) {
      console.error('Error updating post: ', error);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const postToDelete = feedItems.find(item => item.id === id && 'mediaUrl' in item) as PostData;
      if (postToDelete?.mediaUrl) {
        const imageRef = ref(storage, postToDelete.mediaUrl);
        try {
          await deleteObject(imageRef);
        } catch (error: any) {
          if (error.code !== 'storage/object-not-found') {
            console.error('Erro ao excluir imagem:', error);
          }
        }
      }
      await deleteDoc(doc(db, 'posts', id));
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      throw error;
    }
  };

  const handleUpdateAverageRating = async (indicacaoId: string, newAverageRating: number) => {
    if (!indicacaoId) {
      console.error('indicacaoId is undefined in handleUpdateAverageRating');
      return;
    }
    try {
      const indicacaoRef = doc(db, 'indicacoes', indicacaoId);
      await updateDoc(indicacaoRef, { avaliacao: newAverageRating });
    } catch (error) {
      console.error('Error updating average rating:', error);
    }
  };

  const toggleIndicacaoExpansion = (id: string) => {
    setExpandedIndicacao(expandedIndicacao === id ? null : id);
  };

  const handleLike = async (item: FeedItem) => {
    if (!user) return;
    const itemRef = doc(db, item.type === 'indicacao' ? 'indicacoes' : 'posts', item.id);
    if (item.likes.includes(user.uid)) {
      await updateDoc(itemRef, { likes: arrayRemove(user.uid) });
    } else {
      await updateDoc(itemRef, { likes: arrayUnion(user.uid) });
    }
  };

  const handleLove = async (item: FeedItem) => {
    if (!user) return;
    const itemRef = doc(db, item.type === 'indicacao' ? 'indicacoes' : 'posts', item.id);
    if (item.loves.includes(user.uid)) {
      await updateDoc(itemRef, { loves: arrayRemove(user.uid) });
    } else {
      await updateDoc(itemRef, { loves: arrayUnion(user.uid) });
    }
  };

  const handleCommentCountChange = (postId: string, count: number) => {
    setFeedItems(prevItems => 
      prevItems.map(item => 
        item.id === postId && !('type' in item) ? { ...item, comments: count } : item
      )
    );
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user || !profileCompleted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          {/* Área de criação de post */}
          {loading ? (
            <NewPostSkeleton />
          ) : (
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-4 mb-6">
              <form onSubmit={handleSubmit}>
                <textarea
                  className="w-full p-2 border rounded-lg resize-none"
                  rows={3}
                  placeholder="O que você quer compartilhar?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                ></textarea>
                <div className="mt-2 flex justify-between items-center">
                  <label htmlFor="imageUpload" className="flex items-center cursor-pointer text-gray-600 hover:text-blue-600 transition-colors">
                    <ImageIcon size={20} className="mr-2" />
                    <span>Foto/Vídeo</span>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Publicando...' : 'Publicar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de posts e indicações */}
          <div className="w-full max-w-2xl space-y-4">
            {loading ? (
              <>
                <PostSkeleton />
                <IndicacaoSkeleton />
                <PostSkeleton />
              </>
            ) : (
              feedItems.map((item) => (
                'type' in item ? (
                  <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-semibold mb-2">Nova Indicação: {item.servico}</h2>
                    <p className="text-gray-600 mb-2">{item.empresa}</p>
                    <p className="text-gray-700 mb-4">{item.descricao}</p>
                    <div className="flex items-center mb-4">
                      <span className="text-gray-700 mr-2">Avaliação:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div key={star} className="relative">
                            <Star
                              className="text-gray-300"
                              size={20}
                              fill="currentColor"
                            />
                            <div
                              className="absolute top-0 left-0 overflow-hidden"
                              style={{ width: `${Math.max(0, Math.min(100, (item.avaliacao - star + 1) * 100))}%` }}
                            >
                              <Star
                                className="text-yellow-400"
                                size={20}
                                fill="currentColor"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600" aria-label={`Avaliação: ${item.avaliacao.toFixed(1)} de 5 estrelas`}>
                        ({item.avaliacao.toFixed(1)})
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Indicado por: {item.userName}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                    <div className="flex space-x-4 text-sm text-gray-500 mt-4">
                      <button
                        className={`flex items-center ${item.likes.includes(user.uid) ? 'text-blue-600' : 'hover:text-blue-600'} transition-colors`}
                        onClick={() => handleLike(item)}
                      >
                        <ThumbsUp className="mr-1" size={16} />
                        {item.likes.length}
                      </button>
                      <button
                        className={`flex items-center ${item.loves.includes(user.uid) ? 'text-red-600' : 'hover:text-red-600'} transition-colors`}
                        onClick={() => handleLove(item)}
                      >
                        <Heart className="mr-1" size={16} fill={item.loves.includes(user.uid) ? 'currentColor' : 'none'} />
                        {item.loves.length}
                      </button>
                      <button
                        className="flex items-center hover:text-blue-600 transition-colors"
                        onClick={() => toggleIndicacaoExpansion(item.id)}
                      >
                        <MessageCircle className="mr-1" size={16} />
                        {item.comments} {item.comments === 1 ? 'comentário' : 'comentários'}
                      </button>
                    </div>
                    {expandedIndicacao === item.id && item.id && (
                      <IndicacaoCommentSection
                        indicacaoId={item.id}
                        onUpdateAverageRating={(newRating) => handleUpdateAverageRating(item.id, newRating)}
                      />
                    )}
                  </div>
                ) : (
                  <Post
                    key={item.id}
                    {...item}
                    onDelete={handleDeletePost}
                    onUpdate={handleUpdatePost}
                    onLike={() => handleLike(item)}
                    onLove={() => handleLove(item)}
                    onCommentCountChange={handleCommentCountChange}
                  />
                )
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

