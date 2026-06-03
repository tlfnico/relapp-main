import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/modules/auth/utils/jwt';
import { getAdultosMayoresList, getAdultoMayorById } from '@/modules/adultos-mayores/services/adulto-mayor-service';
import RelevamientoForm from '@/modules/relevamientos/components/RelevamientoForm';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/Breadcrumbs';
import PageTransition from '@/components/PageTransition';
import { ArrowLeft, FilePlus } from 'lucide-react';

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

  // Obtener info del adulto mayor si viene precargado
  let adultoData = null;
  if (adultoMayorId) {
    adultoData = await getAdultoMayorById(adultoMayorId);
  }

  // 2. Recuperar la lista de adultos mayores activos para el selector (si no viene precargado)
  const adultosList = await getAdultosMayoresList();

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Adultos Mayores', href: '/modules/adultos-mayores' },
  ];

  if (adultoData) {
    breadcrumbItems.push(
      { label: `${adultoData.apellido}, ${adultoData.nombre}`, href: `/modules/adultos-mayores/${adultoData.id}` }
    );
  }
  breadcrumbItems.push({ label: 'Nuevo Relevamiento' });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 flex flex-col items-center">
      <PageTransition className="w-full max-w-4xl flex flex-col gap-6">

        {/* Miga de Pan y Botón Volver */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Breadcrumbs items={breadcrumbItems} />
          <Link
            href={adultoMayorId ? `/modules/adultos-mayores/${adultoMayorId}` : '/modules/adultos-mayores'}
            className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer self-start md:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {adultoMayorId ? 'Volver al Participante' : 'Volver al Listado'}
          </Link>
        </div>

        {/* Encabezado */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FilePlus className="w-6 h-6 text-emerald-400" />
            Iniciar Relevamiento Social
          </h1>
          <p className="text-zinc-455 text-sm mt-1">
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
      </PageTransition>
    </main>
  );
}
