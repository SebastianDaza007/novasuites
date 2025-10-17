"use client";

import React from "react";
import { Card } from "primereact/card";
import { ProgressBar } from "primereact/progressbar";
import { Tag } from "primereact/tag";

interface DashboardCardsProps {
  data: {
    ocupacion: Record<string, number>;
    housekeeping: Record<string, number>;
    estadoReservas: { estado: string; _count: { _all: number } }[];
  };
}

export default function DashboardCards({ data }: DashboardCardsProps) {
  const ocupadas = Number(data.ocupacion.OCUPADA ?? 0);
  const disponibles = Number(data.ocupacion.DISPONIBLE ?? 0);
  const total = ocupadas + disponibles;
  const porcentaje = total ? Math.round((ocupadas / total) * 100) : 0;

  const housekeepingPend = data.housekeeping["PENDIENTE"] ?? 0;
  const housekeepingComp = data.housekeeping["COMPLETADO"] ?? 0;

  const reservasActivas =
    data.estadoReservas.find((r) => r.estado?.toUpperCase() === "CHECKIN")
      ?._count._all ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {/* 🏨 Ocupación actual */}
      <Card className="shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Ocupación actual
        </h3>
        <ProgressBar value={porcentaje} showValue />
        <p className="mt-2 text-sm text-gray-500">
          {ocupadas} ocupadas / {total} totales
        </p>
      </Card>

      {/* 🧹 Housekeeping */}
      <Card className="shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Housekeeping</h3>
        <div className="flex justify-center gap-2 flex-wrap">
          <Tag severity="warning" value={`Pendientes: ${housekeepingPend}`} />
          <Tag severity="success" value={`Completadas: ${housekeepingComp}`} />
        </div>
      </Card>

      {/* 🧍 Reservas activas */}
      <Card className="shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Reservas activas
        </h3>
        <p className="text-3xl font-bold text-green-600">
          {reservasActivas > 0 ? reservasActivas : "—"}
        </p>
      </Card>
    </div>
  );
}
