'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRelevamientoAction, updateRelevamientoAction } from '../actions/relevamientoActions';

interface RelevamientoFormProps {
  userRole: 'ADMIN' | 'SUPERVISOR' | 'SOCIAL_WORKER';
  adultoMayorId?: string; // Si viene precargado por query string
  adultosList: { id: string; nombre: string; apellido: string; dni: string }[];
  initialData?: {
    id: string;
    adultoMayorId: string;
    tipoVivienda: string;
    tieneAgua: boolean;
    tieneLuz: boolean;
    tieneGas: boolean;
    hacinamiento: boolean;
    enfermedadesCronicas: string;
    nivelMovilidad: string;
    tomaMedicamentos: boolean;
    ingresos: string;
    obraSocial: string;
    redApoyo: string;
    riesgoSocial: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
    estado: 'BORRADOR' | 'FINALIZADO';
    observacionesGeneral?: string | null;
  };
}

export default function RelevamientoForm({
  userRole,
  adultoMayorId,
  adultosList,
  initialData,
}: RelevamientoFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  // Si está finalizado y el usuario es SOCIAL_WORKER, bloquear la edición
  const isReadOnly = isEditing && initialData?.estado === 'FINALIZADO' && userRole === 'SOCIAL_WORKER';

  const [formData, setFormData] = useState({
    adultoMayorId: initialData?.adultoMayorId || adultoMayorId || '',
    tipoVivienda: initialData?.tipoVivienda || '',
    tieneAgua: initialData?.tieneAgua !== undefined ? initialData.tieneAgua : true,
    tieneLuz: initialData?.tieneLuz !== undefined ? initialData.tieneLuz : true,
    tieneGas: initialData?.tieneGas !== undefined ? initialData.tieneGas : true,
    hacinamiento: initialData?.hacinamiento !== undefined ? initialData.hacinamiento : false,
    enfermedadesCronicas: initialData?.enfermedadesCronicas || '',
    nivelMovilidad: initialData?.nivelMovilidad || '',
    tomaMedicamentos: initialData?.tomaMedicamentos !== undefined ? initialData.tomaMedicamentos : false,
    ingresos: initialData?.ingresos || '0.00',
    obraSocial: initialData?.obraSocial || '',
    redApoyo: initialData?.redApoyo || '',
    riesgoSocial: initialData?.riesgoSocial || 'BAJO',
    estado: initialData?.estado || 'BORRADOR',
    observacionesGeneral: initialData?.observacionesGeneral || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (isReadOnly) return;
    const { name, value, type } = e.target;
    
    let parsedValue: unknown = value;
    if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    } else if (value === 'true') {
      parsedValue = true;
    } else if (value === 'false') {
      parsedValue = false;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

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
    if (isReadOnly) return;

    setIsPending(true);
    setGlobalError(null);
    setErrors({});

    try {
      const { relevamientoSchema } = await import('../validators/relevamiento.schema');
      const parsed = relevamientoSchema.safeParse(formData);

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
        res = await updateRelevamientoAction(initialData.id, parsed.data);
      } else {
        res = await createRelevamientoAction(parsed.data);
      }

      if (res.success) {
        router.push(`/modules/adultos-mayores/${formData.adultoMayorId}`);
        router.refresh();
      } else {
        setGlobalError(res.error || 'Ocurrió un error al guardar el relevamiento.');
        setIsPending(false);
      }
    } catch {
      setGlobalError('Ha ocurrido un error inesperado al procesar los datos.');
      setIsPending(false);
    }
  };

  const selectedAdult = adultosList.find((a) => a.id === formData.adultoMayorId);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
      {isReadOnly && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-sm">
          <strong>⚠️ Vista de Solo Lectura:</strong> Este relevamiento se encuentra <strong>FINALIZADO</strong> y su rol (Trabajador Social) no posee permisos para modificarlo.
        </div>
      )}

      {globalError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
          {globalError}
        </div>
      )}

      {/* 1. Selección de Adulto Mayor */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">1. Identificación del Adulto Mayor</h2>
        <div>
          <label htmlFor="adultoMayorId" className="block text-sm font-medium text-slate-700 mb-1">
            Adulto Mayor Participante *
          </label>
          {adultoMayorId || isEditing ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700">
              {selectedAdult ? `${selectedAdult.apellido}, ${selectedAdult.nombre} (DNI: ${selectedAdult.dni})` : 'Adulto Mayor seleccionado'}
              <input type="hidden" name="adultoMayorId" value={formData.adultoMayorId} />
            </div>
          ) : (
            <select
              id="adultoMayorId"
              name="adultoMayorId"
              value={formData.adultoMayorId}
              onChange={handleChange}
              required
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 disabled:bg-slate-50"
            >
              <option value="">-- Seleccione un participante --</option>
              {adultosList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.apellido}, {a.nombre} (DNI: {a.dni})
                </option>
              ))}
            </select>
          )}
          {errors.adultoMayorId && <p className="mt-1 text-xs text-rose-600">{errors.adultoMayorId}</p>}
        </div>
      </div>

      {/* 2. Área Habitacional */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">2. Área Habitacional</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tipoVivienda" className="block text-sm font-medium text-slate-700 mb-1">
              Tipo de Vivienda *
            </label>
            <input
              type="text"
              id="tipoVivienda"
              name="tipoVivienda"
              value={formData.tipoVivienda}
              onChange={handleChange}
              placeholder="Ej. Casa de material, Departamento, Pieza inquilinato"
              required
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 disabled:bg-slate-50"
            />
            {errors.tipoVivienda && <p className="mt-1 text-xs text-rose-600">{errors.tipoVivienda}</p>}
          </div>

          <div>
            <label htmlFor="tieneAgua" className="block text-sm font-medium text-slate-700 mb-1">
              Acceso a Agua Corriente *
            </label>
            <select
              id="tieneAgua"
              name="tieneAgua"
              value={formData.tieneAgua.toString()}
              onChange={handleChange}
              required
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 disabled:bg-slate-50"
            >
              <option value="true">Sí tiene</option>
              <option value="false">No tiene</option>
            </select>
            {errors.tieneAgua && <p className="mt-1 text-xs text-rose-600">{errors.tieneAgua}</p>}
          </div>

          <div>
            <label htmlFor="tieneLuz" className="block text-sm font-medium text-slate-700 mb-1">
              Energía Eléctrica de Red *
            </label>
            <select
              id="tieneLuz"
              name="tieneLuz"
              value={formData.tieneLuz.toString()}
              onChange={handleChange}
              required
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 disabled:bg-slate-50"
            >
              <option value="true">Sí tiene</option>
              <option value="false">No tiene</option>
            </select>
            {errors.tieneLuz && <p className="mt-1 text-xs text-rose-600">{errors.tieneLuz}</p>}
          </div>

          <div>
            <label htmlFor="tieneGas" className="block text-sm font-medium text-slate-700 mb-1">
              Gas Natural de Red *
            </label>
            <select
              id="tieneGas"
              name="tieneGas"
              value={formData.tieneGas.toString()}
              onChange={handleChange}
              required
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 disabled:bg-slate-50"
            >
              <option value="true">Sí tiene (Red)</option>
              <option value="false">No tiene (Usa Garrafa/Tubo)</option>
            </select>
            {errors.tieneGas && <p className="mt-1 text-xs text-rose-600">{errors.tieneGas}</p>}
          </div>

          <div>
            <label htmlFor="hacinamiento" className="block text-sm font-medium text-slate-700 mb-1">
              Hacinamiento crítico *
            </label>
            <select
              id="hacinamiento"
              name="hacinamiento"
              value={formData.hacinamiento.toString()}
              onChange={handleChange}
              required
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 disabled:bg-slate-50"
            >
              <option value="false">No presenta hacinamiento</option>
              <option value="true">Sí presenta hacinamiento (más de 3 personas por ambiente para dormir)</option>
            </select>
            {errors.hacinamiento && <p className="mt-1 text-xs text-rose-600">{errors.hacinamiento}</p>}
          </div>
        </div>
      </div>

      {/* 3. Área Salud y Autonomía */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">3. Salud y Autonomía</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="nivelMovilidad" className="block text-sm font-medium text-slate-700 mb-1">
              Nivel de Movilidad *
            </label>
            <input
              type="text"
              id="nivelMovilidad"
              name="nivelMovilidad"
              value={formData.nivelMovilidad}
              onChange={handleChange}
              placeholder="Ej. Independiente, Usa bastón, Silla de ruedas, Postrado"
              required
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 disabled:bg-slate-50"
            />
            {errors.nivelMovilidad && <p className="mt-1 text-xs text-rose-600">{errors.nivelMovilidad}</p>}
          </div>

          <div>
            <label htmlFor="tomaMedicamentos" className="block text-sm font-medium text-slate-700 mb-1">
              Toma Medicamentos Regularmente *
            </label>
            <select
              id="tomaMedicamentos"
              name="tomaMedicamentos"
              value={formData.tomaMedicamentos.toString()}
              onChange={handleChange}
              required
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 disabled:bg-slate-50"
            >
              <option value="true">Sí, toma medicación</option>
              <option value="false">No toma medicación regular</option>
            </select>
            {errors.tomaMedicamentos && <p className="mt-1 text-xs text-rose-600">{errors.tomaMedicamentos}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="enfermedadesCronicas" className="block text-sm font-medium text-slate-700 mb-1">
              Detalle de Enfermedades Crónicas *
            </label>
            <textarea
              id="enfermedadesCronicas"
              name="enfermedadesCronicas"
              rows={3}
              value={formData.enfermedadesCronicas}
              onChange={handleChange}
              placeholder="Detalle enfermedades. Si no posee, escribir 'Ninguna'."
              required
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 resize-none disabled:bg-slate-50"
            />
            {errors.enfermedadesCronicas && <p className="mt-1 text-xs text-rose-600">{errors.enfermedadesCronicas}</p>}
          </div>
        </div>
      </div>

      {/* 4. Área Socioeconómica */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">4. Situación Socioeconómica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="ingresos" className="block text-sm font-medium text-slate-700 mb-1">
              Ingreso Mensual Estimado ($) *
            </label>
            <input
              type="number"
              id="ingresos"
              name="ingresos"
              step="0.01"
              min="0"
              value={formData.ingresos}
              onChange={handleChange}
              required
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 disabled:bg-slate-50"
            />
            {errors.ingresos && <p className="mt-1 text-xs text-rose-600">{errors.ingresos}</p>}
          </div>

          <div>
            <label htmlFor="obraSocial" className="block text-sm font-medium text-slate-700 mb-1">
              Obra Social o Cobertura Médica *
            </label>
            <input
              type="text"
              id="obraSocial"
              name="obraSocial"
              value={formData.obraSocial}
              onChange={handleChange}
              placeholder="Ej. PAMI, IOMA, Ninguna"
              required
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 disabled:bg-slate-50"
            />
            {errors.obraSocial && <p className="mt-1 text-xs text-rose-600">{errors.obraSocial}</p>}
          </div>

          <div>
            <label htmlFor="redApoyo" className="block text-sm font-medium text-slate-700 mb-1">
              Red de Apoyo Principal *
            </label>
            <input
              type="text"
              id="redApoyo"
              name="redApoyo"
              value={formData.redApoyo}
              onChange={handleChange}
              placeholder="Ej. Familiar, Vecinal, Centro de Jubilados, Ninguna"
              required
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 disabled:bg-slate-50"
            />
            {errors.redApoyo && <p className="mt-1 text-xs text-rose-600">{errors.redApoyo}</p>}
          </div>
        </div>
      </div>

      {/* 5. Riesgo, Estado e Informe */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">5. Evaluación del Riesgo y Estado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="riesgoSocial" className="block text-sm font-medium text-slate-700 mb-1">
              Riesgo Social Evaluado (Manual) *
            </label>
            <select
              id="riesgoSocial"
              name="riesgoSocial"
              value={formData.riesgoSocial}
              onChange={handleChange}
              required
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 disabled:bg-slate-50 font-semibold"
            >
              <option value="BAJO">BAJO (Estable)</option>
              <option value="MEDIO">MEDIO (Requiere monitoreo)</option>
              <option value="ALTO">ALTO (Vulnerabilidad marcada)</option>
              <option value="CRITICO">CRITICO (Atención prioritaria inmediata)</option>
            </select>
            {errors.riesgoSocial && <p className="mt-1 text-xs text-rose-600">{errors.riesgoSocial}</p>}
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-slate-700 mb-1">
              Estado del Relevamiento *
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 disabled:bg-slate-50 font-semibold"
            >
              <option value="BORRADOR">BORRADOR (Permite modificaciones)</option>
              <option value="FINALIZADO">FINALIZADO (Bloquea edición para Trabajadores Sociales)</option>
            </select>
            {errors.estado && <p className="mt-1 text-xs text-rose-600">{errors.estado}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="observacionesGeneral" className="block text-sm font-medium text-slate-700 mb-1">
              Observaciones Generales e Informe Social
            </label>
            <textarea
              id="observacionesGeneral"
              name="observacionesGeneral"
              rows={4}
              value={formData.observacionesGeneral}
              onChange={handleChange}
              placeholder="Detalles adicionales detectados en la visita o entrevista. Estos datos se sanitizan automáticamente al enviar."
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm text-slate-900 resize-none disabled:bg-slate-50"
            />
            {errors.observacionesGeneral && <p className="mt-1 text-xs text-rose-600">{errors.observacionesGeneral}</p>}
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isReadOnly ? 'Volver' : 'Cancelar'}
        </button>
        {!isReadOnly && (
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
                Guardando...
              </>
            ) : (
              isEditing ? 'Guardar Cambios' : 'Registrar Relevamiento'
            )}
          </button>
        )}
      </div>
    </form>
  );
}
