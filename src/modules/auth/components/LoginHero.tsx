'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ClipboardList, FileSearch, Blocks, Users, Shield } from 'lucide-react';
import RelAppLogo from '@/components/branding/RelAppLogo';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 90, damping: 14 } as const,
  },
} as const;

export default function LoginHero() {
  const currentYear = new Date().getFullYear();

  const coreFeatures = [
    { name: 'Adultos Mayores', icon: Heart },
    { name: 'Relevamientos', icon: ClipboardList },
    { name: 'Auditoría', icon: FileSearch },
  ];

  const kpis = [
    { value: '5', label: 'Módulos', icon: Blocks },
    { value: '3', label: 'Roles', icon: Users },
    { value: '100%', label: 'Auditable', icon: Shield },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative z-10 hidden md:flex md:w-1/2 lg:w-3/5 flex-col justify-between p-12 lg:p-16 select-none"
    >
      {/* ── Header: Marca chica ── */}
      <motion.div variants={itemVariants} className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/25 shadow-sm shadow-emerald-500/5">
          <RelAppLogo variant="iconOnly" size={26} id="login-nav-logo" />
        </div>
        <span className="text-base font-semibold tracking-wide text-zinc-300">
          RelApp
        </span>
      </motion.div>

      {/* ── Contenido Central del Hero ── */}
      <div className="space-y-12 my-auto py-8">

        {/* Mensaje Institucional */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-400 shadow-sm shadow-emerald-500/5">
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"
              aria-hidden="true"
            />
            Sistema en producción
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white">
            Gestión Integral de
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Adultos Mayores
            </span>
          </h1>

          <p className="max-w-md text-base text-zinc-400 leading-relaxed">
            Relevamiento, seguimiento y monitoreo social en una única plataforma segura y auditable.
          </p>
        </motion.div>

        {/* Funcionalidades Principales */}
        <motion.div variants={itemVariants} className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Funcionalidades principales
          </p>
          <div className="flex flex-wrap gap-2.5">
            {coreFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 px-3.5 py-2 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all duration-200"
                >
                  <Icon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  <span className="font-semibold text-xs tracking-wide">{feat.name}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div variants={itemVariants} className="space-y-3 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Métricas clave
          </p>
          <div className="grid grid-cols-3 gap-3">
            {kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-white tracking-tight leading-none">
                      {kpi.value}
                    </span>
                    <Icon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-bold text-zinc-400">{kpi.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>

      {/* ── Footer ── */}
      <motion.p variants={itemVariants} className="text-xs text-zinc-600">
        © {currentYear} RelApp · Todos los derechos reservados
      </motion.p>
    </motion.div>
  );
}
