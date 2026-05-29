import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdultoMayorById } from '@/modules/adultos-mayores/services/adulto-mayor-service';
import AdultoMayorForm from '@/modules/adultos-mayores/components/AdultoMayorForm';

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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Miga de Pan */}
      <nav className="text-sm text-slate-500 flex items-center gap-2">
        <Link href="/modules/adultos-mayores" className="hover:text-slate-800 transition-colors">
          Adultos Mayores
        </Link>
        <span>/</span>
        <Link href={`/modules/adultos-mayores/${data.id}`} className="hover:text-slate-800 transition-colors">
          {data.apellido}, {data.nombre}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Editar</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Editar Adulto Mayor</h1>
        <p className="text-slate-500 text-sm mt-1">
          Modifique los datos correspondientes en la ficha de {data.nombre} {data.apellido}.
        </p>
      </div>

      <div className="pt-2">
        <AdultoMayorForm initialData={data} />
      </div>
    </div>
  );
}
