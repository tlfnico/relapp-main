import { UserRole } from '@/lib/constants/roles';

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  [key: string]: unknown; // Requerido por jose en algunas firmas genéricas
}

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
}
