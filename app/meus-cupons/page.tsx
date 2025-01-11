'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import Header from '../components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { QRCodeSVG } from 'qrcode.react'
import { useMediaQuery } from '../hooks/useMediaQuery'

interface PurchasedCoupon {
  id: string
  couponId: string
  purchaseDate: Date
  used: boolean
  uniqueCode: string
  title?: string
  description?: string
  expirationDate?: Date
}

export default function MeusCupons() {
  const [purchasedCoupons, setPurchasedCoupons] = useState<PurchasedCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 640px)')

  useEffect(() => {
    const fetchPurchasedCoupons = async () => {
      if (!user) return

      try {
        const q = query(collection(db, 'users', user.uid, 'purchasedCoupons'))
        const querySnapshot = await getDocs(q)

        const couponsPromises = querySnapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data()
          const couponRef = doc(db, 'coupons', data.couponId)
          const couponSnap = await getDoc(couponRef)
          const couponData = couponSnap.data()

          return {
            id: docSnapshot.id,
            ...data,
            purchaseDate: data.purchaseDate.toDate(),
            title: couponData?.title,
            description: couponData?.description,
            expirationDate: couponData?.expirationDate?.toDate(),
          } as PurchasedCoupon
        })

        const coupons = await Promise.all(couponsPromises)
        setPurchasedCoupons(coupons)
      } catch (error) {
        console.error("Error fetching purchased coupons:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPurchasedCoupons()
  }, [user])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-blue-800">Meus Cupons</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Cupons Comprados</CardTitle>
            <CardDescription>Lista de todos os seus cupons adquiridos</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center">Carregando seus cupons...</p>
            ) : purchasedCoupons.length === 0 ? (
              <p className="text-center">Você ainda não comprou nenhum cupom.</p>
            ) : (
              <div className="space-y-4">
                {purchasedCoupons.map((coupon) => (
                  <Card key={coupon.id} className="p-4">
                    <h3 className="font-bold text-lg mb-2">{coupon.title}</h3>
                    <p className="text-sm mb-2">{coupon.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><strong>Data de Compra:</strong></p>
                      <p>{coupon.purchaseDate.toLocaleDateString()}</p>
                      <p><strong>Expira em:</strong></p>
                      <p>{coupon.expirationDate?.toLocaleDateString()}</p>
                      <p><strong>Status:</strong></p>
                      <p>{coupon.used ? 'Utilizado' : 'Não utilizado'}</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full mt-4">
                          {coupon.used ? 'Ver Detalhes' : 'Usar Cupom'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>{coupon.title}</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center p-4">
                          <QRCodeSVG value={coupon.uniqueCode} size={isMobile ? 200 : 250} />
                          <p className="text-center text-sm text-gray-500 mt-4">
                            {coupon.used
                              ? 'Este cupom já foi utilizado.'
                              : 'Apresente este QR Code para utilizar o cupom'}
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

