import { db } from '@/server/db';
import { adultosMayores } from '@/server/db/schema/adultosMayores';
import { relevamientos } from '@/server/db/schema/relevamientos';
import { eq, and, isNull, sql, desc, or } from 'drizzle-orm';

export interface DashboardStats {
  totalAdultosMayores: number;
  totalActivos: number;
  totalRelevamientos: number;
  totalBorradores: number;
  totalFinalizados: number;
  totalRiesgoAlto: number;
}

export interface ChartDataItem {
  name: string;
  value: number;
}

export interface TimelineDataItem {
  month: string;
  total: number;
}

/**
 * Obtiene las métricas KPI consolidadas del Dashboard de forma optimizada y en paralelo.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [
      adultosRes,
      activosRes,
      relevamientosRes,
      borradoresRes,
      finalizadosRes,
      riesgoAltoRes
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(adultosMayores).where(isNull(adultosMayores.deletedAt)),
      db.select({ count: sql<number>`count(*)::int` }).from(adultosMayores).where(and(eq(adultosMayores.estado, 'ACTIVO'), isNull(adultosMayores.deletedAt))),
      db.select({ count: sql<number>`count(*)::int` }).from(relevamientos).where(isNull(relevamientos.deletedAt)),
      db.select({ count: sql<number>`count(*)::int` }).from(relevamientos).where(and(eq(relevamientos.estado, 'BORRADOR'), isNull(relevamientos.deletedAt))),
      db.select({ count: sql<number>`count(*)::int` }).from(relevamientos).where(and(eq(relevamientos.estado, 'FINALIZADO'), isNull(relevamientos.deletedAt))),
      db.select({ count: sql<number>`count(*)::int` }).from(relevamientos).where(
        and(
          or(eq(relevamientos.riesgoSocial, 'ALTO'), eq(relevamientos.riesgoSocial, 'CRITICO')),
          isNull(relevamientos.deletedAt)
        )
      ),
    ]);

    return {
      totalAdultosMayores: adultosRes[0]?.count ?? 0,
      totalActivos: activosRes[0]?.count ?? 0,
      totalRelevamientos: relevamientosRes[0]?.count ?? 0,
      totalBorradores: borradoresRes[0]?.count ?? 0,
      totalFinalizados: finalizadosRes[0]?.count ?? 0,
      totalRiesgoAlto: riesgoAltoRes[0]?.count ?? 0,
    };
  } catch {
    console.error('❌ Error al obtener estadísticas del dashboard [DETALLES SENSIBLES SANITIZADOS]');
    return {
      totalAdultosMayores: 0,
      totalActivos: 0,
      totalRelevamientos: 0,
      totalBorradores: 0,
      totalFinalizados: 0,
      totalRiesgoAlto: 0,
    };
  }
}

/**
 * Agrupa los relevamientos por nivel de riesgo social.
 */
export async function getRiesgoStats(): Promise<ChartDataItem[]> {
  try {
    const results = await db
      .select({
        name: relevamientos.riesgoSocial,
        value: sql<number>`count(*)::int`,
      })
      .from(relevamientos)
      .where(isNull(relevamientos.deletedAt))
      .groupBy(relevamientos.riesgoSocial);

    const order = ['BAJO', 'MEDIO', 'ALTO', 'CRITICO'];
    const countsMap = results.reduce((acc, row) => {
      acc[row.name] = row.value;
      return acc;
    }, {} as Record<string, number>);

    return order.map((name) => ({
      name,
      value: countsMap[name] ?? 0,
    }));
  } catch {
    console.error('❌ Error al obtener estadísticas de riesgo [DETALLES SENSIBLES SANITIZADOS]');
    return [];
  }
}

/**
 * Agrupa los adultos mayores por barrio, orden descendente y limitado al TOP 10.
 */
export async function getBarriosStats(): Promise<ChartDataItem[]> {
  try {
    const results = await db
      .select({
        name: adultosMayores.barrio,
        value: sql<number>`count(*)::int`,
      })
      .from(adultosMayores)
      .where(isNull(adultosMayores.deletedAt))
      .groupBy(adultosMayores.barrio)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    return results;
  } catch {
    console.error('❌ Error al obtener estadísticas de barrios [DETALLES SENSIBLES SANITIZADOS]');
    return [];
  }
}

/**
 * Agrupa los relevamientos por mes/año utilizando un mapeo manual para los nombres de mes.
 */
export async function getRelevamientosTimeline(): Promise<TimelineDataItem[]> {
  try {
    const results = await db
      .select({
        yearMonth: sql<string>`to_char(${relevamientos.createdAt}, 'YYYY-MM')`,
        total: sql<number>`count(*)::int`,
      })
      .from(relevamientos)
      .where(isNull(relevamientos.deletedAt))
      .groupBy(sql`to_char(${relevamientos.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${relevamientos.createdAt}, 'YYYY-MM')`);

    const MONTH_NAMES: Record<string, string> = {
      '01': 'Ene',
      '02': 'Feb',
      '03': 'Mar',
      '04': 'Abr',
      '05': 'May',
      '06': 'Jun',
      '07': 'Jul',
      '08': 'Ago',
      '09': 'Sep',
      '10': 'Oct',
      '11': 'Nov',
      '12': 'Dic',
    };

    return results.map((row) => {
      const [year, month] = row.yearMonth.split('-');
      const monthLabel = MONTH_NAMES[month] || month;
      return {
        month: `${monthLabel} ${year}`,
        total: row.total,
      };
    });
  } catch {
    console.error('❌ Error al obtener línea de tiempo [DETALLES SENSIBLES SANITIZADOS]');
    return [];
  }
}

/**
 * Agrupa la movilidad de los adultos mayores a partir de los relevamientos.
 */
export async function getMovilidadStats(): Promise<ChartDataItem[]> {
  try {
    const results = await db
      .select({
        name: relevamientos.nivelMovilidad,
        value: sql<number>`count(*)::int`,
      })
      .from(relevamientos)
      .where(isNull(relevamientos.deletedAt))
      .groupBy(relevamientos.nivelMovilidad);

    return results.map((row) => ({
      name: row.name || 'Sin especificar',
      value: row.value,
    }));
  } catch {
    console.error('❌ Error al obtener estadísticas de movilidad [DETALLES SENSIBLES SANITIZADOS]');
    return [];
  }
}
