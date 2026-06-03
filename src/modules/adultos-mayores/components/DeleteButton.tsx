'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { softDeleteAdultoMayorAction } from '../actions/adultoMayorActions';
import { useToast } from '@/components/Toast';
import { Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  id: string;
}

/**
 * Componente cliente interactivo para procesar el soft-delete con confirmación y transiciones seguras.
 */
export default function DeleteButton({ id }: DeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const handleDelete = () => {
    if (!confirm('¿Está seguro de que desea dar de baja a este adulto mayor? El registro pasará a estar inactivo en el sistema (Soft Delete).')) {
      return;
    }

    startTransition(async () => {
      const res = await softDeleteAdultoMayorAction(id);

      if (res.success) {
        showToast('El adulto mayor ha sido dado de baja correctamente.', 'success');
        router.push('/modules/adultos-mayores');
      } else {
        showToast(res.error || 'Ha ocurrido un error al dar de baja el registro.', 'error');
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
      {isPending ? 'Eliminando...' : 'Dar de Baja'}
    </button>
  );
}

