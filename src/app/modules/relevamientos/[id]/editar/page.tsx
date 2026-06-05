import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/modules/auth/utils/jwt';
import { ROLES } from '@/lib/constants/roles';
import { getRelevamientoById } from '@/modules/relevamientos/services/relevamiento-service';
import { getAdultosMayoresList } from '@/modules/adultos-mayores/services/adulto-mayor-service';
import RelevamientoForm from '@/modules/relevamientos/components/RelevamientoForm';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageTransition from '@/components/PageTransition';
import { ArrowLeft, Edit } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarRelevamientoPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Obtener datos del relevamiento
  const data = await getRelevamientoById(id);
  if (!data) {
    notFound();
  }

  // 2. Obtener sesión de usuario
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  const session = sessionToken ? await verifyJWT(sessionToken) : null;
  if (!session) {
    redirect('/login');
  }

  // 3. Aplicar restricción de edición para SOCIAL_WORKER sobre FINALIZADO
  if (session.role === ROLES.SOCIAL_WORKER && data.estado === 'FINALIZADO') {
    redirect(`/modules/relevamientos/${data.id}`);
  }

  // 4. Recuperar la lista de adultos mayores activos para el mapeo del formulario
  const adultosList = await getAdultosMayoresList();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 flex flex-col items-center">
      <PageTransition className="w-full max-w-4xl flex flex-col gap-6">

        {/* Miga de Pan y Botón Volver */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: 'Adultos Mayores', href: '/modules/adultos-mayores' },
              { label: `${data.adultoMayorApellido}, ${data.adultoMayorNombre}`, href: `/modules/adultos-mayores/${data.adultoMayorId}` },
              { label: 'Detalle Relevamiento', href: `/modules/relevamientos/${data.id}` },
              { label: 'Editar' },
            ]}
          />
          <Link
            href={`/modules/adultos-mayores/${data.adultoMayorId}`}
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
            Editar Relevamiento Social
          </h1>
          <p className="text-zinc-450 text-sm mt-1">
            Modifique los datos relevados del participante. Si finaliza el relevamiento, quedará bloqueado para edición por parte de los trabajadores sociales.
          </p>
        </div>

        <div className="pt-2">
          <RelevamientoForm
            userRole={session.role}
            adultoMayorId={data.adultoMayorId}
            adultosList={adultosList}
            initialData={{
              id: data.id,
              adultoMayorId: data.adultoMayorId,
              tipoVivienda: data.tipoVivienda,
              tieneAgua: data.tieneAgua,
              tieneLuz: data.tieneLuz,
              tieneGas: data.tieneGas,
              hacinamiento: data.hacinamiento,
              enfermedadesCronicas: data.enfermedadesCronicas,
              nivelMovilidad: data.nivelMovilidad,
              tomaMedicamentos: data.tomaMedicamentos,
              ingresos: data.ingresos,
              obraSocial: data.obraSocial,
              redApoyo: data.redApoyo,
              riesgoSocial: data.riesgoSocial,
              estado: data.estado,
              observacionesGeneral: data.observacionesGeneral,
            }}
          />
        </div>
      </PageTransition>
    </main>
  );
}
