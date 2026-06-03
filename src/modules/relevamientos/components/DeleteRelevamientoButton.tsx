'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { softDeleteRelevamientoAction } from '../actions/relevamientoActions';
import { useToast } from '@/components/Toast';
import { Trash2 } from 'lucide-react';

interface DeleteRelevamientoButtonProps {
  id: string;
  adultoMayorId: string;
}

export default function DeleteRelevamientoButton({ id, adultoMayorId }: DeleteRelevamientoButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const handleDelete = () => {
    if (!confirm('¿Está seguro de que desea eliminar este relevamiento? Esta acción realizará un borrado lógico (Soft Delete).')) {
      return;
    }

    startTransition(async () => {
      const res = await softDeleteRelevamientoAction(id);

      if (res.success) {
        showToast('El relevamiento ha sido eliminado correctamente.', 'success');
        router.push(`/modules/adultos-mayores/${adultoMayorId}`);
      } else {
        showToast(res.error || 'Ha ocurrido un error al eliminar el relevamiento.', 'error');
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-5 py-2.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-400 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
    >
      <Trash2 className="w-4 h-4" />
      {isPending ? 'Eliminando...' : 'Eliminar Relevamiento'}
    </button>
  );
}

