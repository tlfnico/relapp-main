'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { softDeleteRelevamientoAction } from '../actions/relevamientoActions';

interface DeleteRelevamientoButtonProps {
  id: string;
  adultoMayorId: string;
}

export default function DeleteRelevamientoButton({ id, adultoMayorId }: DeleteRelevamientoButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm('¿Está seguro de que desea eliminar este relevamiento? Esta acción realizará un borrado lógico (Soft Delete).')) {
      return;
    }

    setIsPending(true);
    const res = await softDeleteRelevamientoAction(id);

    if (res.success) {
      router.push(`/modules/adultos-mayores/${adultoMayorId}`);
      router.refresh();
    } else {
      alert(res.error || 'Ha ocurrido un error al eliminar el relevamiento.');
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-5 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 active:bg-rose-200 text-rose-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
      {isPending ? 'Eliminando...' : 'Eliminar Relevamiento'}
    </button>
  );
}
