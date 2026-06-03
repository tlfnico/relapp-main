'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createAdultoMayorAction, updateAdultoMayorAction } from '../actions/adultoMayorActions';
import { useToast } from '@/components/Toast';
import { ArrowLeft, Save, UserPlus, AlertCircle } from 'lucide-react';

interface AdultoMayorFormProps {
  initialData?: {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    fechaNacimiento: string;
    telefono?: string | null;
    direccion: string;
    barrio: string;
    observaciones?: string | null;
    estado: 'ACTIVO' | 'PENDIENTE' | 'INACTIVO' | 'FALLECIDO';
  };
}

/**
 * Formulario de creación/edición de Adulto Mayor.
 * Utiliza transiciones de React 19 para sincronizar el estado de carga (isPending)
 * con la redirección de Next.js, evitando bloqueos en la interfaz.
 */
export default function AdultoMayorForm({ initialData }: AdultoMayorFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditing = !!initialData;
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    apellido: initialData?.apellido || '',
    dni: initialData?.dni || '',
    fechaNacimiento: initialData?.fechaNacimiento ? initialData.fechaNacimiento.substring(0, 10) : '',
    telefono: initialData?.telefono || '',
    direccion: initialData?.direccion || '',
    barrio: initialData?.barrio || '',
    observaciones: initialData?.observaciones || '',
    estado: initialData?.estado || 'PENDIENTE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setErrors({});

    startTransition(async () => {
      try {
        const { adultoMayorSchema } = await import('../validators/adultoMayor.schema');
        const parsed = adultoMayorSchema.safeParse(formData);

        if (!parsed.success) {
          const fieldErrors: Record<string, string> = {};
          parsed.error.issues.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          showToast('Por favor, revise los errores en el formulario.', 'warning');
          return;
        }

        let res;
        if (isEditing && initialData) {
          res = await updateAdultoMayorAction(initialData.id, parsed.data);
        } else {
          res = await createAdultoMayorAction(parsed.data);
        }

        if (res.success) {
          showToast(
            isEditing 
              ? 'La ficha del participante se ha actualizado correctamente.' 
              : 'El participante ha sido registrado exitosamente.', 
            'success'
          );
          router.push(isEditing ? `/modules/adultos-mayores/${initialData.id}` : '/modules/adultos-mayores');
        } else {
          setGlobalError(res.error || 'Ocurrió un error al guardar el formulario.');
          showToast(res.error || 'Ocurrió un error al guardar.', 'error');
        }
      } catch {
        setGlobalError('Ha ocurrido un error inesperado al procesar los datos.');
        showToast('Error inesperado de comunicación.', 'error');
      }
    });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6 max-w-3xl bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl"
    >
      <AnimatePresence mode="wait">
        {globalError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-start gap-2"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{globalError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de campos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="flex flex-col">
          <label htmlFor="nombre" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Nombre *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50"
          />
          <AnimatePresence>
            {errors.nombre && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-1.5 text-xs text-rose-400 font-medium"
              >
                {errors.nombre}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Apellido */}
        <div className="flex flex-col">
          <label htmlFor="apellido" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Apellido *
          </label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50"
          />
          <AnimatePresence>
            {errors.apellido && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-1.5 text-xs text-rose-400 font-medium"
              >
                {errors.apellido}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* DNI */}
        <div className="flex flex-col">
          <label htmlFor="dni" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            DNI *
          </label>
          <input
            type="text"
            id="dni"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            required
            disabled={isEditing || isPending}
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50 disabled:bg-zinc-900/50 disabled:border-zinc-850"
          />
          <AnimatePresence>
            {errors.dni && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-1.5 text-xs text-rose-400 font-medium"
              >
                {errors.dni}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Fecha de Nacimiento */}
        <div className="flex flex-col">
          <label htmlFor="fechaNacimiento" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Fecha de Nacimiento *
          </label>
          <input
            type="date"
            id="fechaNacimiento"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            required
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50"
          />
          <AnimatePresence>
            {errors.fechaNacimiento && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-1.5 text-xs text-rose-400 font-medium"
              >
                {errors.fechaNacimiento}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Teléfono */}
        <div className="flex flex-col">
          <label htmlFor="telefono" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Teléfono
          </label>
          <input
            type="text"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50"
            placeholder="Ej: +54 9 11 1234-5678"
          />
          <AnimatePresence>
            {errors.telefono && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-1.5 text-xs text-rose-400 font-medium"
              >
                {errors.telefono}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Estado */}
        <div className="flex flex-col">
          <label htmlFor="estado" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Estado *
          </label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50 cursor-pointer"
          >
            <option value="ACTIVO">Activo</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="FALLECIDO">Fallecido</option>
          </select>
          <AnimatePresence>
            {errors.estado && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-1.5 text-xs text-rose-400 font-medium"
              >
                {errors.estado}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Dirección */}
        <div className="md:col-span-2 flex flex-col">
          <label htmlFor="direccion" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Dirección *
          </label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            required
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50"
            placeholder="Ej: Calle falsa 123"
          />
          <AnimatePresence>
            {errors.direccion && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-1.5 text-xs text-rose-400 font-medium"
              >
                {errors.direccion}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Barrio */}
        <div className="flex flex-col">
          <label htmlFor="barrio" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Barrio *
          </label>
          <input
            type="text"
            id="barrio"
            name="barrio"
            value={formData.barrio}
            onChange={handleChange}
            required
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50"
            placeholder="Ej: Palermo"
          />
          <AnimatePresence>
            {errors.barrio && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-1.5 text-xs text-rose-400 font-medium"
              >
                {errors.barrio}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Observaciones */}
      <div className="flex flex-col">
        <label htmlFor="observaciones" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
          Observaciones
        </label>
        <textarea
          id="observaciones"
          name="observaciones"
          rows={4}
          value={formData.observaciones}
          onChange={handleChange}
          disabled={isPending}
          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal resize-none disabled:opacity-50"
          placeholder="Anotaciones de salud, habitacionales o de acompañamiento social (se sanitizan de forma segura)..."
        />
        <AnimatePresence>
          {errors.observaciones && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-1.5 text-xs text-rose-400 font-medium"
            >
              {errors.observaciones}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-zinc-800">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="px-5 py-2.5 border border-zinc-800 text-zinc-450 hover:bg-zinc-850 hover:text-white rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-zinc-950 hover:bg-zinc-200 active:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-all duration-150 shadow-md cursor-pointer"
        >
          {isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-zinc-950" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              {isEditing ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{isEditing ? 'Guardar cambios' : 'Registrar Adulto'}</span>
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
