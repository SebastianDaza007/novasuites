"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card } from "primereact/card";

interface DashboardChartsProps {
  data: {
    ordenesPorProveedor: { proveedor: string; cantidad: number }[];
    pagosMensuales: { mes: string; pagado: number; pendiente: number }[];
  };
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* 🏢 Órdenes por proveedor */}
      <Card className="shadow-2 border-round-2xl">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Órdenes de compra por proveedor
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.ordenesPorProveedor}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="proveedor" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="cantidad" fill="#0088FE" name="Órdenes" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 💰 Pagos mensuales */}
      <Card className="shadow-2 border-round-2xl">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Pagos mensuales
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.pagosMensuales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pagado" fill="#00C49F" name="Pagado" />
            <Bar dataKey="pendiente" fill="#FF8042" name="Pendiente" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
