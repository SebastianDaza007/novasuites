"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/pages/dashboard_gerente/DashboardLayout";
import DashboardCards from "@/components/pages/dashboard_gerente/operativos/DashboardCards";
import DashboardCharts from "@/components/pages/dashboard_gerente/operativos/DashboardCharts";
import { ProgressSpinner } from "primereact/progressspinner";

interface OperativosData {
  rango: { desde: string; hasta: string };
  ocupacion: Record<string, number>;
  ocupacionMensual: { mes: string; porcentaje: number }[];
  housekeeping: Record<string, number>;
  estadoReservas: { estado: string; _count: { _all: number } }[];
}

export default function OperativosPage() {
  const [data, setData] = useState<OperativosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<[Date, Date] | null>(null);

  const fetchData = async (desde?: Date, hasta?: Date) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (desde) params.set("desde", desde.toISOString());
      if (hasta) params.set("hasta", hasta.toISOString());
      const res = await fetch(`/api/dashboard/operativos?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("❌ Error cargando datos operativos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hoy = new Date();
    const hace6Meses = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);
    const finDeMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    setRange([hace6Meses, finDeMes]);
    fetchData(hace6Meses, finDeMes);
  }, []);

  const aplicarFiltro = () => {
    if (range?.[0] && range?.[1]) fetchData(range[0], range[1]);
  };

  if (loading)
    return (
      <div className="flex justify-content-center align-items-center h-screen">
        <ProgressSpinner />
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-content-center align-items-center h-screen">
        <p className="text-gray-600 text-lg">No hay datos para mostrar.</p>
      </div>
    );

  return (
    <DashboardLayout range={range} setRange={setRange} onApply={aplicarFiltro}>
      <DashboardCards data={data} />
      <DashboardCharts data={data} />
    </DashboardLayout>
  );
}
