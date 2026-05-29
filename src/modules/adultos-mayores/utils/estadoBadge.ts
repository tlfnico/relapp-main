export interface BadgeStyle {
  bg: string;
  text: string;
  border: string;
  label: string;
}

export const ESTADO_BADGE_MAP: Record<string, BadgeStyle> = {
  ACTIVO: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Activo',
  },
  PENDIENTE: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: 'Pendiente',
  },
  INACTIVO: {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    text: 'text-slate-700',
    border: 'border-slate-200',
    label: 'Inactivo',
  },
  FALLECIDO: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'text-rose-700',
    border: 'border-rose-200',
    label: 'Fallecido',
  },
};

/**
 * Ajuste Obligatorio 5: Helper de estilos de badges centralizado para evitar clases redundantes en JSX.
 */
export function getEstadoBadge(estado: string): BadgeStyle {
  return ESTADO_BADGE_MAP[estado] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    text: 'text-slate-700',
    border: 'border-slate-200',
    label: estado,
  };
}
