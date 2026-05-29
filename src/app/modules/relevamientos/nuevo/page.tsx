import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/modules/auth/utils/jwt';
import { getAdultosMayoresList } from '@/modules/adultos-mayores/services/adulto-mayor-service';
import RelevamientoForm from '@/modules/relevamientos/components/RelevamientoForm';

interface PageProps {
  searchParams: Promise<{ adultoMayorId?: string }>;
}

export default async function NuevoRelevamientoPage({ searchParams }: PageProps) {
  // 1. Validar sesión
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  if (!sessionToken) redirect('/login');

  const session = await verifyJWT(sessionToken);
  if (!session) redirect('/login');

  // Await search params
  const params = await searchParams;
  const adultoMayorId = params.adultoMayorId;

  // 2. Recuperar la lista de adultos mayores activos para el selector (si no viene precargado)
  const adultosList = await getAdultosMayoresList();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Miga de Pan */}
      <nav className="text-sm text-slate-500 flex items-center gap-2">
        <Link href="/modules/adultos-mayores" className="hover:text-slate-800 transition-colors">
          Adultos Mayores
        </Link>
        <span>/</span>
        {adultoMayorId ? (
          <Link href={`/modules/adultos-mayores/${adultoMayorId}`} className="hover:text-slate-800 transition-colors">
            Ficha Participante
          </Link>
        ) : (
          <span>Relevamientos</span>
        )}
        <span>/</span>
        <span className="text-slate-800 font-medium">Nuevo Relevamiento</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Iniciar Relevamiento Social</h1>
        <p className="text-slate-500 text-sm mt-1">
          Complete la encuesta socio-sanitaria del participante. Los datos ingresados se persisten directamente para análisis de riesgo.
        </p>
      </div>

      <div className="pt-2">
        <RelevamientoForm
          userRole={session.role}
          adultoMayorId={adultoMayorId}
          adultosList={adultosList}
        />
      </div>
    </div>
  );
}
