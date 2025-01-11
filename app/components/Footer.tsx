import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-blue-800 text-white py-4 text-center">
      <p>&copy; {new Date().getFullYear()} CondoIndica. Todos os direitos reservados.</p>
      <div className="mt-2 space-x-4">
        <Link href="/politica-de-privacidade" className="text-yellow-400 hover:underline">
          Política de Privacidade
        </Link>
        <Link href="/termos-de-uso" className="text-yellow-400 hover:underline">
          Termos de Uso
        </Link>
      </div>
    </footer>
  )
}

