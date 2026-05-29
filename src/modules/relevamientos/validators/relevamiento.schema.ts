import { z } from 'zod';

// Sanitización básica de texto para evitar tags HTML y limitar caracteres
function sanitizeText(val: string): string {
  if (!val) return '';
  return val
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres de inyección HTML básico
    .substring(0, 1000);   // Límite estricto
}

export const relevamientoSchema = z.object({
  adultoMayorId: z.string().uuid('ID de adulto mayor no válido.'),
  
  // Área Habitacional
  tipoVivienda: z.string()
    .trim()
    .min(2, 'El tipo de vivienda debe tener al menos 2 caracteres.')
    .max(100, 'El tipo de vivienda no puede superar los 100 caracteres.'),
  tieneAgua: z.boolean({
    message: 'Debe especificar si tiene servicio de agua.',
  }),
  tieneLuz: z.boolean({
    message: 'Debe especificar si tiene servicio de luz.',
  }),
  tieneGas: z.boolean({
    message: 'Debe especificar si tiene servicio de gas.',
  }),
  hacinamiento: z.boolean({
    message: 'Debe especificar si se encuentra en situación de hacinamiento.',
  }),

  // Área Salud y Autonomía
  enfermedadesCronicas: z.string()
    .trim()
    .min(2, 'Escriba "Ninguna" o especifique las enfermedades crónicas.')
    .max(1000, 'El detalle de enfermedades no puede superar los 1000 caracteres.'),
  nivelMovilidad: z.string()
    .trim()
    .min(2, 'El nivel de movilidad debe tener al menos 2 caracteres.')
    .max(100, 'El nivel de movilidad no puede superar los 100 caracteres.'),
  tomaMedicamentos: z.boolean({
    message: 'Debe especificar si toma medicamentos.',
  }),

  // Área Socioeconómica
  ingresos: z.union([z.number(), z.string()], {
    message: 'Debe especificar los ingresos.',
  })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Los ingresos deben ser un valor numérico no negativo.',
    })
    .transform((val) => Number(val).toFixed(2)),
  obraSocial: z.string()
    .trim()
    .min(2, 'Escriba "Ninguna" o el nombre de la obra social.')
    .max(100, 'La obra social no puede superar los 100 caracteres.'),
  redApoyo: z.string()
    .trim()
    .min(2, 'Escriba "Ninguna" o especifique la red de apoyo.')
    .max(100, 'La red de apoyo no puede superar los 100 caracteres.'),

  // Riesgo y Estado del Proceso
  riesgoSocial: z.enum(['BAJO', 'MEDIO', 'ALTO', 'CRITICO'], {
    message: 'El nivel de riesgo social seleccionado no es válido.',
  }),
  estado: z.enum(['BORRADOR', 'FINALIZADO'], {
    message: 'El estado del relevamiento no es válido.',
  }),
  
  // Observaciones generales (Sanitizado)
  observacionesGeneral: z.string()
    .transform(sanitizeText)
    .optional()
    .or(z.literal('')),
});

export type RelevamientoInput = z.infer<typeof relevamientoSchema>;
