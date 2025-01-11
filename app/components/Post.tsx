'use client'

import { useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, Heart } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import Image from 'next/image';
import CommentSection from './CommentSection';
import { ref, deleteObject } from 'firebase/storage';
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface PostProps {
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
  onDelete: (id: string) => void;
  onUpdate: (id: string, newContent: string) => void;
  onLike: () => void;
  onLove: () => void;
  onCommentCountChange: (id: string, count: number) => void;
}

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
  const year = date.getFullYear();
  return `${day} de ${month} ${year}`;
};

export default function Post({ id, author, authorId, authorPhotoURL, content, mediaUrl, mediaType, timestamp, likes, loves, comments, onDelete, onUpdate, onLike, onLove, onCommentCountChange }: PostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes.length);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [commentCount, setComments] = useState(comments); // Added state for comment count
  const { user } = useAuth();

  const handleLike = async () => {
    if (!user) return;
    onLike();
  };

  const handleLove = async () => {
    if (!user) return;
    onLove();
  };

  const handleShare = () => {
    // Implementar lógica de compartilhamento
    alert('Funcionalidade de compartilhamento a ser implementada');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (editedContent.trim() !== content) {
      await onUpdate(id, editedContent);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta postagem?')) {
      if (mediaUrl) {
        const mediaRef = ref(storage, mediaUrl);
        await deleteObject(mediaRef);
      }
      await onDelete(id);
    }
  };

  const handleCommentCountChange = (count: number) => { // Updated handleCommentCountChange function
    setComments(count);
    onCommentCountChange(id, count);
  };

  const isAuthor = user && user.uid === authorId;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
          {authorPhotoURL ? (
            <Image
              src={authorPhotoURL}
              alt={`Foto de perfil de ${author}`}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {author.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-grow">
          <h3 className="font-semibold text-lg">{author}</h3>
          <p className="text-sm text-gray-500">{formatDate(timestamp)}</p>
        </div>
        {isAuthor && (
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-gray-500 hover:text-gray-700"
            >
              •••
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <button 
                  onClick={() => {
                    handleEdit();
                    setIsMenuOpen(false);
                  }} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Editar
                </button>
                <button 
                  onClick={() => {
                    handleDelete();
                    setIsMenuOpen(false);
                  }} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-2 border rounded-lg resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <Button onClick={handleSaveEdit} className="mr-2">
              Salvar
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <p className="mb-4 text-gray-700">{content}</p>
      )}
      {mediaUrl && (
        <div className="mt-4 mb-4">
          {mediaType === 'image' ? (
            <>
              {imageLoading && <Skeleton className="w-full h-64" />}
              <Image
                src={mediaUrl}
                alt="Post image"
                width={500}
                height={300}
                layout="responsive"
                className={`rounded-lg ${imageLoading ? 'hidden' : ''}`}
                onLoad={() => setImageLoading(false)}
              />
            </>
          ) : mediaType === 'video' ? (
            <video
              src={mediaUrl}
              controls
              className="w-full rounded-lg"
            />
          ) : null}
        </div>
      )}
      <div className="flex space-x-4 text-sm text-gray-500 mb-2">
        <button 
          className={`hover:text-blue-600 transition-colors ${isLiked ? 'text-blue-600' : ''}`}
          onClick={handleLike}
        >
          <ThumbsUp className="inline mr-1" size={16} /> {likes.length}
        </button>
        <button 
          className={`hover:text-red-600 transition-colors ${loves.includes(user?.uid || '') ? 'text-red-600' : ''}`}
          onClick={handleLove}
        >
          <Heart className="inline mr-1" size={16} /> {loves.length}
        </button>
        <button 
          className="hover:text-blue-600 transition-colors"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="inline mr-1" size={16} />
          {commentCount} {commentCount === 1 ? 'comentário' : 'comentários'}
        </button>
        <button 
          className="hover:text-blue-600 transition-colors"
          onClick={handleShare}
        >
          <Share2 className="inline mr-1" size={16} /> Compartilhar
        </button>
      </div>
      {showComments && (
        <CommentSection 
          postId={id} 
          onCommentCountChange={handleCommentCountChange} // Updated to use the new function
        />
      )}
    </div>
  );
}

