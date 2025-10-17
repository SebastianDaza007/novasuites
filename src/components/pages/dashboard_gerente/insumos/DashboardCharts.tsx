"use client";

import React from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card } from "primereact/card";

interface DashboardChartsProps {
  data: {
    stockAgrupado: Record<string, number>;
    insumosPorTipo: { tipo: string; cantidad: number }[];
    comparativaStock: Record<string, { actual: number; anterior: number }>;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#9C27B0", "#FF5252"];

export default function DashboardCharts({ data }: DashboardChartsProps) {
  const stockData = Object.entries(data.stockAgrupado).map(([deposito, cantidad]) => ({
    deposito,
    cantidad,
  }));

  const tipoData = data.insumosPorTipo.map((t) => ({
    name: t.tipo,
    value: t.cantidad,
  }));

  const comparativaData = Object.entries(data.comparativaStock).map(([insumo, val]) => ({
    insumo,
    actual: val.actual,
    anterior: val.anterior,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* 📦 Stock por depósito */}
      <Card className="shadow-2 border-round-2xl">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Stock por depósito
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="deposito" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 🧩 Insumos por tipo */}
      <Card className="shadow-2 border-round-2xl">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Distribución por tipo de insumo
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

      {/* 📊 Comparativa stock actual vs anterior */}
      <Card className="shadow-2 border-round-2xl lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Comparativa de stock (Mes actual vs anterior)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparativaData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="insumo" hide />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="anterior" fill="#FFBB28" name="Mes anterior" />
            <Bar dataKey="actual" fill="#00C49F" name="Mes actual" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
