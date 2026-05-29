import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/modules/auth/utils/jwt';
import { ROLES } from '@/lib/constants/roles';
import { getRelevamientoById } from '@/modules/relevamientos/services/relevamiento-service';
import { getAdultosMayoresList } from '@/modules/adultos-mayores/services/adulto-mayor-service';
import RelevamientoForm from '@/modules/relevamientos/components/RelevamientoForm';

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
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Miga de Pan */}
      <nav className="text-sm text-slate-500 flex items-center gap-2">
        <Link href="/modules/adultos-mayores" className="hover:text-slate-800 transition-colors">
          Adultos Mayores
        </Link>
        <span>/</span>
        <Link href={`/modules/adultos-mayores/${data.adultoMayorId}`} className="hover:text-slate-800 transition-colors">
          Ficha Participante
        </Link>
        <span>/</span>
        <Link href={`/modules/relevamientos/${data.id}`} className="hover:text-slate-800 transition-colors">
          Detalle Relevamiento
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Editar Relevamiento</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Editar Relevamiento Social</h1>
        <p className="text-slate-500 text-sm mt-1">
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
    </div>
  );
}
