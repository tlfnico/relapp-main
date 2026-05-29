import { z } from 'zod';

// Sanitización básica (Ajuste Obligatorio 2: trim, límite de longitud y remover caracteres peligrosos básicos)
function sanitizeText(val: string): string {
  if (!val) return '';
  return val
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres de inyección de tags básicos
    .substring(0, 1000);   // Límite estricto de longitud
}

export const adultoMayorSchema = z.object({
  nombre: z.string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede superar los 100 caracteres.'),
  apellido: z.string()
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres.')
    .max(100, 'El apellido no puede superar los 100 caracteres.'),
  dni: z.string()
    .trim()
    .min(6, 'El DNI debe tener al menos 6 caracteres.')
    .max(20, 'El DNI no puede superar los 20 caracteres.')
    .regex(/^[a-zA-Z0-9]+$/, 'El DNI debe ser alfanumérico sin espacios ni caracteres especiales.'),
  fechaNacimiento: z.string()
    .refine((val) => {
      const birthDate = new Date(val);
      if (isNaN(birthDate.getTime())) return false;
      
      // Ajuste Obligatorio 7: Validar que el adulto mayor tenga al menos 55 años y no sea futura
      const today = new Date();
      if (birthDate > today) return false;
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 55;
    }, { message: 'La persona debe ser un adulto mayor (al menos 55 años de edad).' }),
  telefono: z.string()
    .trim()
    .max(50, 'El teléfono no puede superar los 50 caracteres.')
    .optional()
    .or(z.literal('')),
  direccion: z.string()
    .trim()
    .min(5, 'La dirección debe tener al menos 5 caracteres.')
    .max(255, 'La dirección no puede superar los 255 caracteres.'),
  barrio: z.string()
    .trim()
    .min(2, 'El barrio debe tener al menos 2 caracteres.')
    .max(100, 'El barrio no puede superar los 100 caracteres.'),
  observaciones: z.string()
    .transform(sanitizeText)
    .optional()
    .or(z.literal('')),
  estado: z.enum(['ACTIVO', 'PENDIENTE', 'INACTIVO', 'FALLECIDO'], {
    message: 'El estado seleccionado no es válido.',
  }),
});

export type AdultoMayorInput = z.infer<typeof adultoMayorSchema>;
