'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import Header from '../components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import QrScanner from 'qr-scanner';
import { Camera, XCircle } from 'lucide-react'

interface CouponData {
  id: string;
  title: string;
  description: string;
  expirationDate: Date;
  used: boolean;
}

export default function ValidarCupom() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [qrDetected, setQrDetected] = useState(false)
  const [validatedCoupon, setValidatedCoupon] = useState<CouponData | null>(null)
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const { user } = useAuth()
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleValidation = useCallback(async (codeToValidate: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para validar cupons.",
        variant: "destructive",
      })
      return
    }

    setLoading(true);

    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let foundCoupon = null;
      let foundUserDoc = null;
      let couponSnapshot;

      for (const userDoc of usersSnapshot.docs) {
        const purchasedCouponsRef = collection(db, 'users', userDoc.id, 'purchasedCoupons');
        const couponQuery = query(purchasedCouponsRef, where('uniqueCode', '==', codeToValidate));
        couponSnapshot = await getDocs(couponQuery);
        
        if (!couponSnapshot.empty) {
          foundCoupon = couponSnapshot.docs[0].data();
          foundUserDoc = userDoc;
          break;
        }
      }

      if (!foundCoupon || !foundUserDoc) {
        toast({
          title: "Cupom inválido",
          description: `O código "${codeToValidate}" não corresponde a nenhum cupom.`,
          variant: "destructive",
        });
        setValidatedCoupon(null);
        return;
      }

      if (foundCoupon.used) {
        toast({
          title: "Cupom já utilizado",
          description: "Este cupom já foi utilizado anteriormente.",
          variant: "destructive",
        });
        return;
      }

      const originalCouponRef = doc(db, 'coupons', foundCoupon.couponId);
      const originalCouponSnap = await getDoc(originalCouponRef);
      const originalCouponData = originalCouponSnap.data();

      const couponRef = doc(db, 'users', foundUserDoc.id, 'purchasedCoupons', couponSnapshot.docs[0].id);
      await updateDoc(couponRef, {
        used: true,
        validatedBy: user.uid,
        validatedAt: serverTimestamp()
      });

      setValidatedCoupon({
        id: foundCoupon.couponId,
        title: originalCouponData?.title || 'Cupom',
        description: originalCouponData?.description || 'Descrição não disponível',
        expirationDate: originalCouponData?.expirationDate?.toDate() || new Date(),
        used: true
      });

      toast({
        title: "Cupom validado com sucesso!",
        description: "O cupom foi marcado como utilizado.",
      });

    } catch (error) {
      console.error("Erro ao validar cupom:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao validar o cupom. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleScan = useCallback((result: QrScanner.ScanResult | null) => {
    if (result && result.data) {
      setQrDetected(true);
      setCode(result.data);
      handleValidation(result.data);
      setScanning(false);
    }
    // Removemos o else com o toast de erro
  }, [handleValidation]);

  const handleError = useCallback((error: Error | string) => {
    console.log('QR Scanner error:', error);
    // Não exibimos mais o toast de erro aqui
    
    // Limpa qualquer temporizador existente
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current)
    }
    // Define um novo temporizador
    errorTimerRef.current = setTimeout(() => {
      setCameraError("Está com dificuldades para ler o QR code? Tente ajustar a distância ou a iluminação.")
      setShowErrorMessage(true)
    }, 15000) // 15 segundos
  }, [])

  const toggleScanner = useCallback(() => {
    setScanning(prev => {
      if (prev && scanner) {
        scanner.stop();
        setScanner(null);
      } else if (!prev) {
        const videoElement = document.getElementById('qr-video') as HTMLVideoElement;
        if (videoElement) {
          const newScanner = new QrScanner(videoElement, handleScan, {
            onDecodeError: handleError,
            preferredCamera: 'environment'
          });
          newScanner.start().catch((error) => {
            console.error('Erro ao iniciar o scanner:', error);
            handleError(error);
          });
          setScanner(newScanner);
        }
      }
      return !prev;
    });
    setCameraError(null);
    setQrDetected(false);
    setShowErrorMessage(false);
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
  }, [handleScan, handleError, scanner]);

  useEffect(() => {
    let newScanner: QrScanner | null = null;

    if (scanning) {
      const videoElement = document.getElementById('qr-video') as HTMLVideoElement;
      if (videoElement) {
        newScanner = new QrScanner(videoElement, handleScan, {
          onDecodeError: handleError,
          preferredCamera: 'environment'
        });
        newScanner.start().catch((error) => {
          console.error('Erro ao iniciar o scanner:', error);
          handleError(error);
        });
        setScanner(newScanner);
      }
    }

    return () => {
      if (newScanner) {
        newScanner.destroy();
      }
      // Limpa o temporizador quando o componente é desmontado
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, [scanning, handleScan, handleError]);


  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.destroy();
      }
    };
  }, [scanner]);

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
          <CardContent>
            {validatedCoupon ? (
              <div>
                <h2 className="text-xl font-bold mb-2">{validatedCoupon.title}</h2>
                <p>{validatedCoupon.description}</p>
                <p>Data de expiração: {validatedCoupon.expirationDate.toLocaleDateString()}</p>
                <p className="text-green-600 font-bold">Cupom validado com sucesso!</p>
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
                      <video id="qr-video" className="w-full h-full object-cover" />
                      {qrDetected && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                          <p className="text-white text-lg font-bold">QR Code Detectado!</p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-center mt-2 text-gray-600">
                      Posicione o QR code dentro da área demarcada
                    </p>
                    <p className="text-sm text-center mt-1 text-blue-600">
                      Se o QR code não for detectado, tente ajustar a distância ou a iluminação
                    </p>
                  </div>
                )}
                {showErrorMessage && cameraError && (
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

