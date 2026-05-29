import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from '@/modules/auth/components/LoginForm';
import { verifyJWT } from '@/modules/auth/utils/jwt';

export const metadata = {
  title: 'Iniciar Sesión | RelApp',
  description: 'Inicia sesión para acceder al sistema modular de relevamientos.',
};

/**
 * Página pública de inicio de sesión.
 * Ejecuta validación del lado del servidor para redirigir inmediatamente
 * al usuario a /dashboard si ya cuenta con una sesión JWT válida.
 */
export default async function LoginPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  if (sessionCookie) {
    const session = await verifyJWT(sessionCookie);
    if (session) {
      redirect('/dashboard');
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm />
    </main>
  );
}
