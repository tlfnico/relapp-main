'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { softDeleteAdultoMayorAction } from '../actions/adultoMayorActions';

interface DeleteButtonProps {
  id: string;
}

/**
 * Componente cliente interactivo para procesar el soft-delete con confirmación (Ajuste Obligatorio 1).
 */
export default function DeleteButton({ id }: DeleteButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm('¿Está seguro de que desea dar de baja a este adulto mayor? El registro pasará a estar inactivo en el sistema (Soft Delete).')) {
      return;
    }

    setIsPending(true);
    const res = await softDeleteAdultoMayorAction(id);

    if (res.success) {
      router.push('/modules/adultos-mayores');
      router.refresh();
    } else {
      alert(res.error || 'Ha ocurrido un error al dar de baja el registro.');
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-5 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 active:bg-rose-200 text-rose-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
      {isPending ? 'Eliminando...' : 'Dar de Baja'}
    </button>
  );
}
