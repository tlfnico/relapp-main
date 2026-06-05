'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface DashboardStatCardProps {
  title: string;
  value: number | string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function DashboardStatCard({
  title,
  value,
  variant = 'default',
  icon,
  className = '',
  delay = 0,
}: DashboardStatCardProps) {
  // Configuración de estilos premium según la variante
  const variantStyles = {
    default: {
      text: 'text-zinc-200',
      border: 'border-zinc-850',
      indicator: 'bg-zinc-600',
      glow: 'shadow-zinc-500/5',
      hoverBorder: 'hover:border-zinc-700',
      iconText: 'text-zinc-500 group-hover:text-zinc-300',
    },
    success: {
      text: 'text-emerald-450',
      border: 'border-emerald-950/40',
      indicator: 'bg-emerald-500',
      glow: 'shadow-emerald-500/5',
      hoverBorder: 'hover:border-emerald-500/30 hover:shadow-emerald-950/5',
      iconText: 'text-emerald-600 group-hover:text-emerald-400',
    },
    warning: {
      text: 'text-amber-450',
      border: 'border-amber-950/40',
      indicator: 'bg-amber-500',
      glow: 'shadow-amber-500/5',
      hoverBorder: 'hover:border-amber-500/30 hover:shadow-amber-950/5',
      iconText: 'text-amber-600 group-hover:text-amber-400',
    },
    danger: {
      text: 'text-rose-450',
      border: 'border-rose-950/45',
      indicator: 'bg-rose-500',
      glow: 'shadow-rose-500/5',
      hoverBorder: 'hover:border-rose-500/30 hover:shadow-rose-950/5',
      iconText: 'text-rose-600 group-hover:text-rose-400',
    },
    info: {
      text: 'text-sky-450',
      border: 'border-sky-950/40',
      indicator: 'bg-sky-500',
      glow: 'shadow-sky-500/5',
      hoverBorder: 'hover:border-sky-500/30 hover:shadow-sky-950/5',
      iconText: 'text-sky-600 group-hover:text-sky-400',
    },
  };

  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={`group relative overflow-hidden rounded-2xl bg-zinc-900 border ${styles.border} ${styles.glow} p-6 transition-all duration-300 hover:scale-[1.02] ${styles.hoverBorder} hover:shadow-lg ${className}`}
    >
      {/* Indicador de color lateral superior con desvanecimiento sutil */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${styles.indicator} opacity-90 transition group-hover:opacity-100`} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase transition group-hover:text-zinc-400">
          {title}
        </span>
        {icon && (
          <div className={`${styles.iconText} transition duration-350`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className={`text-3xl md:text-4xl font-extrabold tracking-tight ${styles.text}`}>
          {value}
        </span>
      </div>
    </motion.div>
  );
}
