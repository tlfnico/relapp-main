'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createRelevamientoAction, updateRelevamientoAction } from '../actions/relevamientoActions';
import { useToast } from '@/components/Toast';
import { ArrowLeft, Save, FilePlus, AlertCircle, AlertTriangle } from 'lucide-react';

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
  const { showToast } = useToast();
  const isEditing = !!initialData;
  const [isPending, startTransition] = useTransition();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    setGlobalError(null);
    setErrors({});

    startTransition(async () => {
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
          showToast('Por favor, revise los errores en el formulario.', 'warning');
          return;
        }

        let res;
        if (isEditing && initialData) {
          res = await updateRelevamientoAction(initialData.id, parsed.data);
        } else {
          res = await createRelevamientoAction(parsed.data);
        }

        if (res.success) {
          showToast(
            isEditing 
              ? 'El relevamiento se ha actualizado correctamente.' 
              : 'El relevamiento ha sido registrado exitosamente.', 
            'success'
          );
          router.push(`/modules/adultos-mayores/${formData.adultoMayorId}`);
        } else {
          setGlobalError(res.error || 'Ocurrió un error al guardar el relevamiento.');
          showToast(res.error || 'Ocurrió un error al guardar.', 'error');
        }
      } catch {
        setGlobalError('Ha ocurrido un error inesperado al procesar los datos.');
        showToast('Error inesperado de comunicación.', 'error');
      }
    });
  };

  const selectedAdult = adultosList.find((a) => a.id === formData.adultoMayorId);

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8 max-w-4xl bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl"
    >
      {isReadOnly && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>⚠️ Vista de Solo Lectura:</strong> Este relevamiento se encuentra <strong>FINALIZADO</strong> y su rol (Trabajador Social) no posee permisos para modificarlo.
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {globalError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{globalError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Selección de Adulto Mayor */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-100 border-b border-zinc-850 pb-2">1. Identificación del Adulto Mayor</h2>
        <div className="flex flex-col">
          <label htmlFor="adultoMayorId" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Adulto Mayor Participante *
          </label>
          {adultoMayorId || isEditing ? (
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-semibold text-zinc-200">
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
              disabled={isReadOnly || isPending}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50 cursor-pointer"
            >
              <option value="">-- Seleccione un participante --</option>
              {adultosList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.apellido}, {a.nombre} (DNI: {a.dni})
                </option>
              ))}
            </select>
          )}
          <AnimatePresence>
            {errors.adultoMayorId && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-1.5 text-xs text-rose-400 font-medium"
              >
                {errors.adultoMayorId}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Área Habitacional */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-100 border-b border-zinc-850 pb-2">2. Área Habitacional</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="tipoVivienda" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
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
              disabled={isReadOnly || isPending}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50"
            />
            <AnimatePresence>
              {errors.tipoVivienda && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1.5 text-xs text-rose-400 font-medium"
                >
                  {errors.tipoVivienda}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col">
            <label htmlFor="tieneAgua" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Acceso a Agua Corriente *
            </label>
            <select
              id="tieneAgua"
              name="tieneAgua"
              value={formData.tieneAgua.toString()}
              onChange={handleChange}
              required
              disabled={isReadOnly || isPending}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50 cursor-pointer"
            >
              <option value="true">Sí tiene</option>
              <option value="false">No tiene</option>
            </select>
            <AnimatePresence>
              {errors.tieneAgua && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1.5 text-xs text-rose-400 font-medium"
                >
                  {errors.tieneAgua}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col">
            <label htmlFor="tieneLuz" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Energía Eléctrica de Red *
            </label>
            <select
              id="tieneLuz"
              name="tieneLuz"
              value={formData.tieneLuz.toString()}
              onChange={handleChange}
              required
              disabled={isReadOnly || isPending}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50 cursor-pointer"
            >
              <option value="true">Sí tiene</option>
              <option value="false">No tiene</option>
            </select>
            <AnimatePresence>
              {errors.tieneLuz && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1.5 text-xs text-rose-400 font-medium"
                >
                  {errors.tieneLuz}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col">
            <label htmlFor="tieneGas" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Gas Natural de Red *
            </label>
            <select
              id="tieneGas"
              name="tieneGas"
              value={formData.tieneGas.toString()}
              onChange={handleChange}
              required
              disabled={isReadOnly || isPending}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50 cursor-pointer"
            >
              <option value="true">Sí tiene (Red)</option>
              <option value="false">No tiene (Usa Garrafa/Tubo)</option>
            </select>
            <AnimatePresence>
              {errors.tieneGas && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1.5 text-xs text-rose-400 font-medium"
                >
                  {errors.tieneGas}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col md:col-span-2">
            <label htmlFor="hacinamiento" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Hacinamiento crítico *
            </label>
            <select
              id="hacinamiento"
              name="hacinamiento"
              value={formData.hacinamiento.toString()}
              onChange={handleChange}
              required
              disabled={isReadOnly || isPending}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50 cursor-pointer"
            >
              <option value="false">No presenta hacinamiento</option>
              <option value="true">Sí presenta hacinamiento (más de 3 personas por ambiente para dormir)</option>
            </select>
            <AnimatePresence>
              {errors.hacinamiento && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1.5 text-xs text-rose-400 font-medium"
                >
                  {errors.hacinamiento}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 3. Área Salud y Autonomía */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-100 border-b border-zinc-850 pb-2">3. Salud y Autonomía</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="nivelMovilidad" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
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
              disabled={isReadOnly || isPending}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50"
            />
            <AnimatePresence>
              {errors.nivelMovilidad && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1.5 text-xs text-rose-400 font-medium"
                >
                  {errors.nivelMovilidad}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col">
            <label htmlFor="tomaMedicamentos" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Toma Medicamentos Regularmente *
            </label>
            <select
              id="tomaMedicamentos"
              name="tomaMedicamentos"
              value={formData.tomaMedicamentos.toString()}
              onChange={handleChange}
              required
              disabled={isReadOnly || isPending}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50 cursor-pointer"
            >
              <option value="true">Sí, toma medicación</option>
              <option value="false">No toma medicación regular</option>
            </select>
            <AnimatePresence>
              {errors.tomaMedicamentos && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1.5 text-xs text-rose-400 font-medium"
                >
                  {errors.tomaMedicamentos}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="md:col-span-2 flex flex-col">
            <label htmlFor="enfermedadesCronicas" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
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
              disabled={isReadOnly || isPending}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal resize-none disabled:opacity-50"
            />
            <AnimatePresence>
              {errors.enfermedadesCronicas && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1.5 text-xs text-rose-400 font-medium"
                >
                  {errors.enfermedadesCronicas}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 4. Área Socioeconómica */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-100 border-b border-zinc-850 pb-2">4. Situación Socioeconómica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="ingresos" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
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
              disabled={isReadOnly || isPending}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-mono text-white disabled:opacity-50"
            />
            <AnimatePresence>
              {errors.ingresos && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1.5 text-xs text-rose-400 font-medium"
                >
                  {errors.ingresos}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col">
            <label htmlFor="obraSocial" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
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
              disabled={isReadOnly || isPending}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50"
            />
            <AnimatePresence>
              {errors.obraSocial && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1.5 text-xs text-rose-400 font-medium"
                >
                  {errors.obraSocial}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col md:col-span-2">
            <label htmlFor="redApoyo" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
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
              disabled={isReadOnly || isPending}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal disabled:opacity-50"
            />
            <AnimatePresence>
              {errors.redApoyo && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1.5 text-xs text-rose-400 font-medium"
                >
                  {errors.redApoyo}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 5. Riesgo, Estado e Informe */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-100 border-b border-zinc-850 pb-2">5. Evaluación del Riesgo y Estado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="riesgoSocial" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Riesgo Social Evaluado (Manual) *
            </label>
            <select
              id="riesgoSocial"
              name="riesgoSocial"
              value={formData.riesgoSocial}
              onChange={handleChange}
              required
              disabled={isReadOnly || isPending}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-bold disabled:opacity-50 cursor-pointer"
            >
              <option value="BAJO">BAJO (Estable)</option>
              <option value="MEDIO">MEDIO (Requiere monitoreo)</option>
              <option value="ALTO">ALTO (Vulnerabilidad marcada)</option>
              <option value="CRITICO">CRITICO (Atención prioritaria inmediata)</option>
            </select>
            <AnimatePresence>
              {errors.riesgoSocial && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1.5 text-xs text-rose-400 font-medium"
                >
                  {errors.riesgoSocial}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col">
            <label htmlFor="estado" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Estado del Relevamiento *
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
              disabled={isReadOnly || isPending}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-bold disabled:opacity-50 cursor-pointer"
            >
              <option value="BORRADOR">BORRADOR (Permite modificaciones)</option>
              <option value="FINALIZADO">FINALIZADO (Bloquea edición para Trabajadores Sociales)</option>
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

          <div className="md:col-span-2 flex flex-col">
            <label htmlFor="observacionesGeneral" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Observaciones Generales e Informe Social
            </label>
            <textarea
              id="observacionesGeneral"
              name="observacionesGeneral"
              rows={4}
              value={formData.observacionesGeneral}
              onChange={handleChange}
              placeholder="Detalles adicionales detectados en la visita o entrevista. Estos datos se sanitizan automáticamente al enviar."
              disabled={isReadOnly || isPending}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 text-sm font-normal resize-none disabled:opacity-50"
            />
            <AnimatePresence>
              {errors.observacionesGeneral && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1.5 text-xs text-rose-400 font-medium"
                >
                  {errors.observacionesGeneral}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-zinc-800">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="px-5 py-2.5 border border-zinc-800 text-zinc-450 hover:bg-zinc-850 hover:text-white rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {isReadOnly ? 'Volver' : 'Cancelar'}
        </button>
        {!isReadOnly && (
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
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Guardar Cambios' : 'Registrar Relevamiento'}</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.form>
  );
}
