'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { getRiskColor, getMobilityColor } from '../utils/colors';

// Interfaces para los datos recibidos
interface ChartDataItem {
  name: string;
  value: number;
}

interface TimelineDataItem {
  month: string;
  total: number;
}

export interface DashboardChartsProps {
  riesgoData: ChartDataItem[];
  barriosData: ChartDataItem[];
  timelineData: TimelineDataItem[];
  movilidadData: ChartDataItem[];
}

export default function DashboardCharts({
  riesgoData = [],
  barriosData = [],
  timelineData = [],
  movilidadData = [],
}: DashboardChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Anti-Hydration Pattern: No renderizar charts hasta que el cliente esté montado
  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[380px] bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse flex items-center justify-center text-zinc-500"
          >
            Cargando gráfico...
          </div>
        ))}
      </div>
    );
  }

  // Estilo del Tooltip de Recharts adaptado al Dark Theme
  const customTooltipStyle = {
    contentStyle: {
      backgroundColor: '#18181b', // zinc-900
      borderColor: '#27272a',     // zinc-800
      borderRadius: '12px',
      color: '#f4f4f5',
    },
    itemStyle: {
      color: '#f4f4f5',
    },
    labelStyle: {
      color: '#a1a1aa', // zinc-400
      fontWeight: 'semibold',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-8"
    >
      {/* 1. Gráfico de Riesgo Social (Donut Chart) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-md">
        <div>
          <h3 className="text-base font-semibold text-zinc-200">Riesgo Social</h3>
          <p className="text-xs text-zinc-500 mt-1">Distribución consolidada según nivel de riesgo</p>
        </div>
        <div className="h-[260px] w-full mt-4 flex items-center justify-center">
          {riesgoData.length === 0 || riesgoData.every((d) => d.value === 0) ? (
            <span className="text-sm text-zinc-500">Sin datos de riesgo social</span>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riesgoData ?? []}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(riesgoData ?? []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip {...customTooltipStyle} />
                <Legend 
                  iconType="circle" 
                  formatter={(value) => <span className="text-xs text-zinc-300 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Distribución Territorial (Bar Chart Horizontal) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-md">
        <div>
          <h3 className="text-base font-semibold text-zinc-200">Distribución Territorial (Top 10)</h3>
          <p className="text-xs text-zinc-500 mt-1">Cantidad de adultos mayores registrados por barrio</p>
        </div>
        <div className="h-[260px] w-full mt-4">
          {barriosData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <span className="text-sm text-zinc-500">Sin datos territoriales</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barriosData ?? []}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={11} width={80} tickLine={false} />
                <Tooltip {...customTooltipStyle} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Participantes">
                  {(barriosData ?? []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`rgba(16, 185, 129, ${1 - index * 0.07})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Evolución de Relevamientos (Line Chart) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-md">
        <div>
          <h3 className="text-base font-semibold text-zinc-200">Histórico de Relevamientos</h3>
          <p className="text-xs text-zinc-500 mt-1">Evolución mensual del registro socio-sanitario</p>
        </div>
        <div className="h-[260px] w-full mt-4">
          {timelineData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <span className="text-sm text-zinc-500">Sin datos de evolución temporal</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData ?? []} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip {...customTooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  name="Relevamientos"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Movilidad y Autonomía (Donut Chart) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-md">
        <div>
          <h3 className="text-base font-semibold text-zinc-200">Movilidad y Autonomía</h3>
          <p className="text-xs text-zinc-500 mt-1">Nivel de dependencia física registrado</p>
        </div>
        <div className="h-[260px] w-full mt-4 flex items-center justify-center">
          {movilidadData.length === 0 || movilidadData.every((d) => d.value === 0) ? (
            <span className="text-sm text-zinc-500">Sin datos de movilidad</span>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={movilidadData ?? []}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(movilidadData ?? []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getMobilityColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip {...customTooltipStyle} />
                <Legend 
                  iconType="circle" 
                  formatter={(value) => <span className="text-xs text-zinc-300 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  );
}
