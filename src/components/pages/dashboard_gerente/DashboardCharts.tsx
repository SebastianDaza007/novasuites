"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card } from "primereact/card";

interface DashboardChartsProps {
  data: {
    rango?: { desde: string; hasta: string };
    financieros?: {
      balance?: { mes: string; ingresos: number; egresos: number }[];
    };
    operativos?: {
      ocupacionMensual?: { mes: string; porcentaje: number }[];
    };
    clientes?: {
      estadoReservas?: { estado: string; _count: { _all: number } }[];
    };
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

export default function DashboardCharts({ data }: DashboardChartsProps) {
  // =============================================
  // 🗓️ Construcción dinámica de los meses según rango
  // =============================================
  const rango = data?.rango;
  const mesesRango = useMemo(() => {
    if (!rango?.desde || !rango?.hasta) return [];

    const desde = new Date(rango.desde);
    const hasta = new Date(rango.hasta);
    const meses: string[] = [];

    const fechaTemp = new Date(desde);
    while (fechaTemp <= hasta) {
      const mes = MONTHS[fechaTemp.getMonth()];
      if (!meses.includes(mes)) meses.push(mes);
      fechaTemp.setMonth(fechaTemp.getMonth() + 1);
    }

    return meses;
  }, [rango]);

  // =============================================
  // 💰 Ingresos vs Egresos según rango
  // =============================================
  const balanceRaw = data?.financieros?.balance ?? [];
  const balance = useMemo(() => {
    return mesesRango.map((mes) => {
      const item = balanceRaw.find((b) => b.mes === mes);
      return {
        mes,
        ingresos: item ? item.ingresos : 0,
        egresos: item ? item.egresos : 0,
      };
    });
  }, [balanceRaw, mesesRango]);

  // =============================================
  // 🏨 Ocupación mensual según rango
  // =============================================
  const ocupacionMensualRaw = data?.operativos?.ocupacionMensual ?? [];
  const ocupacionMensual = useMemo(() => {
    return mesesRango.map((mes) => {
      const encontrado = ocupacionMensualRaw.find((o) => o.mes === mes);
      return { mes, porcentaje: encontrado ? encontrado.porcentaje : 0 };
    });
  }, [ocupacionMensualRaw, mesesRango]);

  // =============================================
  // 📊 Estado de reservas (Pie)
  // =============================================
  const estadoReservas = data?.clientes?.estadoReservas ?? [];
  const reservasData = estadoReservas.map((r) => ({
    name: r.estado,
    value: r._count._all,
  }));

  // =============================================
  // 🎨 Render
  // =============================================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* 💰 Ingresos vs Egresos */}
      <Card className="shadow-2 border-round-2xl">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Ingresos vs Egresos Mensuales
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={balance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ingresos" stroke="#00C49F" name="Ingresos" />
            <Line type="monotone" dataKey="egresos" stroke="#FF8042" name="Egresos" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 🏨 Ocupación mensual */}
      <Card className="shadow-2 border-round-2xl">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Ocupación Mensual (%)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ocupacionMensual}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="porcentaje" fill="#0088FE" name="Ocupación" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 🧍 Estado de reservas */}
      <Card className="shadow-2 border-round-2xl lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Estado de Reservas
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
