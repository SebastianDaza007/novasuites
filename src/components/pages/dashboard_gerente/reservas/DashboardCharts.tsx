"use client";

import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Card } from "primereact/card";

interface DashboardChartsProps {
  data: {
    ocupacionMensual: { mes: string; porcentaje: number }[];
    reservasPorCategoria: { tipo: string; cantidad: number }[];
    canceladasPorMes: { mes: string; cantidad: number }[];
    rankingMetodos: { mes: string; metodo: string; cantidad: number }[];
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#FF5252"];

export default function DashboardCharts({ data }: DashboardChartsProps) {
  // ==========================
  // 📊 Dataset de gráficos
  // ==========================
  const tipoData = data.reservasPorCategoria.map((t) => ({
    name: t.tipo,
    value: t.cantidad,
  }));

  const canceladasData = data.canceladasPorMes;
  const ocupacionData = data.ocupacionMensual;

  // ==========================
  // 💳 Reestructurar y ordenar ranking mensual
  // ==========================
  const metodosAgrupados = data.rankingMetodos.reduce((acc: any, item) => {
    const mes = item.mes;
    if (!acc[mes]) acc[mes] = { mes };
    acc[mes][item.metodo] = item.cantidad;
    return acc;
  }, {});

  const monthOrder: Record<string, number> = {
    ENE: 1, FEB: 2, MAR: 3, ABR: 4, MAY: 5, JUN: 6,
    JUL: 7, AGO: 8, SEPT: 9, OCT: 10, NOV: 11, DIC: 12,
  };

  const metodosData = Object.values(metodosAgrupados).sort((a: any, b: any) => {
    const [mesA, anioA] = a.mes.split("-");
    const [mesB, anioB] = b.mes.split("-");
    return (
      parseInt(anioA) - parseInt(anioB) ||
      (monthOrder[mesA] || 0) - (monthOrder[mesB] || 0)
    );
  });

  // Detectar dinámicamente los nombres de métodos (por si cambian)
  const metodosUnicos = Array.from(
    new Set(data.rankingMetodos.map((m) => m.metodo))
  );

  const coloresMetodos: Record<string, string> = {
    Tarjeta: "#A020F0",
    Efectivo: "#00C49F",
    Transferencia: "#FFBB28",
  };

  // ==========================
  // 🎨 Render
  // ==========================
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Ocupación mensual */}
      {/*<Card className="shadow-2 border-round-2xl">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Tasa de ocupación mensual (%)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ocupacionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="porcentaje" stroke="#00C49F" />
          </LineChart>
        </ResponsiveContainer>
      </Card>8*/}

      {/* Reservas por tipo de habitación */}
      <Card className="shadow-2 border-round-2xl">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Reservas por tipo de habitación
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={tipoData} dataKey="value" nameKey="name" outerRadius={100} label>
              {tipoData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Reservas canceladas por mes */}
      <Card className="shadow-2 border-round-2xl">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Reservas canceladas por mes
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={canceladasData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#FF5252" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
    

      {/* Ranking de métodos de pago por mes */}
      <Card className="shadow-2 border-round-2xl wl-full">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Ranking de métodos de pago por mes
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={metodosData} barGap={4} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />

            {metodosUnicos.map((metodo, idx) => (
              <Bar
                key={metodo}
                dataKey={metodo}
                fill={coloresMetodos[metodo] || COLORS[idx % COLORS.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
