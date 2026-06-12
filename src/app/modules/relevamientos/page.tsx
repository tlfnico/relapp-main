import React from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageTransition from '@/components/PageTransition';
import { ArrowLeft, ClipboardList } from 'lucide-react';

export const metadata = {
  title: 'Relevamientos | RelApp',
  description: 'Módulo unificado de relevamientos territoriales.',
};

export default async function RelevamientosPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 flex flex-col items-center">
      <PageTransition className="w-full max-w-7xl flex flex-col gap-6">
        
        {/* Miga de Pan y Botón Volver */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Breadcrumbs items={[{ label: 'Relevamientos' }]} />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer self-start md:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Dashboard
          </Link>
        </div>

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-emerald-400" />
              Módulo de Relevamientos
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Historial general e informes de relevamientos socio-sanitarios territoriales.
            </p>
          </div>
        </div>

        {/* Contenedor del Estado Vacío */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden p-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500">
            <ClipboardList className="w-5 h-5 text-zinc-650" />
          </div>
          <div className="max-w-md">
            <p className="text-zinc-350 font-bold">Listado general unificado en desarrollo</p>
            <p className="text-zinc-500 text-sm mt-2">
              Para consultar el historial social o iniciar una nueva encuesta socioeconómica, por favor busque y seleccione al participante en la sección de{' '}
              <Link href="/modules/adultos-mayores" className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline">
                Gestión de Adultos Mayores
              </Link>.
            </p>
          </div>
        </div>

      </PageTransition>
    </main>
  );
}
