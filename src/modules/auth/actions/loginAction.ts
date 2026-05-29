'use server';

import { cookies } from 'next/headers';
import bcryptjs from 'bcryptjs';
import { loginSchema, LoginInput } from '../validators/login.schema';
import { getUserByEmail } from '../services/auth-db';
import { signJWT } from '../utils/jwt';

export interface ActionResponse {
  success: boolean;
  error?: string;
}

/**
 * Server Action para gestionar el inicio de sesión.
 * Valida los datos recibidos mediante Zod, busca al usuario, verifica el hash de contraseña,
 * emite un JWT firmado minimalista y lo guarda en una cookie HTTP-only segura.
 */
export async function loginAction(data: LoginInput): Promise<ActionResponse> {
  try {
    // 1. Validar inputs server-side
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Las credenciales proporcionadas no tienen el formato correcto.',
      };
    }

    const { email, password } = parsed.data;

    // 2. Buscar al usuario en la base de datos mock
    const user = await getUserByEmail(email);
    if (!user) {
      // Mensaje de error ambiguo por seguridad para evitar enumeración de cuentas
      return {
        success: false,
        error: 'El correo electrónico o la contraseña son incorrectos.',
      };
    }

    // 3. Comparar contraseña con el hash guardado usando bcryptjs
    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        error: 'El correo electrónico o la contraseña son incorrectos.',
      };
    }

    // 4. Crear Payload JWT Minimalista (Ajuste Obligatorio 2: id, role, email)
    const token = await signJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // 5. Configurar la Cookie HTTP-only (Ajuste Obligatorio 6)
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 día (86400 segundos)
    });

    return { success: true };
  } catch (err) {
    // Diagnóstico temporal
    console.error('[LOGIN ACTION] Error inesperado:', err);
    return {
      success: false,
      error: 'Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo más tarde.',
    };
  }
}
