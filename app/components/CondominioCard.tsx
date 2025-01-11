import Image from 'next/image'

interface CondominioCardProps {
  nome: string
  cidade: string
  logoUrl: string
}

export function CondominioCard({ nome, cidade, logoUrl }: CondominioCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 p-4">
      <div className="flex items-center">
        <div className="w-16 h-16 relative mr-4">
          <Image
            src={logoUrl || "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/condoIndica%20(2)-TDwwOBaMkYwt4TtbyCzDM3T1yTwrOH.png"}
            alt={`Logo do ${nome}`}
            layout="fill"
            objectFit="cover"
            className="rounded-full"
          />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold">{nome}</h3>
          <p className="text-[13px] text-gray-600">{cidade}</p>
        </div>
      </div>
    </div>
  )
}

