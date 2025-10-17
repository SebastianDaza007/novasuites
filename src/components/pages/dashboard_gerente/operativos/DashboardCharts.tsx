"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card } from "primereact/card";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface DashboardChartsProps {
  data: {
    ocupacionMensual: { mes: string; porcentaje: number }[];
    estadoReservas: { estado: string; _count: { _all: number } }[];
  };
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  const reservasData = data.estadoReservas.map((r) => ({
    name: r.estado,
    value: r._count._all,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* 📊 Ocupación mensual */}
      <Card className="shadow-2 border-round-2xl">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Ocupación mensual (%)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.ocupacionMensual}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="porcentaje" fill="#0088FE" name="Ocupación" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 🧩 Estado de reservas */}
      <Card className="shadow-2 border-round-2xl">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Estado de reservas
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={reservasData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {reservasData.map((_, i) => (
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
