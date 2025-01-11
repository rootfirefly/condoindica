import { useState } from 'react'
import { FaStar, FaUser, FaWhatsapp, FaComments, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import Link from 'next/link'

interface ServicoCardProps {
  servico: {
    id: string
    nome: string
    empresa: string
    servico: string // Agora isso será o nome do serviço, não o ID
    contato: string
    descricao: string
    avaliacao: number
    userName: string
  }
  onOpenAvaliacoes: (servicoNome: string) => void
}

export default function ServicoCard({ servico, onOpenAvaliacoes }: ServicoCardProps) {
  const [expanded, setExpanded] = useState(false)

  const formatWhatsAppLink = (numero: string) => {
    const numeroLimpo = numero.replace(/\D/g, '')
    return `https://wa.me/55${numeroLimpo}`
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-grow">
        <h2 className="text-xl font-semibold mb-1">{servico.nome}</h2>
        <p className="text-gray-600 text-xs mb-1">{servico.empresa}</p>
        <p className="text-blue-600 font-medium text-sm mb-2">{servico.servico}</p>
        <div className="flex items-center mb-2">
          <div className="flex mr-2">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={index < servico.avaliacao ? "text-yellow-400" : "text-gray-300"}
                size={16}
              />
            ))}
          </div>
          <button
            onClick={() => onOpenAvaliacoes(servico.nome)}
            className="text-blue-600 text-sm hover:underline flex items-center"
          >
            <FaComments className="mr-1" size={14} />
            Ver avaliações
          </button>
        </div>
        <div className={`text-gray-700 text-sm ${expanded ? '' : 'line-clamp-3'}`}>
          {servico.descricao}
        </div>
        {servico.descricao.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 text-sm mt-1 flex items-center"
          >
            {expanded ? (
              <>
                <FaChevronUp className="mr-1" size={12} /> Mostrar menos
              </>
            ) : (
              <>
                <FaChevronDown className="mr-1" size={12} /> Mostrar mais
              </>
            )}
          </button>
        )}
      </div>
      <div className="p-6 bg-gray-50 mt-auto">
        <div className="flex flex-col items-start">
          <Link
            href={formatWhatsAppLink(servico.contato)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center hover:bg-green-600 transition-colors mb-2"
          >
            <FaWhatsapp className="mr-2" size={16} />
            Contatar
          </Link>
          <div className="flex items-center text-[10px] text-gray-500">
            <FaUser className="mr-1" size={10} />
            <span>Indicado por: {servico.userName}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

