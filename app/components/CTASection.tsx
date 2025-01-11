import Link from 'next/link'
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="bg-blue-600 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Junte-se à comunidade CondoIndica
        </h2>
        <p className="mb-8 max-w-2xl mx-auto">
          Conecte-se com seus vizinhos, encontre os melhores serviços e faça parte de uma comunidade que se ajuda mutuamente.
        </p>
        <Link href="/cadastro">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
            Cadastre-se Agora
          </Button>
        </Link>
      </div>
    </section>
  )
}

