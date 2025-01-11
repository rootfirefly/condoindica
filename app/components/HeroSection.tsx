import Image from 'next/image'
import { CTASection } from './CTASection'

interface HeroSectionProps {
  imageUrl: string;
  title: string;
  subtitle: string;
}

export function HeroSection({ imageUrl, title, subtitle }: HeroSectionProps) {
  return (
    <section className="relative bg-blue-600 text-white min-h-screen flex items-center">
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt="Hero background"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />
        <div className="absolute inset-0 bg-blue-600/60 backdrop-blur-[2px]"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" dangerouslySetInnerHTML={{ __html: title }} />
          <p className="text-xl md:text-2xl mb-8">{subtitle}</p>
          <CTASection />
        </div>
      </div>
    </section>
  )
}

