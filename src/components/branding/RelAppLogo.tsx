/**
 * RelAppLogo — Identidad visual de RelApp.
 *
 * Concepto: Símbolo Universal de Accesibilidad evolucionado.
 * Figura humana estilizada dentro de un círculo estructural zinc,
 * con el símbolo de accesibilidad en gradiente emerald → teal → cyan.
 *
 * Variants:
 *   - iconOnly   → Solo el ícono SVG. Ideal para favicon y avatars.
 *   - horizontal → Ícono + wordmark "RelApp" en fila. Ideal para navbar.
 *   - hero       → Ícono grande + wordmark + subtítulo apilados. Ideal para login.
 *
 * Escalabilidad: funciona desde 24px hasta 256px sin pérdida de calidad.
 *
 * Accesibilidad:
 *   - El SVG tiene aria-hidden="true" porque el texto contenedor tiene
 *     el aria-label apropiado.
 *   - Los variantes hero y horizontal llevan role="img" con aria-label.
 *
 * @example
 *   <RelAppLogo variant="hero" size={64} />
 *   <RelAppLogo variant="horizontal" size={32} />
 *   <RelAppLogo variant="iconOnly" size={24} />
 */

type LogoVariant = 'iconOnly' | 'horizontal' | 'hero';

interface RelAppLogoProps {
  /**
   * Controla qué versión del logo se renderiza.
   * @default 'iconOnly'
   */
  variant?: LogoVariant;
  /**
   * Tamaño base del ícono SVG en píxeles.
   * El texto de las variantes horizontal y hero escala proporcionalmente.
   * @default 40
   */
  size?: number;
  /**
   * ID base para los gradientes SVG internos.
   * Si hay múltiples instancias en la misma página, pasar IDs distintos.
   * @default 'relapp'
   */
  id?: string;
  className?: string;
}

/**
 * Mark SVG — el ícono puro de RelApp.
 *
 * Estructura visual (viewBox 0 0 48 48):
 *
 *        ●        ← cabeza (circle relleno, gradiente)
 *       /↑\
 *   ●─── │ ───●  ← brazos en arco curvado (gradiente)
 *       /│\
 *      ● │ ●    ← piernas en V con nodos sólidos (gradiente)
 *
 * El círculo exterior usa zinc-700 con 80% de opacidad,
 * calado alrededor de los nodos con máscara SVG.
 */
function LogoMark({ size, id }: { size: number; id: string }) {
  const gradMain = `${id}-grad-main`;
  const maskId = `${id}-circle-mask`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Gradiente principal evolucionado: emerald → teal → cyan */}
        <linearGradient
          id={gradMain}
          x1="4"
          y1="4"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#34d399" />   {/* emerald-400 */}
          <stop offset="50%" stopColor="#2dd4bf" />  {/* teal-400 */}
          <stop offset="100%" stopColor="#22d3ee" /> {/* cyan-400 */}
        </linearGradient>

        {/* Máscara para recortar el círculo exterior alrededor de los nodos */}
        <mask id={maskId}>
          {/* Blanco: deja pasar el contenido */}
          <rect x="0" y="0" width="48" height="48" fill="#ffffff" />
          {/* Negros: cortan el círculo en las zonas de los nodos */}
          <circle cx="4.5" cy="22.5" r="4.8" fill="#000000" />  {/* Mano izquierda */}
          <circle cx="43.5" cy="22.5" r="4.8" fill="#000000" /> {/* Mano derecha */}
          <circle cx="12.5" cy="39.5" r="4.8" fill="#000000" /> {/* Pie izquierdo */}
          <circle cx="35.5" cy="39.5" r="4.8" fill="#000000" /> {/* Pie derecho */}
        </mask>
      </defs>

      {/* Círculo exterior refinado — zinc-700 al 80% de opacidad */}
      <circle
        cx="24"
        cy="24"
        r="19.5"
        stroke="#3f3f46"
        strokeWidth="2.2"
        strokeOpacity="0.8"
        mask={`url(#${maskId})`}
      />

      {/* Brazos (arco curvado hacia abajo) */}
      <path
        d="M 4.5,22.5 Q 24,28.5 43.5,22.5"
        stroke={`url(#${gradMain})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Pierna izquierda */}
      <line
        x1="24"
        y1="28.5"
        x2="12.5"
        y2="39.5"
        stroke={`url(#${gradMain})`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Pierna derecha */}
      <line
        x1="24"
        y1="28.5"
        x2="35.5"
        y2="39.5"
        stroke={`url(#${gradMain})`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Cabeza */}
      <circle cx="24" cy="14.5" r="4.5" fill={`url(#${gradMain})`} />

      {/* Nodos de extremidades (círculos sólidos) */}
      <circle cx="4.5" cy="22.5" r="3" fill={`url(#${gradMain})`} />
      <circle cx="43.5" cy="22.5" r="3" fill={`url(#${gradMain})`} />
      <circle cx="12.5" cy="39.5" r="3" fill={`url(#${gradMain})`} />
      <circle cx="35.5" cy="39.5" r="3" fill={`url(#${gradMain})`} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Componente principal exportado
// ─────────────────────────────────────────────────────────────

export default function RelAppLogo({
  variant = 'iconOnly',
  size = 40,
  id = 'relapp',
  className = '',
}: RelAppLogoProps) {
  // Tamaño del texto del wordmark escalado proporcionalmente al ícono.
  const wordmarkSize = Math.round(size * 0.45);

  // ── Variante: solo el ícono ─────────────────────────────
  if (variant === 'iconOnly') {
    return (
      <span
        role="img"
        aria-label="RelApp"
        className={`inline-flex ${className}`}
      >
        <LogoMark size={size} id={id} />
      </span>
    );
  }

  // ── Variante: horizontal (ícono + wordmark en fila) ─────
  if (variant === 'horizontal') {
    return (
      <span
        role="img"
        aria-label="RelApp"
        className={`inline-flex items-center gap-2.5 ${className}`}
      >
        <LogoMark size={size} id={id} />
        <span
          className="font-bold tracking-tight text-white select-none"
          style={{ fontSize: `${wordmarkSize}px`, lineHeight: 1 }}
        >
          Rel
          <span className="text-emerald-400">App</span>
        </span>
      </span>
    );
  }

  // ── Variante: hero (ícono grande + wordmark + subtítulo) ─
  return (
    <div
      role="img"
      aria-label="RelApp — Plataforma de Relevamientos Sociales"
      className={`flex flex-col items-center gap-4 ${className}`}
    >
      <LogoMark size={size} id={id} />
      <div className="space-y-1.5 text-center">
        <p
          className="font-bold tracking-tight text-white select-none"
          style={{ fontSize: `${Math.max(wordmarkSize, 28)}px`, lineHeight: 1 }}
        >
          Rel
          <span className="text-emerald-400">App</span>
        </p>
        <p className="text-sm font-normal text-zinc-400">
          Plataforma de Relevamientos Sociales
        </p>
      </div>
    </div>
  );
}
