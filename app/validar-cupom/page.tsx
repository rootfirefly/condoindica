'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import Header from '../components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { QrReader } from 'react-qr-reader'
import { Camera, XCircle } from 'lucide-react'

interface CouponData {
  id: string;
  title: string;
  description: string;
  expirationDate: Date;
  used: boolean;
}

export default function ValidarCupom() {
  console.log('Componente ValidarCupom renderizado');
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [qrDetected, setQrDetected] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [validatedCoupon, setValidatedCoupon] = useState<CouponData | null>(null)
  const { user } = useAuth()

  const handleValidation = async (codeToValidate: string) => {
    console.log('Starting validation process for code:', codeToValidate);
    if (!user) {
      console.log('Error: User not logged in');
      toast({
        title: "Erro",
        description: "Você precisa estar logado para validar cupons.",
        variant: "destructive",
      })
      return
    }

    setVerifying(true);
    setLoading(true);

    try {
      console.log('Starting new query approach for code:', codeToValidate);
      // Query all users' purchasedCoupons subcollections
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let foundCoupon = null;
      let foundUserDoc = null;
      let couponSnapshot;

      for (const userDoc of usersSnapshot.docs) {
        console.log('Checking purchasedCoupons for user:', userDoc.id);
        const purchasedCouponsRef = collection(db, 'users', userDoc.id, 'purchasedCoupons');
        const couponQuery = query(purchasedCouponsRef, where('uniqueCode', '==', codeToValidate));
        couponSnapshot = await getDocs(couponQuery);
        
        if (!couponSnapshot.empty) {
          console.log('Found matching coupon in user:', userDoc.id);
          foundCoupon = couponSnapshot.docs[0].data();
          foundUserDoc = userDoc;
          break;
        }
      }

      if (!foundCoupon || !foundUserDoc) {
        console.log('No matching coupon found in any user document');
        await new Promise(resolve => setTimeout(resolve, 15000));
        toast({
          title: "Cupom inválido",
          description: `O código "${codeToValidate}" não corresponde a nenhum cupom.`,
          variant: "destructive",
        });
        setValidatedCoupon(null);
        return;
      }

      console.log('Found coupon data:', foundCoupon);


      if (foundCoupon.used) {
        console.log('Coupon has already been used');
        await new Promise(resolve => setTimeout(resolve, 15000));
        toast({
          title: "Cupom já utilizado",
          description: "Este cupom já foi utilizado anteriormente.",
          variant: "destructive",
        });
        return;
      }

      console.log('Fetching original coupon data');
      const originalCouponRef = doc(db, 'coupons', foundCoupon.couponId);
      const originalCouponSnap = await getDoc(originalCouponRef);
      const originalCouponData = originalCouponSnap.data();
      console.log('Original coupon data:', originalCouponData);

      console.log('Updating coupon status');
      const couponRef = doc(db, 'users', foundUserDoc.id, 'purchasedCoupons', couponSnapshot.docs[0].id);
      await updateDoc(couponRef, {
        used: true,
        validatedBy: user.uid,
        validatedAt: serverTimestamp()
      });
      console.log('Coupon status updated successfully');

      await new Promise(resolve => setTimeout(resolve, 15000));

      setValidatedCoupon({
        id: foundCoupon.couponId,
        title: originalCouponData?.title || 'Cupom',
        description: originalCouponData?.description || 'Descrição não disponível',
        expirationDate: originalCouponData?.expirationDate?.toDate() || new Date(),
        used: true
      });

      console.log('Validation process completed successfully');
      toast({
        title: "Cupom validado com sucesso!",
        description: "O cupom foi marcado como utilizado.",
      });

    } catch (error) {
      console.error("Erro ao validar cupom:", error);
      await new Promise(resolve => setTimeout(resolve, 15000));
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao validar o cupom. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setVerifying(false);
      setScanning(false);
      setCode('');
      console.log('Validation process finished');
    }
  };

  const handleScan = useCallback((result: any) => {
    if (result) {
      setQrDetected(true);
      setCode(result?.text);
      handleValidation(result.text);
    } else {
      setQrDetected(false);
    }
  }, [handleValidation]);

  const handleError = (error: any) => {
    console.error(error)
    setCameraError("Erro ao acessar a câmera. Verifique as permissões e tente novamente.")
  }

  const toggleScanner = () => {
    setScanning((prev) => !prev);
    setCameraError(null);
    setQrDetected(false);
  };

  useEffect(() => {
    if (!scanning) {
      setQrDetected(false);
    }
  }, [scanning]);

  useEffect(() => {
    console.log('Estado verifying alterado:', verifying);
  }, [verifying]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Validar Cupom</h1>
        <Card className="max-w-md mx-auto relative">
          <CardHeader>
            <CardTitle>Validação de Cupom</CardTitle>
            <CardDescription>Insira o código do cupom ou escaneie o QR code para validá-lo</CardDescription>
          </CardHeader>
          {verifying && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                <p className="text-lg font-semibold mb-2">Verificando Cupom. Aguarde!</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            </div>
          )}
          <CardContent>
            {console.log('Renderizando componente. Estado verifying:', verifying)}
            {validatedCoupon ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                <h2 className="font-bold text-lg mb-2">Cupom Validado com Sucesso!</h2>
                <p><strong>Título:</strong> {validatedCoupon.title}</p>
                <p><strong>Descrição:</strong> {validatedCoupon.description}</p>
                <p><strong>Data de Expiração:</strong> {validatedCoupon.expirationDate.toLocaleDateString()}</p>
                <p><strong>Status:</strong> Utilizado</p>
              </div>
            ) : (
              <>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  handleValidation(code)
                }}>
                  <div className="mb-4">
                    <Input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Insira o código do cupom"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full mb-4">
                    {loading ? 'Validando...' : 'Validar Cupom'}
                  </Button>
                </form>
                {code && !validatedCoupon && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <p>O código "{code}" é inválido.</p>
                  </div>
                )}
                <div className="text-center">
                  <Button
                    onClick={toggleScanner}
                    variant="outline"
                    className="mb-4"
                  >
                    {scanning ? (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Parar Escaneamento
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Escanear QR Code
                      </>
                    )}
                  </Button>
                </div>
                {scanning && (
                  <div className="mt-4">
                    <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg">
                      <QrReader
                        onResult={handleScan}
                        onError={handleError}
                        constraints={{ facingMode: 'environment' }}
                        className="w-full h-full"
                        videoId="qr-video"
                      />
                      <div className={`absolute inset-0 border-4 ${qrDetected ? 'border-green-500' : 'border-white'} border-dashed pointer-events-none transition-colors duration-300`}></div>
                      {qrDetected && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                          <p className="text-white text-lg font-bold">QR Code Detectado!</p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-center mt-2 text-gray-600">
                      Posicione o QR code dentro da área demarcada
                    </p>
                  </div>
                )}
                {cameraError && (
                  <p className="text-red-500 text-sm mt-2">{cameraError}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

