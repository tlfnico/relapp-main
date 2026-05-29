'use client';

import React, { useState } from 'react';
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
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
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
    <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">RelApp</h1>
        <p className="mt-2 text-sm text-zinc-400 font-normal">Plataforma Modular de Relevamientos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div className="p-3.5 text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full mt-1.5 px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 ease-in-out disabled:opacity-50 text-sm font-normal"
            placeholder="correo@ejemplo.com"
          />
          {validationErrors.email && (
            <p className="mt-1 text-xs text-red-400 font-medium">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full mt-1.5 px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl focus:ring-1 focus:ring-zinc-700 focus:outline-none transition duration-150 ease-in-out disabled:opacity-50 text-sm font-normal"
            placeholder="••••••••"
          />
          {validationErrors.password && (
            <p className="mt-1 text-xs text-red-400 font-medium">{validationErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent font-semibold rounded-xl text-zinc-950 bg-white hover:bg-zinc-200 transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-white disabled:opacity-50 text-sm cursor-pointer"
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-zinc-800 pt-5">
        <p className="text-xs text-zinc-500 font-medium">Credenciales de prueba:</p>
        <div className="mt-2 space-y-1 bg-zinc-950/50 p-2.5 border border-zinc-800/40 rounded-xl">
          <p className="text-2xs text-zinc-400 font-mono">
            ADMIN: <span className="text-white">admin@relapp.com</span>
          </p>
          <p className="text-2xs text-zinc-400 font-mono">
            SUPERVISOR: <span className="text-white">supervisor@relapp.com</span>
          </p>
          <p className="text-2xs text-zinc-400 font-mono">
            WORKER: <span className="text-white">social@relapp.com</span>
          </p>
          <p className="text-2xs text-zinc-500 font-mono mt-1 pt-1 border-t border-zinc-900">
            Contraseña: <span className="text-zinc-300 font-bold">relapp2026</span>
          </p>
        </div>
      </div>
    </div>
  );
}
