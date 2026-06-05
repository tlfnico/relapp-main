'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loginAction } from '../actions/loginAction';
import { loginSchema } from '../validators/login.schema';

/**
 * Componente de formulario de Login del lado del cliente.
 * Implementa validación interactiva rápida con Zod antes de llamar a la Server Action.
 * Muestra estados de carga y mensajes de error estilizados con Tailwind.
 */
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setIsLoading(true);

    // 1. Validación en el cliente con Zod
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validationResult.error.issues.forEach((err) => {
        const path = err.path[0];
        if (path === 'email') fieldErrors.email = err.message;
        if (path === 'password') fieldErrors.password = err.message;
      });
      setValidationErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    // 2. Invocar la Server Action de forma asíncrona
    const response = await loginAction({ email, password });

    if (response.success) {
      // Éxito: navegación completa para garantizar que la cookie de sesión
      // se envíe correctamente en el siguiente request al servidor
      window.location.href = '/dashboard';
    } else {
      // Error de autenticación del servidor
      setError(response.error || 'Ha ocurrido un error al iniciar sesión.');
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-sm"
    >
      {/* Header del formulario */}
      <div className="mb-8">
        {/* Logo mark — visible solo en mobile donde el panel hero está oculto */}
        <div className="mb-6 flex items-center gap-2.5 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/25">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-400"
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-300">RelApp</span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white">
          Bienvenido
        </h2>
        <p className="mt-1.5 text-sm text-zinc-500">
          Ingresá tus credenciales para continuar
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Error general */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-900/50 bg-red-950/30 p-3.5 text-xs font-medium text-red-400"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </motion.div>
        )}

        {/* Campo Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            aria-invalid={!!validationErrors.email}
            aria-describedby={
              validationErrors.email ? 'email-error' : undefined
            }
            className={[
              'w-full rounded-xl border px-4 py-2.5 text-sm text-white',
              'bg-zinc-900/80 placeholder:text-zinc-600',
              'transition-all duration-150 ease-in-out',
              'focus:outline-none focus:ring-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              validationErrors.email
                ? 'border-red-800/60 focus:border-red-700 focus:ring-red-700/50'
                : 'border-zinc-800 focus:border-emerald-600/60 focus:ring-emerald-600/30',
            ].join(' ')}
            placeholder="correo@ejemplo.com"
          />
          {validationErrors.email && (
            <p id="email-error" className="text-xs font-medium text-red-400">
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* Campo Contraseña */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            aria-invalid={!!validationErrors.password}
            aria-describedby={
              validationErrors.password ? 'password-error' : undefined
            }
            className={[
              'w-full rounded-xl border px-4 py-2.5 text-sm text-white',
              'bg-zinc-900/80 placeholder:text-zinc-600',
              'transition-all duration-150 ease-in-out',
              'focus:outline-none focus:ring-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              validationErrors.password
                ? 'border-red-800/60 focus:border-red-700 focus:ring-red-700/50'
                : 'border-zinc-800 focus:border-emerald-600/60 focus:ring-emerald-600/30',
            ].join(' ')}
            placeholder="••••••••"
          />
          {validationErrors.password && (
            <p
              id="password-error"
              className="text-xs font-medium text-red-400"
            >
              {validationErrors.password}
            </p>
          )}
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isLoading}
          className={[
            'group relative w-full overflow-hidden rounded-xl py-2.5 px-4',
            'text-sm font-semibold text-zinc-950',
            'bg-emerald-400 hover:bg-emerald-300',
            'transition-all duration-200 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950',
            'disabled:cursor-not-allowed disabled:opacity-60',
            'flex items-center justify-center gap-2',
          ].join(' ')}
        >
          {isLoading ? (
            <>
              <div
                className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950"
                aria-hidden="true"
              />
              <span>Verificando…</span>
            </>
          ) : (
            <>
              <span>Iniciar Sesión</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-zinc-600">
        RelApp · Sistema de Relevamientos Sociales
      </p>
    </motion.div>
  );
}
