"use client";

import React from "react";
import { Card } from "primereact/card";
import { ProgressBar } from "primereact/progressbar";
import { Tag } from "primereact/tag";

interface DashboardCardsProps {
  data: any;
}

export default function DashboardCards({ data }: DashboardCardsProps) {
  // 🩵 Seguridad: si no hay datos, no renderiza nada
//   console.log("🧠 Data completa en DashboardCards:", data);

  if (!data || !data.clientes) {
    console.warn("⚠️ No se encontraron datos de clientes:", data);
    return null;
  }

  // 🔹 Operativos
  const ocupadas = Number(data?.operativos?.ocupacion?.OCUPADA ?? 0);
  const disponibles = Number(data?.operativos?.ocupacion?.DISPONIBLE ?? 0);
  const total = ocupadas + disponibles;
  const porcentaje = total > 0 ? Math.round((ocupadas / total) * 100) : 0;

  // 🔹 Financieros
  const pendientes = Number(data?.financieros?.facturasProveedor?.PENDIENTE ?? 0);
  const pagadas = Number(data?.financieros?.facturasProveedor?.PAGADA ?? 0);

  // 🔹 Clientes
  const promedioEstadia = Number(data?.clientes?.promedioEstadia || 0);

  const reservasActivas =
    data?.clientes?.estadoReservas?.find(
      (r: any) => r.estado?.toUpperCase() === "CHECKIN"
    )?._count?._all || 0;

  // 🔍 Depuración opcional
  console.log("📊 Promedio:", promedioEstadia);
  console.log("🧾 Estado Reservas:", data.clientes.estadoReservas);
  console.log("✅ Reservas activas:", reservasActivas);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 🏨 Ocupación actual */}
      <Card className="shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Ocupación actual</h3>
        <ProgressBar value={porcentaje} showValue />
        <p className="mt-2 text-sm text-gray-500">
          {ocupadas} ocupadas / {total} totales
        </p>
      </Card>

      {/* 💸 Facturas Proveedor */}
      <Card className="shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Facturas Proveedor</h3>
        <div className="flex justify-center gap-2 flex-wrap">
          <Tag severity="warning" value={`Pendientes: ${pendientes}`} />
          <Tag severity="success" value={`Pagadas: ${pagadas}`} />
        </div>
      </Card>

      {/* 🧭 Promedio de estadía */}
      <Card className="shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Promedio de estadía</h3>
        <p className="text-3xl font-bold text-blue-600">
          {promedioEstadia > 0 ? `${promedioEstadia} días` : "—"}
        </p>
      </Card>

      {/* 🧍 Reservas activas */}
      <Card className="shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Reservas activas</h3>
        <p className="text-3xl font-bold text-green-600">
          {reservasActivas > 0 ? reservasActivas : "—"}
        </p>
      </Card>
    </div>
  );
}
