"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card } from "primereact/card";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface DashboardChartsProps {
  data: {
    ingresosMensuales: { mes: string; monto: number }[];
    egresosMensuales: { mes: string; monto: number }[];
    balance: { mes: string; balance: number }[];
    facturasProveedorPorEstado: Record<string, number>;
    rankingMetodos: { metodo: string; cantidad: number }[];
  };
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  const facturasData = Object.entries(data.facturasProveedorPorEstado).map(
    ([estado, cantidad]) => ({
      name: estado,
      value: cantidad,
    })
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* 📈 Ingresos y egresos mensuales */}
      <Card className="shadow-2 border-round-2xl">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Ingresos vs Egresos
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data.balance}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="ingresos"
              stroke="#00C49F"
              name="Ingresos"
            />
            <Line
              type="monotone"
              dataKey="egresos"
              stroke="#FF8042"
              name="Egresos"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 🧾 Estado de facturas proveedor */}
      <Card className="shadow-2 border-round-2xl">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Estado de facturas proveedor
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={facturasData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {facturasData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
