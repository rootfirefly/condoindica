import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export async function checkUserProfile(userId: string): Promise<boolean> {
  const userDocRef = doc(db, 'users', userId);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();
    const requiredFields = [
      'nomeCompleto',
      'condominio',
      'cep',
      'logradouro',
      'bairro',
      'cidade',
      'estado',
      'numero',
      'whatsapp'
    ];

    return requiredFields.every(field => !!userData[field]);
  }

  return false;
}

export async function getUserDoc(userId: string) {
  const userDocRef = doc(db, 'users', userId);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data();
  }

  return null;
}

export async function checkSuperAdminStatus(userId: string): Promise<boolean> {
  const userDoc = await getUserDoc(userId);
  return userDoc?.role === 'superadmin';
}

