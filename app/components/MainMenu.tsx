'use client'

import Link from 'next/link';
import { Home, Briefcase, PlusCircle, UserCircle } from 'lucide-react';

interface MainMenuProps {
  currentPage: 'feed' | 'servicos' | 'indicar' | 'perfil';
  isMobile?: boolean;
}

const menuItems = [
  { href: '/dashboard', icon: Home, label: 'Feed' },
  { href: '/servicos', icon: Briefcase, label: 'Serviços' },
  { href: '/indicar', icon: PlusCircle, label: 'Indicar' },
  { href: '/perfil', icon: UserCircle, label: 'Perfil' },
];

export default function MainMenu({ currentPage, isMobile = false }: MainMenuProps) {
  return (
    <nav className={`flex ${isMobile ? 'w-full justify-between px-2' : 'space-x-4'}`}>
      {menuItems.map((item) => (
        <Link 
          key={item.href} 
          href={item.href} 
          className={`flex items-center ${isMobile ? 'flex-col text-xs py-2' : 'px-3 py-2'} rounded-md transition-colors ${
            isMobile ? 'text-blue-800 flex-1 justify-center' : ''
          } ${
            currentPage === item.label.toLowerCase() 
              ? isMobile ? 'bg-blue-200 text-blue-800' : 'bg-blue-700 text-white'
              : isMobile ? 'text-blue-800 hover:bg-blue-100' : 'text-white hover:bg-blue-500'
          }`}
        >
          <item.icon 
            size={isMobile ? 24 : 24} 
            className={`${isMobile ? 'mb-1 text-blue-800' : 'mr-2 text-white'}`} 
          />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

