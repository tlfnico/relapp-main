'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdultoMayorAction, updateAdultoMayorAction } from '../actions/adultoMayorActions';

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
 * Ajuste Obligatorio 6: Formulario sin librerías externas complejas. Simple state, Server Actions y Zod.
 */
export default function AdultoMayorForm({ initialData }: AdultoMayorFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

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
  const [isPending, setIsPending] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error al editar
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setGlobalError(null);
    setErrors({});

    try {
      // Importación dinámica del esquema para validación en el cliente
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
        setIsPending(false);
        return;
      }

      let res;
      if (isEditing && initialData) {
        res = await updateAdultoMayorAction(initialData.id, parsed.data);
      } else {
        res = await createAdultoMayorAction(parsed.data);
      }

      if (res.success) {
        router.push(isEditing ? `/modules/adultos-mayores/${initialData.id}` : '/modules/adultos-mayores');
        router.refresh();
      } else {
        setGlobalError(res.error || 'Ocurrió un error al guardar el formulario.');
        setIsPending(false);
      }
    } catch {
      setGlobalError('Ha ocurrido un error inesperado al procesar los datos locales.');
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
      {globalError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
          {globalError}
        </div>
      )}

      {/* Grid de campos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900"
          />
          {errors.nombre && <p className="mt-1 text-xs text-rose-600">{errors.nombre}</p>}
        </div>

        {/* Apellido */}
        <div>
          <label htmlFor="apellido" className="block text-sm font-medium text-slate-700 mb-1">Apellido *</label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900"
          />
          {errors.apellido && <p className="mt-1 text-xs text-rose-600">{errors.apellido}</p>}
        </div>

        {/* DNI */}
        <div>
          <label htmlFor="dni" className="block text-sm font-medium text-slate-700 mb-1">DNI *</label>
          <input
            type="text"
            id="dni"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            required
            disabled={isEditing}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
          />
          {errors.dni && <p className="mt-1 text-xs text-rose-600">{errors.dni}</p>}
        </div>

        {/* Fecha de Nacimiento */}
        <div>
          <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento *</label>
          <input
            type="date"
            id="fechaNacimiento"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900"
          />
          {errors.fechaNacimiento && <p className="mt-1 text-xs text-rose-600">{errors.fechaNacimiento}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
          <input
            type="text"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900"
          />
          {errors.telefono && <p className="mt-1 text-xs text-rose-600">{errors.telefono}</p>}
        </div>

        {/* Estado */}
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-slate-700 mb-1">Estado *</label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900"
          >
            <option value="ACTIVO">Activo</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="FALLECIDO">Fallecido</option>
          </select>
          {errors.estado && <p className="mt-1 text-xs text-rose-600">{errors.estado}</p>}
        </div>

        {/* Dirección */}
        <div className="md:col-span-2">
          <label htmlFor="direccion" className="block text-sm font-medium text-slate-700 mb-1">Dirección *</label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900"
          />
          {errors.direccion && <p className="mt-1 text-xs text-rose-600">{errors.direccion}</p>}
        </div>

        {/* Barrio */}
        <div>
          <label htmlFor="barrio" className="block text-sm font-medium text-slate-700 mb-1">Barrio *</label>
          <input
            type="text"
            id="barrio"
            name="barrio"
            value={formData.barrio}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900"
          />
          {errors.barrio && <p className="mt-1 text-xs text-rose-600">{errors.barrio}</p>}
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label htmlFor="observaciones" className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
        <textarea
          id="observaciones"
          name="observaciones"
          rows={4}
          value={formData.observaciones}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 resize-none"
          placeholder="Anotaciones de salud, habitacionales o de acompañamiento social (se sanitizan de forma segura)..."
        />
        {errors.observaciones && <p className="mt-1 text-xs text-rose-600">{errors.observaciones}</p>}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center px-6 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          {isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {isEditing ? 'Guardando...' : 'Registrando...'}
            </>
          ) : (
            isEditing ? 'Guardar cambios' : 'Registrar Adulto Mayor'
          )}
        </button>
      </div>
    </form>
  );
}
