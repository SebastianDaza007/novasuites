"use client";

import React from "react";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";

interface DashboardCardsProps {
  data: {
    proveedores: { activos: number; inactivos: number };
    facturasPorEstado: Record<string, number>;
  };
}

export default function DashboardCards({ data }: DashboardCardsProps) {
  const { activos, inactivos } = data.proveedores;
  const pendientes = data.facturasPorEstado["PENDIENTE"] ?? 0;
  const pagadas = data.facturasPorEstado["PAGADA"] ?? 0;

  return (
    <div className="w-full flex flex-wrap justify-between gap-4">
      <Card className="flex-1 min-w-[280px] shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Proveedores activos
        </h3>
        <p className="text-3xl font-bold text-green-600">{activos}</p>
      </Card>

      <Card className="flex-1 min-w-[280px] shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Proveedores inactivos
        </h3>
        <p className="text-3xl font-bold text-red-500">{inactivos}</p>
      </Card>

      <Card className="flex-1 min-w-[280px] shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Facturas proveedor
        </h3>
        <div className="flex justify-center gap-2 flex-wrap">
          <Tag severity="warning" value={`Pendientes: ${pendientes}`} />
          <Tag severity="success" value={`Pagadas: ${pagadas}`} />
        </div>
      </Card>
    </div>
  );

}
