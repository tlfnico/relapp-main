'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Server Action para cerrar sesión.
 * Elimina la cookie 'session' e inmediatamente redirige al login.
 */
export async function logoutAction(): Promise<never> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}
