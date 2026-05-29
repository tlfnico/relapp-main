import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload } from '@/types/shared/auth.types';

// Se genera la clave a partir del secreto de entorno.
// Nota: en Next.js Edge Middleware se requiere TextEncoder.
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no configurado en las variables de entorno.');
  }
  return new TextEncoder().encode(secret);
};

/**
 * Firma un JWT con la información del usuario de forma segura.
 */
export async function signJWT(payload: JWTPayload, expiresIn: string = '1d'): Promise<string> {
  const key = getSecretKey();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

/**
 * Verifica un JWT y extrae su payload si es válido.
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    
    // Validamos estructura básica del payload
    if (payload && typeof payload === 'object' && 'id' in payload && 'email' in payload && 'role' in payload) {
      return payload as JWTPayload;
    }
    return null;
  } catch {
    // Silenciar error y no registrar tokens en el log por seguridad (Ajuste Obligatorio 10)
    return null;
  }
}
