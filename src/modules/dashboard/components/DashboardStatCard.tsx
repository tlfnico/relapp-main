import React from 'react';

export interface DashboardStatCardProps {
  title: string;
  value: number | string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  icon?: React.ReactNode;
  className?: string;
}

export default function DashboardStatCard({
  title,
  value,
  variant = 'default',
  icon,
  className = '',
}: DashboardStatCardProps) {
  // Configuración de estilos según la variante
  const variantStyles = {
    default: {
      text: 'text-zinc-200',
      border: 'border-zinc-800',
      indicator: 'bg-zinc-500',
      glow: 'shadow-zinc-500/5',
    },
    success: {
      text: 'text-emerald-400',
      border: 'border-emerald-900/30',
      indicator: 'bg-emerald-500',
      glow: 'shadow-emerald-500/5',
    },
    warning: {
      text: 'text-amber-400',
      border: 'border-amber-900/30',
      indicator: 'bg-amber-500',
      glow: 'shadow-amber-500/5',
    },
    danger: {
      text: 'text-rose-400',
      border: 'border-rose-900/30',
      indicator: 'bg-rose-500',
      glow: 'shadow-rose-500/5',
    },
    info: {
      text: 'text-sky-400',
      border: 'border-sky-900/30',
      indicator: 'bg-sky-500',
      glow: 'shadow-sky-500/5',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-zinc-900 p-6 shadow-md border ${styles.border} ${styles.glow} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${className}`}
    >
      {/* Indicador de color lateral superior */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${styles.indicator}`} />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium tracking-wide text-zinc-400 uppercase">
          {title}
        </span>
        {icon && <div className="text-zinc-500">{icon}</div>}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className={`text-3xl font-bold tracking-tight ${styles.text}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
