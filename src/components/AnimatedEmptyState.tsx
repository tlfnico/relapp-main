'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function AnimatedEmptyState({
  icon,
  title,
  description,
  action,
}: AnimatedEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-16 text-center flex flex-col items-center justify-center gap-4"
    >
      <motion.div
        initial={{ scale: 0.8, rotate: -5 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, duration: 0.3, type: 'spring', stiffness: 200 }}
        className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 shadow-inner"
      >
        {icon}
      </motion.div>
      <div className="space-y-1">
        <h3 className="text-zinc-200 font-bold tracking-tight text-base">{title}</h3>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.25 }}
          className="mt-2"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
