import React from 'react';
import AdultoMayorForm from '@/modules/adultos-mayores/components/AdultoMayorForm';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageTransition from '@/components/PageTransition';
import { ArrowLeft, UserPlus } from 'lucide-react';

export default function NuevoAdultoMayorPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 flex flex-col items-center">
      <PageTransition className="w-full max-w-3xl flex flex-col gap-6">
        
        {/* Miga de Pan y Botón Volver */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: 'Adultos Mayores', href: '/modules/adultos-mayores' },
              { label: 'Nuevo Registro' },
            ]}
          />
          <Link
            href="/modules/adultos-mayores"
            className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer self-start md:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Listado
          </Link>
        </div>

        {/* Encabezado */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-emerald-400" />
            Registrar Nuevo Adulto Mayor
          </h1>
          <p className="text-zinc-455 text-sm mt-1">
            Ingrese los datos fundamentales de identificación y localización para dar de alta al participante en RelApp.
          </p>
        </div>

        <div className="pt-2">
          <AdultoMayorForm />
        </div>
      </PageTransition>
    </main>
  );
}
