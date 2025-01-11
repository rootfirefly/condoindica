import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, doc, getDoc, runTransaction } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from 'uuid'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Coupon {
  id: string
  title: string
  description: string
  cost: number
  expirationDate: Date
}

export default function CuponsDisponiveis() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [userPoints, setUserPoints] = useState(0)
  const { user } = useAuth()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [purchasedCoupon, setPurchasedCoupon] = useState<Coupon | null>(null)

  useEffect(() => {
    const fetchCoupons = async () => {
      const q = query(
        collection(db, 'coupons'),
        where('expirationDate', '>', new Date())
      )

      const querySnapshot = await getDocs(q)
      const couponsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expirationDate: doc.data().expirationDate.toDate()
      })) as Coupon[]

      setCoupons(couponsData)
      setLoading(false)
    }

    const fetchUserPoints = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserPoints(userDocSnap.data().points || 0)
        }
      }
    }

    fetchCoupons()
    fetchUserPoints()
  }, [user])

  const handlePurchaseCoupon = useCallback(async (coupon: Coupon) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comprar cupons.",
        variant: "destructive",
      })
      return
    }

    if (userPoints < coupon.cost) {
      toast({
        title: "Pontos insuficientes",
        description: "Você não tem pontos suficientes para comprar este cupom.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('Starting coupon purchase transaction...');
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid)
        const userDoc = await transaction.get(userRef)

        if (!userDoc.exists()) {
          throw new Error("User document does not exist!")
        }

        const userData = userDoc.data()
        const currentPoints = userData.points || 0

        if (currentPoints < coupon.cost) {
          throw new Error("Insufficient points")
        }

        const uniqueCode = uuidv4()

        transaction.update(userRef, { points: currentPoints - coupon.cost })

        const purchasedCouponRef = doc(collection(db, 'users', user.uid, 'purchasedCoupons'))
        transaction.set(purchasedCouponRef, {
          couponId: coupon.id,
          purchaseDate: new Date(),
          used: false,
          uniqueCode
        })

        const pointsTransactionRef = doc(collection(db, 'pointsTransactions'))
        transaction.set(pointsTransactionRef, {
          userId: user.uid,
          amount: -coupon.cost,
          description: `Compra de cupom: ${coupon.title}`,
          createdAt: new Date()
        })
      })

      console.log('Coupon purchase transaction completed successfully');
      setUserPoints(prevPoints => prevPoints - coupon.cost)

      // Atualizar o estado do cupom comprado e abrir o popup
      setPurchasedCoupon(coupon)
      setIsPopupOpen(true)

      // Fechar o popup após 3 segundos
      setTimeout(() => {
        setIsPopupOpen(false)
      }, 3000)

    } catch (error) {
      console.error("Error purchasing coupon:", error)
      toast({
        title: "Erro na compra",
        description: `Ocorreu um erro ao tentar comprar o cupom: ${error.message}. Por favor, tente novamente.`,
        variant: "destructive",
      })
    }
  }, [user, userPoints, setUserPoints])

  const PopupContent = () => (
    <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Parabéns!</DialogTitle>
        </DialogHeader>
        <p>
          Você acaba de comprar o cupom "{purchasedCoupon?.title}". Aproveite!
        </p>
      </DialogContent>
    </Dialog>
  )

  if (loading) {
    return <div>Carregando cupons disponíveis...</div>
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <Card key={coupon.id}>
            <CardHeader>
              <CardTitle>{coupon.title}</CardTitle>
              <CardDescription>{coupon.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{coupon.cost} coins</p>
              <p className="text-sm text-gray-500">
                Expira em: {coupon.expirationDate.toLocaleDateString()}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handlePurchaseCoupon(coupon)}
                disabled={userPoints < coupon.cost}
              >
                Comprar Cupom
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <PopupContent />
    </>
  )
}

