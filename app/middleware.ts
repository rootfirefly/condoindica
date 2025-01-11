import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebase/config';

async function getUserProfile(uid: string) {
  console.log('Middleware: Checking user profile for UID:', uid);
  const userDocRef = doc(db, 'users', uid);
  const userDocSnap = await getDoc(userDocRef);
  const userData = userDocSnap.data();
  console.log('Middleware: User profile data:', userData);
  return {
    exists: userDocSnap.exists(),
    profileCompleted: userData?.profileCompleted || false
  };
}

export async function middleware(request: NextRequest) {
  console.log('Middleware: Starting, path:', request.nextUrl.pathname);
  const session = request.cookies.get('session')?.value

  if (!session) {
    console.log('Middleware: No session found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  console.log('Middleware: Session found, checking user profile');
  const { exists, profileCompleted } = await getUserProfile(session);

  console.log('Middleware: User profile check result', { exists, profileCompleted });

  if (!exists) {
    console.log('Middleware: User document not found, redirecting to profile');
    return NextResponse.redirect(new URL('/perfil', request.url));
  }

  if (!profileCompleted && request.nextUrl.pathname !== '/perfil') {
    console.log('Middleware: Profile not completed, redirecting to profile');
    return NextResponse.redirect(new URL('/perfil', request.url));
  }

  console.log('Middleware: User authorized, proceeding to requested page');
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/servicos', '/indicar', '/superadmin/:path*'],
}

