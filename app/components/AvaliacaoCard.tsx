import { Star } from 'lucide-react'

interface AvaliacaoCardProps {
  nome: string
  servico: string
  avaliacao: number
  comentario: string
}

export function AvaliacaoCard({ nome, servico, avaliacao, comentario }: AvaliacaoCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-transform duration-300 ease-in-out hover:scale-105">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
          {nome.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold">{nome}</h3>
          <p className="text-sm text-gray-600">{servico}</p>
        </div>
      </div>
      <div className="flex items-center mb-2">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-5 h-5 ${
              index < avaliacao ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <p className="text-gray-700 text-sm">{comentario}</p>
    </div>
  )
}

