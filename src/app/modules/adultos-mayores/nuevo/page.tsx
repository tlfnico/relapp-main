import React from 'react';
import AdultoMayorForm from '@/modules/adultos-mayores/components/AdultoMayorForm';
import Link from 'next/link';

export default function NuevoAdultoMayorPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Miga de Pan */}
      <nav className="text-sm text-slate-500 flex items-center gap-2">
        <Link href="/modules/adultos-mayores" className="hover:text-slate-800 transition-colors">
          Adultos Mayores
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Nuevo Registro</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registrar Nuevo Adulto Mayor</h1>
        <p className="text-slate-500 text-sm mt-1">
          Ingrese los datos fundamentales de identificación y habitacionales para dar de alta al participante.
        </p>
      </div>

      <div className="pt-2">
        <AdultoMayorForm />
      </div>
    </div>
  );
}
