import Link from 'next/link';

export const metadata = {
  title: 'Acceso No Autorizado | RelApp',
  description: 'No tienes los permisos necesarios para acceder a este recurso.',
};

/**
 * Página de error 403 (Acceso Denegado).
 * Se muestra cuando un usuario autenticado intenta ingresar a un módulo
 * para el cual su rol no está autorizado.
 */
export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      <div className="max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-black text-red-500 tracking-tight">403</h1>
        <h2 className="mt-3 text-lg font-bold text-white">Acceso Denegado</h2>
        <p className="mt-2 text-sm text-zinc-400 font-normal">
          Tu usuario no cuenta con los privilegios requeridos para ingresar a este módulo.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl text-zinc-950 bg-white hover:bg-zinc-200 transition duration-150 focus:outline-none"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
