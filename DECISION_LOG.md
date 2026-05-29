# Registro de Decisiones (Decision Log) - RelApp

Este archivo registra todas las decisiones técnicas y de arquitectura importantes tomadas durante el desarrollo de **RelApp**, de acuerdo con la Regla Obligatoria N° 8 del Contexto Maestro.

---

## [2026-05-22] Inicialización del Proyecto (Bootstrap)

* **Fecha**: 2026-05-22
* **Módulo**: General / Infraestructura
* **Decisión**: Crear la estructura inicial del proyecto utilizando Next.js (con App Router), TypeScript y TailwindCSS en la ruta `C:\Users\diazn\.gemini\antigravity\scratch\relapp`.
* **Motivo**: Establecer el entorno de desarrollo básico requerido para el MVP según el stack oficial acordado.
* **Alternativas**:
  * *React SPA Puro (Vite) + Backend separado*: Descartado por requerir el mantenimiento de dos repositorios/despliegues distintos y no estar alineado al stack oficial ("Next.js Fullstack").
* **Impacto**: Centralización de la lógica frontend y backend en un único repositorio Next.js, facilitando la modularidad y el despliegue simplificado en Vercel.
* **Riesgos**:
  * Necesidad de configurar cuidadosamente la estructura de carpetas modular (`src/modules`) dentro del App Router para evitar conflictos de rutas.
* **Ajustes de Aprobación**:
  * `src/services/` y `src/server/` se crean vacíos sin lógica de negocio en la Épica 0.
  * No se integra ningún ORM (Prisma/Drizzle) ni SDK de base de datos (Supabase) en esta fase.
  * Se crean `src/lib/constants/` y `src/types/shared/` para definiciones globales.
* **Aprobado por**: Humano y Arquitecto (ChatGPT) - Aprobación del 2026-05-22.

---

## [2026-05-22] Autenticación, ORM y Estrategia de Persistencia (Épica 1)

* **Fecha**: 2026-05-22
* **Módulo**: auth / Persistencia
* **Decisión**: 
  * Seleccionar **Drizzle ORM** oficialmente como el ORM del proyecto por su ligereza y control de SQL tipeado.
  * Usar un **Mock Database Service** inicialmente para desacoplar el desarrollo de la autenticación de la base de datos real.
  * Implementar autenticación simple basada en sesiones **JWT firmadas con `jose` y guardadas en Cookies HTTP-only** (`sameSite: 'lax'`, `secure` dinámico).
  * Crear un **Middleware de Next.js simple** para verificar sesiones y autorizar accesos básicos por roles.
  * El payload del JWT se limita estrictamente a: `id`, `role` y `email`.
* **Motivo**: Priorizar simplicidad, velocidad de feedback y control arquitectónico para el MVP, minimizando la superficie sensible de datos en JWT.
* **Alternativas**:
  * *Prisma ORM*: Descartado por agregar mayor abstracción y peso.
  * *NextAuth / Auth.js*: Descartado por ser demasiado complejo y añadir proveedores innecesarios en esta etapa de bootstrap de MVP.
* **Impacto**: Aislamiento total del sistema de autenticación de la base de datos física mediante una interfaz de servicio de usuario. Seguridad XSS/CSRF mitigada desde el inicio.
* **Riesgos**:
  * La actualización a Drizzle ORM real requerirá implementar las consultas reales contra PostgreSQL, pero la interfaz del servicio mitigará este cambio.
* **Aprobado por**: Humano y Arquitecto (ChatGPT) - Aprobación del 2026-05-22.

---

## [2026-05-22] Persistencia Física e Infraestructura Base Drizzle ORM (Épica 1.5)

* **Fecha**: 2026-05-22
* **Módulo**: Persistencia / Base de Datos
* **Decisión**: 
  * Configurar y conectar PostgreSQL físico mediante un **Pool de conexiones simple (`pg`)** y **Drizzle ORM**.
  * Crear el esquema `users` utilizando **UUIDs nativos generados con `gen_random_uuid()` (extensión `pgcrypto`)** y un **PostgreSQL Enum estricto** (`user_role`).
  * Estructurar el almacenamiento en snake_case para la base de datos y camelCase para TypeScript para mantener la consistencia del ecosistema.
  * Reemplazar la persistencia mockeada en memoria del módulo `auth` con llamadas asíncronas reales de Drizzle sobre PostgreSQL, **manteniendo exactamente la misma interfaz pública e inmunizando el módulo frente a regresiones**.
  * Implementar un script de **Seed idempotente** (`onConflictDoNothing`) para poblar usuarios de prueba sin duplicar registros.
* **Motivo**: Establecer una base de persistencia física sólida, simplificada y altamente tipada para RelApp sin introducir capas de abstracción innecesarias (como Repositorios Enterprise).
* **Alternativas**:
  * *Factories o Managers complejos de conexiones*: Descartado por sobreingeniería. Un Pool simple de `pg` y la instancia directa de `drizzle(pool)` es lo ideal y óptimo para Server Components y entornos serverless.
  * *Estrategias de ID incrementales o Varchar libre para Roles*: Descartado para garantizar consistencia fuerte, evitar roles erróneos y alinearse a prácticas de seguridad.
* **Impacto**: Transición limpia del MVP a persistencia real. Las Server Actions y el ruteo del proxy se mantuvieron al 100% intactos gracias al desacople.
* **Riesgos**:
---

## [2026-05-22] Gestión de Adultos Mayores - Núcleo de Negocio y Privacidad (Épica 2)

* **Fecha**: 2026-05-22
* **Módulo**: Adultos Mayores / Dominio Central
* **Decisión**:
  * Diseñar e implementar el esquema de persistencia `adultos_mayores` utilizando un Enum estricto para estados (`ACTIVO`, `PENDIENTE`, `INACTIVO`, `FALLECIDO`), UUID autogenerado con `defaultRandom()`, clave única e indexada sobre `dni`, e índices optimizados sobre `apellido` y `estado` para agilizar las búsquedas.
  * **Estrategia de Soft Delete**: Prohibir por completo el borrado físico de registros de participantes, implementando eliminación lógica a través de la columna `deletedAt` (nullable timestamp). Las consultas del listado filtran automáticamente excluyendo registros con `deletedAt IS NOT NULL`.
  * **Restricción de Privacidad y Logs**: Sanitizar el campo `observaciones` (removiendo tags de HTML y limitando a 1000 caracteres). Prohibir estrictamente el logueo de datos sensibles en consola (DNI, observaciones y direcciones completas) en caso de errores en la persistencia.
  * **Autorización Estricta de Acciones**: Permitir la creación y edición a todos los roles activos (`ADMIN`, `SUPERVISOR`, `SOCIAL_WORKER`), pero restringir la acción de baja de registros (`softDeleteAdultoMayor`) de forma exclusiva para `ADMIN` y `SUPERVISOR`.
  * **Formularios sin Librerías Externas**: Utilizar estados puros de React, Server Actions y validación tipada con Zod (impidiendo dependencias adicionales como React Hook Form o Formik).
  * **Búsqueda Simple Server-Side**: Adoptar búsqueda basada en formularios nativos que actualizan parámetros de la URL (`/modules/adultos-mayores?q=juan`) y consultan al servidor directamente en lugar de filtros reactivos de tiempo real.
  * **Helper Centralizado de Badges**: Crear el helper `getEstadoBadge` para abstraer los colores e identificadores visuales del estado del participante del JSX, evitando repetición de código CSS.
* **Motivo**: Preservar la integridad de los datos sociales históricos y la privacidad de los participantes, manteniendo al mismo tiempo un diseño liviano de formularios y flujos de servidor consistentes con el stack del MVP.
* **Alternativas**:
  * *Borrado Físico (Hard Delete)*: Rechazado rotundamente debido a que destruye la trazabilidad histórica de relevamientos sociales futuros.
  * *Búsqueda Reactiva en Tiempo Real (Client-Side)*: Rechazado para prevenir renders redundantes, sobrecarga de peticiones de base de datos tempranas y simplificar la experiencia de usuario (UX).
  * *Uso de React Hook Form / Formik*: Rechazado para evitar introducir bibliotecas de terceros innecesarias, aprovechando la potencia nativa de Next.js Server Actions y Zod.
* **Impacto**: Un módulo nuclear robusto, seguro, con control de acceso por roles preciso y listo para interactuar con futuros módulos de relevamientos sociales sin acoplamiento y libre de deuda técnica.
* **Aprobado por**: Humano y Arquitecto (Antigravity AI) - Aprobación del 2026-05-22.

---

## [2026-05-24] Módulo de Relevamientos - Épica 3

* **Fecha**: 2026-05-24
* **Módulo**: relevamientos / Dominio Social
* **Decisión**:
  * **Modelo de Relevamientos**: Permitir múltiples relevamientos independientes por adulto mayor a lo largo del tiempo para registrar su evolución socio-sanitaria (historial temporal). No sobrescribir registros históricos.
  * **Estructura del Cuestionario**: Definir columnas explícitas tipadas en PostgreSQL (no usar JSONB) agrupadas en:
    * *Área Habitacional*: tipoVivienda (varchar), tieneAgua (boolean), tieneLuz (boolean), tieneGas (boolean), hacinamiento (boolean).
    * *Área Salud y Autonomía*: enfermedadesCronicas (text), nivelMovilidad (varchar), tomaMedicamentos (boolean).
    * *Área Socioeconómica*: ingresos (numeric), obraSocial (varchar o boolean), redApoyo (varchar).
    * *Campo Adicional*: riesgoSocial (enum: 'BAJO', 'MEDIO', 'ALTO', 'CRITICO') seleccionado manualmente por el encuestador sin motor de scoring automático.
  * **Política de Edición y Estados**:
    * Introducir el estado del relevamiento (enum: 'BORRADOR', 'FINALIZADO').
    * `SOCIAL_WORKER`: puede crear y leer. Puede editar relevamientos solo mientras estén en 'BORRADOR'. No puede eliminar.
    * `SUPERVISOR`: puede leer, crear y editar relevamientos (incluyendo corregir finalizados). No puede eliminar físicamente.
    * `ADMIN`: control total (incluyendo soft delete de registros mediante `deletedAt`).
  * **Seguridad y Privacidad**: Sanitizar `observacionesGeneral` (quitar tags HTML, límite de caracteres). Queda terminantemente prohibido loguear en consola o enviar a servicios externos datos sensibles (enfermedades, ingresos, observaciones, direcciones).
  * **Interfaz de Usuario y UX**: Diseñar un formulario largo simple (no wizard de múltiples pasos), limpio, responsive y mobile-first, priorizando funcionalidad sobre estética/animaciones complejas.
  * **Integración**: Mostrar historial de relevamientos en la ficha de detalle de adultos mayores (`/modules/adultos-mayores/[id]`) con un botón para iniciar relevamiento redirigiendo a `/modules/relevamientos/nuevo?adultoMayorId={id}`.
  * **Restricciones Técnicas**: Utilizar estados puros de React, Server Actions y Zod para formularios, sin la inclusión de bibliotecas adicionales de terceros.
* **Motivo**: Garantizar el tipado estricto en Drizzle, simplificar las consultas estadísticas futuras, asegurar un registro histórico inmutable de la situación social de los participantes y mantener consistencia con los estándares de seguridad y desarrollo del MVP.
* **Alternativas**:
  * *Uso de JSONB para campos variables*: Rechazado para evitar pérdidas de tipado estricto, simplificar reportes SQL y asegurar la coherencia de datos.
  * *Formulario Wizard complejo con animaciones*: Rechazado para priorizar la entrega rápida y funcionalidad mobile-first del MVP.
* **Impacto**: Estructuración limpia de encuestas sociales asociadas a participantes individuales, con restricciones estrictas de edición por rol y total seguridad en la información de salud/ingresos.
* **Aprobado por**: Humano y Arquitecto (Antigravity AI) - Aprobación del 2026-05-24.

## [2026-05-28] Dashboard Institucional y Estadísticas Visuales (Épica 4)

* **Fecha**: 2026-05-28
* **Módulo**: dashboard / Analytics Institucional
* **Decisión**:

  * Implementar un Dashboard institucional server-side utilizando Next.js App Router, Drizzle ORM y Recharts para visualizar métricas operativas y sociales en tiempo real.
  * Centralizar toda la lógica de agregación estadística en un servicio dedicado (`dashboard-service.ts`) utilizando consultas SQL optimizadas mediante Drizzle ORM (`GROUP BY`, `COUNT`, `Promise.all`) y exclusión automática de registros con Soft Delete (`deletedAt IS NULL`).
  * Incorporar visualizaciones gráficas interactivas utilizando Recharts:

    * Riesgo Social → PieChart/Donut.
    * Distribución Territorial → BarChart horizontal.
    * Evolución de Relevamientos → LineChart.
    * Movilidad y Autonomía → PieChart.
  * Mantener el Dashboard principal como Server Component para:

    * validar sesión mediante JWT;
    * recuperar métricas en paralelo;
    * reducir tiempo de carga inicial;
    * minimizar lógica client-side sensible.
  * Implementar un componente cliente aislado (`DashboardCharts.tsx`) exclusivamente para los gráficos interactivos, encapsulando la lógica visual y evitando incompatibilidades SSR.
  * Adoptar un patrón anti-hidratación (`isMounted`) para prevenir errores de renderizado entre servidor y cliente producidos por Recharts en entornos SSR.
  * Centralizar la paleta institucional de colores en helpers reutilizables (`colors.ts`) para evitar duplicación de estilos y garantizar consistencia visual.
  * Implementar tarjetas KPI reutilizables (`DashboardStatCard.tsx`) con variantes visuales semánticas (`success`, `warning`, `danger`, `info`) desacopladas de la lógica de negocio.
  * Limitar el listado territorial a los 10 barrios con mayor cantidad de adultos mayores para optimizar legibilidad y rendimiento visual.
  * Realizar el formateo temporal mensual (`YYYY-MM` → "Ene 2026") del lado de TypeScript en vez de depender de locales SQL del servidor PostgreSQL, evitando inconsistencias entre entornos locales, Supabase y producción.
  * Mantener toda la solución sin dependencias adicionales de manejo de estado global ni librerías complejas de visualización fuera de Recharts.
* **Motivo**:

  * Incorporar capacidades analíticas al MVP para permitir una visualización rápida del estado operativo y social del sistema.
  * Preparar la base para futuras métricas institucionales, auditoría y toma de decisiones basadas en datos.
  * Mantener compatibilidad total con Next.js 16, Server Components y despliegue serverless sobre Vercel.
* **Alternativas**:

  * *Charts renderizados completamente server-side*: Rechazado por incompatibilidades de hidratación y limitaciones de librerías gráficas SSR.
  * *Uso de Chart.js o D3.js*: Rechazado por requerir mayor configuración manual o complejidad innecesaria para el alcance del MVP.
  * *Dashboard completamente client-side*: Rechazado para evitar exponer lógica sensible de agregación y perder beneficios de Server Components.
  * *Consultas estadísticas realizadas directamente en componentes React*: Rechazado para preservar separación de responsabilidades y mantener servicios reutilizables.
* **Impacto**:

  * Introducción de capacidades analíticas visuales institucionales.
  * Mejora significativa en UX y percepción profesional del sistema.
  * Consolidación de una arquitectura híbrida SSR + Client Components moderna y alineada con Next.js App Router.
  * Preparación técnica para futuras métricas operativas y módulos de auditoría.
* **Riesgos**:

  * Recharts puede generar advertencias de dimensiones (`width(-1) height(-1)`) en layouts flexibles si los contenedores no poseen alturas mínimas explícitas.
  * Las consultas agregadas podrían requerir optimización adicional e índices dedicados conforme crezca el volumen de relevamientos.
  * El patrón `isMounted` evita errores de hidratación pero puede producir un pequeño retraso visual inicial en conexiones lentas.
* **Ajustes Posteriores**:

  * Migración de PostgreSQL local a Supabase PostgreSQL cloud para desacoplar la persistencia de la máquina local y permitir despliegue serverless completo en Vercel.
  * Eliminación de fallbacks inseguros de `DATABASE_URL` hardcodeadas en configuraciones de Drizzle.
  * Correcciones de compatibilidad con Zod v4 en validaciones heredadas de relevamientos.
* **Aprobado por**: Humano y Arquitecto (Antigravity AI) - Aprobación del 2026-05-28.
