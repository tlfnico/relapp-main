import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/modules/auth/utils/jwt';
import { ROLES } from '@/lib/constants/roles';
import { getRelevamientoById } from '@/modules/relevamientos/services/relevamiento-service';
import DeleteRelevamientoButton from '@/modules/relevamientos/components/DeleteRelevamientoButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RelevamientoDetailPage({ params }: PageProps) {
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
    notFound(); // O redirigir
  }

  // Determinar permisos
  const isAuthorizedToDelete = session.role === ROLES.ADMIN;
  const isAuthorizedToEdit =
    session.role !== ROLES.SOCIAL_WORKER || data.estado === 'BORRADOR';

  // Configurar badges de Riesgo Social
  const getRiesgoBadge = (riesgo: string) => {
    switch (riesgo) {
      case 'BAJO':
        return { label: 'Bajo', style: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
      case 'MEDIO':
        return { label: 'Medio', style: 'bg-amber-50 text-amber-700 border-amber-100' };
      case 'ALTO':
        return { label: 'Alto', style: 'bg-orange-50 text-orange-700 border-orange-100' };
      case 'CRITICO':
        return { label: 'Crítico', style: 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' };
      default:
        return { label: riesgo, style: 'bg-slate-50 text-slate-700 border-slate-100' };
    }
  };

  // Configurar badges de Estado
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'BORRADOR':
        return { label: 'Borrador', style: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'FINALIZADO':
        return { label: 'Finalizado', style: 'bg-blue-50 text-blue-700 border-blue-100' };
      default:
        return { label: estado, style: 'bg-slate-50 text-slate-700 border-slate-100' };
    }
  };

  const riesgoBadge = getRiesgoBadge(data.riesgoSocial);
  const estadoBadge = getEstadoBadge(data.estado);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Miga de Pan */}
      <nav className="text-sm text-slate-500 flex items-center gap-2">
        <Link href="/modules/adultos-mayores" className="hover:text-slate-800 transition-colors">
          Adultos Mayores
        </Link>
        <span>/</span>
        <Link href={`/modules/adultos-mayores/${data.adultoMayorId}`} className="hover:text-slate-800 transition-colors">
          {data.adultoMayorApellido}, {data.adultoMayorNombre}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Detalle del Relevamiento</span>
      </nav>

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Relevamiento Social
            </h1>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${estadoBadge.style}`}>
              {estadoBadge.label}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${riesgoBadge.style}`}>
              Riesgo: {riesgoBadge.label}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Participante: <strong>{data.adultoMayorApellido}, {data.adultoMayorNombre}</strong> (DNI: {data.adultoMayorDni})
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAuthorizedToEdit && (
            <Link
              href={`/modules/relevamientos/${data.id}/editar`}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-xl text-sm font-medium text-slate-700 transition-colors shadow-sm flex items-center justify-center"
            >
              Editar Relevamiento
            </Link>
          )}
          {isAuthorizedToDelete && (
            <DeleteRelevamientoButton id={data.id} adultoMayorId={data.adultoMayorId} />
          )}
        </div>
      </div>

      {/* Detalle en Secciones */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">
        
        {/* Sección Habitacional */}
        <div className="space-y-4">
          <h2 className="text-md font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Área Habitacional
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <span className="text-slate-400 font-medium">Tipo de Vivienda:</span>
              <span className="ml-2 text-slate-800 font-semibold">{data.tipoVivienda}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Acceso a Agua de Red:</span>
              <span className="ml-2 text-slate-800 font-semibold">{data.tieneAgua ? 'Sí tiene' : 'No tiene'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Acceso a Electricidad:</span>
              <span className="ml-2 text-slate-800 font-semibold">{data.tieneLuz ? 'Sí tiene' : 'No tiene'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Acceso a Gas de Red:</span>
              <span className="ml-2 text-slate-800 font-semibold">{data.tieneGas ? 'Sí tiene (Red)' : 'No tiene (Usa Garrafa)'}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-slate-400 font-medium">Situación de Hacinamiento:</span>
              <span className="ml-2 text-slate-800 font-semibold">
                {data.hacinamiento ? '🚨 Presenta hacinamiento crítico' : 'No presenta hacinamiento'}
              </span>
            </div>
          </div>
        </div>

        {/* Sección Salud y Autonomía */}
        <div className="space-y-4">
          <h2 className="text-md font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Área Salud y Autonomía
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <span className="text-slate-400 font-medium">Nivel de Movilidad:</span>
              <span className="ml-2 text-slate-800 font-semibold">{data.nivelMovilidad}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Toma Medicamentos Regularmente:</span>
              <span className="ml-2 text-slate-800 font-semibold">{data.tomaMedicamentos ? 'Sí' : 'No'}</span>
            </div>
            <div className="md:col-span-2">
              <span className="block text-slate-400 font-medium mb-1.5">Enfermedades Crónicas Detalladas:</span>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-slate-800">
                {data.enfermedadesCronicas}
              </div>
            </div>
          </div>
        </div>

        {/* Sección Socioeconómica */}
        <div className="space-y-4">
          <h2 className="text-md font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Área Socioeconómica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <span className="text-slate-400 font-medium">Ingresos Mensuales:</span>
              <span className="ml-2 text-slate-800 font-mono font-bold">
                ${parseFloat(data.ingresos).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Obra Social / Cobertura:</span>
              <span className="ml-2 text-slate-800 font-semibold">{data.obraSocial}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-slate-400 font-medium">Red de Apoyo:</span>
              <span className="ml-2 text-slate-800 font-semibold">{data.redApoyo}</span>
            </div>
          </div>
        </div>

        {/* Observaciones generales */}
        {data.observacionesGeneral && (
          <div className="border-t border-slate-100 pt-6">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Informe General / Observaciones del Encuestador</span>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
              {data.observacionesGeneral}
            </div>
          </div>
        )}

        {/* Auditoría */}
        <div className="border-t border-slate-100 pt-6 flex flex-wrap gap-x-8 gap-y-4 text-xs text-slate-400">
          <div>
            <span>Encuestador responsable: </span>
            <span className="font-semibold text-slate-600">{data.createdByEmail}</span>
          </div>
          <div>
            <span>Realizado el: </span>
            <span className="font-semibold text-slate-600">
              {new Date(data.createdAt).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {data.updatedAt && data.updatedAt.getTime() !== data.createdAt.getTime() && (
            <div>
              <span>Última modificación: </span>
              <span className="font-semibold text-slate-600">
                {new Date(data.updatedAt).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
