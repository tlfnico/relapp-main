'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/modules/auth/utils/jwt';
import { createAuditLog } from '@/modules/auditoria/services/audit-service';

/**
 * Server Action para cerrar sesión.
 * Elimina la cookie 'session' e inmediatamente redirige al login.
 */
export async function logoutAction(): Promise<never> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (sessionToken) {
    const session = await verifyJWT(sessionToken);
    if (session) {
      await createAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: 'LOGOUT',
      });
    }
  }

  cookieStore.delete('session');
  redirect('/login');
}
