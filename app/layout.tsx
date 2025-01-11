'use client'

import './globals.css'
import { Poppins } from 'next/font/google'
import { AuthProvider } from './contexts/AuthContext'
import MainMenu from './components/MainMenu'
import { useAuth } from './contexts/AuthContext'
import { usePathname } from 'next/navigation'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'] })

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const currentPage = pathname.slice(1) as 'feed' | 'servicos' | 'indicar' | 'perfil'

  return (
    <body className={`${poppins.className} bg-gray-50 ${user ? 'logged-in' : ''}`}>
      <main className="pb-16 md:pb-0">
        {children}
      </main>
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <MainMenu currentPage={currentPage} isMobile={true} />
        </div>
      )}
    </body>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <AuthProvider>
        <LayoutContent>{children}</LayoutContent>
      </AuthProvider>
    </html>
  )
}

