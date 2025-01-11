'use client'

import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { checkSuperAdminStatus } from '../utils/userProfile'
import { Settings, Coins, FileText, Gift, UserPlus } from 'lucide-react'
import MainMenu from './MainMenu'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'

const formatNumber = (num: number): string => {
  return num.toLocaleString('pt-BR');
};

export default function Header() {
  const { user, isAuthorized } = useAuth()
  const router = useRouter()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [userPoints, setUserPoints] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadUserData() {
      if (user) {
        const superAdminStatus = await checkSuperAdminStatus(user.uid);
        setIsSuperAdmin(superAdminStatus);
      }
    }
    loadUserData();
  }, [user]);

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setUserPoints(userDoc.data().points || 0)
        }
      }
    }
    fetchUserPoints()
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (user) {
      e.preventDefault()
      router.push('/dashboard')
    }
  }

  return (
    <header className="bg-blue-600 text-white py-4 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="w-1/4 flex-shrink-0">
            <Link 
              href={user ? "/dashboard" : "/"} 
              className="hover:opacity-90 transition-opacity"
              onClick={handleLogoClick}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20(3)-qo0WmpFQZz5zNoyY2ETaso2KhjRUah.png"
                alt="CondoIndica"
                width={132}
                height={30}
                priority
              />
            </Link>
          </div>

          {/* Menu - centered on desktop, hidden on mobile */}
          {user && isAuthorized && (
            <nav className="hidden md:flex justify-center w-1/2">
              <div className="flex justify-center">
                <MainMenu currentPage={router.pathname.slice(1) as 'feed' | 'servicos' | 'indicar' | 'perfil'} />
              </div>
            </nav>
          )}

          {/* User Actions */}
          <div className="w-1/4 flex items-center justify-end space-x-4">
            {user ? (
              <>
                <div className="flex items-center relative" ref={dropdownRef}>
                  <div 
                    className="w-8 h-8 rounded-full overflow-hidden mr-2 cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt="Foto de perfil"
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-yellow-500 flex items-center justify-center text-blue-800 font-bold">
                        {user?.displayName ? user.displayName[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  <span className="hidden md:inline text-sm cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    Olá, {user?.displayName ? user.displayName.split(' ')[0] : user?.email?.split('@')[0] ?? 'Usuário'}
                  </span>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-[250px] w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        <div className="font-semibold">{formatNumber(userPoints)} coins</div>
                      </div>
                      <Link href="/pontos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Coins className="inline-block mr-2" size={16} />
                        Extrato Pontos
                      </Link>
                      <Link href="/cupons" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Gift className="inline-block mr-2" size={16} />
                        Cupons
                      </Link>
                      <Link href="/meus-cupons" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Gift className="inline-block mr-2" size={16} />
                        Meus Cupons
                      </Link>
                      <Link href="/extratoIndicacoes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <UserPlus className="inline-block mr-2" size={16} />
                        Suas Indicações
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-yellow-500 hover:bg-yellow-400 text-blue-800 font-semibold py-2 px-4 rounded-full transition-colors text-sm"
                >
                  Sair
                </button>
                {isSuperAdmin && (
                  <Link href="/superadmin/configuracoes" className="group relative">
                    <Settings className="h-6 w-6 text-white hover:text-yellow-400 transition-colors" />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Configurações de SuperAdmin
                    </span>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-yellow-400 transition-colors text-sm">
                  Login
                </Link>
                <Link href="/cadastro" className="bg-yellow-500 hover:bg-yellow-400 text-blue-800 font-semibold py-2 px-4 rounded-full transition-colors text-sm">
                  Cadastre-se
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <MainMenu currentPage={router.pathname.slice(1) as 'feed' | 'servicos' | 'indicar' | 'perfil'} isMobile={true} />
        </div>
      )}
    </header>
  )
}

