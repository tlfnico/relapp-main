'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileNavBar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Inicio',
      href: '/dashboard',
      icon: Home,
      isActive: pathname === '/dashboard' || pathname.startsWith('/dashboard/'),
    },
    {
      label: 'Buscar',
      href: '/modules/adultos-mayores',
      icon: Search,
      isActive: pathname.startsWith('/modules/adultos-mayores') && !pathname.includes('/nuevo'),
    },
    {
      label: 'Nuevo',
      href: '/modules/adultos-mayores/nuevo',
      icon: Plus,
      isActive: pathname.includes('/nuevo'),
    },
  ];

  return (
    <nav
      aria-label="Navegación móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-900 px-4 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.7)]"
    >
      <div className="flex justify-around items-center h-14 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors duration-200 outline-none rounded-xl"
            >
              {/* Contenedor del contenido */}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    item.isActive ? 'text-emerald-400 scale-105' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                />
                <span
                  className={`text-[9px] font-bold tracking-wider uppercase transition-colors duration-200 ${
                    item.isActive ? 'text-zinc-150' : 'text-zinc-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {/* Indicador de Framer Motion */}
              {item.isActive && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute inset-x-2 bottom-0 h-1 bg-emerald-400 rounded-t-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
