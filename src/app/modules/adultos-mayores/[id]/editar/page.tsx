import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdultoMayorById } from '@/modules/adultos-mayores/services/adulto-mayor-service';
import AdultoMayorForm from '@/modules/adultos-mayores/components/AdultoMayorForm';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageTransition from '@/components/PageTransition';
import { ArrowLeft, Edit } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarAdultoMayorPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Obtener los datos del adulto mayor por su ID
  const data = await getAdultoMayorById(id);

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 flex flex-col items-center">
      <PageTransition className="w-full max-w-3xl flex flex-col gap-6">
        
        {/* Miga de Pan y Botón Volver */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: 'Adultos Mayores', href: '/modules/adultos-mayores' },
              { label: `${data.apellido}, ${data.nombre}`, href: `/modules/adultos-mayores/${data.id}` },
              { label: 'Editar' },
            ]}
          />
          <Link
            href={`/modules/adultos-mayores/${data.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer self-start md:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Participante
          </Link>
        </div>

        {/* Encabezado */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Edit className="w-6 h-6 text-emerald-400" />
            Editar Adulto Mayor
          </h1>
          <p className="text-zinc-455 text-sm mt-1">
            Modifique los datos correspondientes en la ficha de {data.nombre} {data.apellido}.
          </p>
        </div>

        <div className="pt-2">
          <AdultoMayorForm initialData={data} />
        </div>
      </PageTransition>
    </main>
  );
}
