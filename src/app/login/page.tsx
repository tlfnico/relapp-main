import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from '@/modules/auth/components/LoginForm';
import { verifyJWT } from '@/modules/auth/utils/jwt';

export const metadata = {
  title: 'Iniciar Sesión | RelApp',
  description: 'Inicia sesión para acceder al sistema modular de relevamientos.',
};

/**
 * Página pública de inicio de sesión.
 * Ejecuta validación del lado del servidor para redirigir inmediatamente
 * al usuario a /dashboard si ya cuenta con una sesión JWT válida.
 */
export default async function LoginPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (sessionCookie) {
    const session = await verifyJWT(sessionCookie);
    if (session) {
      redirect('/dashboard');
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-zinc-950">
      {/* ── Fondo: gradientes decorativos ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        {/* Glow superior-izquierdo */}
        <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-emerald-600/10 blur-[120px]" />
        {/* Glow inferior-derecho */}
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-emerald-500/8 blur-[100px]" />
        {/* Grid sutil */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* ── Panel izquierdo — Hero (solo visible en md+) ── */}
      <div className="relative z-10 hidden md:flex md:w-1/2 lg:w-3/5 flex-col justify-between p-12 lg:p-16">
        {/* Logotipo / Marca */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/25">
            <svg
              width="18"
              height="18"
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
          <span className="text-sm font-semibold tracking-wide text-zinc-300">
            RelApp
          </span>
        </div>

        {/* Mensaje central */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            Sistema en producción
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
            Plataforma de
            <br />
            <span className="text-emerald-400">Relevamientos</span>
            <br />
            Sociales
          </h1>
          <p className="max-w-sm text-base text-zinc-400 leading-relaxed">
            Gestión integral de adultos mayores, relevamientos y seguimiento
            de casos para equipos de trabajo social.
          </p>

          {/* Stats decorativos */}
          <div className="flex items-center gap-8 pt-2">
            {[
              { value: '5', label: 'Módulos activos' },
              { value: '3', label: 'Roles de acceso' },
              { value: '100%', label: 'Auditable' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-0.5">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer del panel hero */}
        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} RelApp · Todos los derechos reservados
        </p>
      </div>

      {/* ── Divisor vertical (solo md+) ── */}
      <div
        aria-hidden="true"
        className="relative z-10 hidden md:block w-px self-stretch my-16 bg-gradient-to-b from-transparent via-zinc-800 to-transparent"
      />

      {/* ── Panel derecho — Formulario ── */}
      <div className="relative z-10 flex w-full md:w-1/2 lg:w-2/5 flex-col items-center justify-center px-6 py-12 sm:px-10">
        <LoginForm />
      </div>
    </main>
  );
}
