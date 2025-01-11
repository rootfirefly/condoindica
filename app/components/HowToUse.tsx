import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, UserCheck, LogIn } from 'lucide-react'
import Image from 'next/image'

const steps = [
  {
    title: "Faça seu cadastro",
    icon: UserPlus,
    description: "Crie sua conta fornecendo informações básicas.",
    preview: (
      <div className="bg-white p-4 rounded-lg shadow-inner overflow-hidden">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-QBktZ91FLxh8HvHXqZMUKoHkNuIWLI.png"
          alt="Tela de cadastro do CondoIndica"
          width={300}
          height={450}
          className="mx-auto rounded-lg"
        />
      </div>
    )
  },
  {
    title: "Complete seu perfil",
    icon: UserCheck,
    description: "Adicione informações detalhadas sobre você e seu condomínio.",
    preview: (
      <div className="bg-white p-4 rounded-lg shadow-inner overflow-hidden">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-H39dfvbEqEdJdcg9aMOfis4YLGIcZ1.png"
          alt="Tela de completar perfil do CondoIndica"
          width={300}
          height={450}
          className="mx-auto rounded-lg"
        />
      </div>
    )
  },
  {
    title: "Comece a usar",
    icon: LogIn,
    description: "Faça login e aproveite todos os recursos do CondoIndica.",
    preview: (
      <div className="flex flex-col space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-inner overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Tz8NtXpvt9GuorgrASbvq5ecckRy2j.png"
            alt="Feed do CondoIndica"
            width={300}
            height={450}
            className="mx-auto rounded-lg"
          />
        </div>
        <p className="text-sm text-gray-600 italic">
          Para poder acessar todas as funcionalidades, depois de preencher os seus dados e salvar, clique em sair e faça login novamente.
        </p>
      </div>
    )
  }
]

export function HowToUse() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center text-blue-800">
          Como usar o CondoIndica em 3 passos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-blue-500 text-white">
                <CardTitle className="flex items-center">
                  <step.icon className="mr-2" />
                  {index + 1}. {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="mb-4">{step.description}</p>
                {step.preview}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

