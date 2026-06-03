'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems = [
    { label: 'Dashboard', href: '/dashboard' },
    ...items,
  ];

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isFirst = index === 0;

          return (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05, ease: 'easeOut' }}
              className="flex items-center gap-1.5"
            >
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-zinc-650 flex-shrink-0" />
              )}
              {isLast ? (
                <span className="text-zinc-200 dark:text-zinc-100 font-semibold truncate max-w-[200px] sm:max-w-none">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className="flex items-center gap-1 hover:text-emerald-400 text-zinc-400 transition-colors"
                >
                  {isFirst && <Home className="w-3.5 h-3.5 mr-0.5" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
}
