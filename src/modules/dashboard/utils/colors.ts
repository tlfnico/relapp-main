export const RISK_COLORS: Record<string, string> = {
  BAJO: '#10b981',      // Emerald 500 (Verde)
  MEDIO: '#f59e0b',     // Amber 500 (Amarillo/Naranja)
  ALTO: '#ef4444',      // Red 500 (Rojo)
  CRITICO: '#d946ef',   // Fuchsia 500 (Fucsia)
};

/**
 * Retorna el color correspondiente a un nivel de riesgo social.
 */
export function getRiskColor(risk: string): string {
  return RISK_COLORS[risk.toUpperCase()] || '#9ca3af'; // Gris por defecto si no coincide
}

export const MOBILITY_COLORS: Record<string, string> = {
  'Independiente': '#10b981',        // Verde
  'Usa bastón': '#3b82f6',           // Azul
  'Usa silla de ruedas': '#f59e0b',  // Naranja
  'Dependiente': '#ef4444',          // Rojo
};

/**
 * Retorna el color correspondiente a un nivel de movilidad.
 */
export function getMobilityColor(mobility: string): string {
  // Búsqueda insensible al caso o aproximada
  const key = Object.keys(MOBILITY_COLORS).find(
    (k) => k.toLowerCase() === mobility.toLowerCase()
  );
  return key ? MOBILITY_COLORS[key] : '#8b5cf6'; // Violeta por defecto
}
