'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState, useEffect } from 'react'

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated Building */}
        <motion.div
          className="mb-8 relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-48 h-64 mx-auto">
            {/* Building Base */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-56 bg-blue-600 rounded-lg"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
            {/* Windows */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-6 h-6 bg-yellow-300 rounded-sm"
                style={{
                  left: `${(i % 3) * 40 + 20}%`,
                  top: `${Math.floor(i / 3) * 25 + 10}%`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
            {/* Roof */}
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-blue-800"
              style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            />
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-blue-800 mb-4">
            Ops! Apartamento não encontrado
          </h1>
          <p className="text-gray-600 mb-8">
            Parece que você tentou acessar um endereço que não existe em nosso condomínio.
          </p>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            variant="default"
            className="w-full sm:w-auto"
            asChild
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Voltar para o início
            </Link>
          </Button>
          
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </motion.div>

        {/* Fun Message */}
        <motion.p
          className="mt-8 text-sm text-gray-500 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Não se preocupe, nosso síndico virtual já foi notificado! 😉
        </motion.p>
      </div>
    </div>
  )
}

