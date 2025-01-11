import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { collection, query, getDocs, doc, updateDoc, orderBy, FirebaseError, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'

interface Indicacao {
  id: string;
  servico: string;
  fornecedor: string;
  status: 'Verificado' | 'Não Verificado';
  data: string;
  timestamp: Timestamp | null;
}

export default function ListaIndicacoes() {
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIndicacoes().catch(error => {
      console.error('Error in useEffect:', error);
    });
  }, [])

  const fetchIndicacoes = async () => {
    setLoading(true);
    try {
      const indicacoesQuery = query(collection(db, 'indicacoes'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(indicacoesQuery);
      const indicacoesData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        let formattedDate = 'Data não disponível';
        if (data.timestamp && typeof data.timestamp.toDate === 'function') {
          const date = data.timestamp.toDate();
          formattedDate = date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
        } else if (data.timestamp && data.timestamp.seconds) {
          const date = new Date(data.timestamp.seconds * 1000);
          formattedDate = date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
        }
        return {
          id: doc.id,
          servico: data.servico || 'Serviço não especificado',
          fornecedor: data.nome || 'Fornecedor não especificado',
          status: data.status === 'Verificado' ? 'Verificado' : 'Não Verificado',
          data: formattedDate,
          timestamp: data.timestamp || null
        };
      });
      setIndicacoes(indicacoesData);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error('Erro ao buscar indicações:', firebaseError.code, firebaseError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'Verificado' | 'Não Verificado') => {
    try {
      const indicacaoRef = doc(db, 'indicacoes', id)
      await updateDoc(indicacaoRef, { status: newStatus })
      setIndicacoes(indicacoes.map(ind => 
        ind.id === id ? { ...ind, status: newStatus } : ind
      ))
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Lista de Indicações</h2>

      {loading ? (
        <p>Carregando indicações...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serviço</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {indicacoes.map((indicacao) => (
              <TableRow key={indicacao.id}>
                <TableCell>{indicacao.servico}</TableCell>
                <TableCell>{indicacao.fornecedor}</TableCell>
                <TableCell>
                  <Select 
                    onValueChange={(value) => handleStatusChange(indicacao.id, value as 'Verificado' | 'Não Verificado')} 
                    defaultValue={indicacao.status}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Verificado">Verificado</SelectItem>
                      <SelectItem value="Não Verificado">Não Verificado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{indicacao.data}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

