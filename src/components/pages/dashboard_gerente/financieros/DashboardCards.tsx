"use client";

import React from "react";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";

interface DashboardCardsProps {
  data: {
    ingresosMensuales: { mes: string; monto: number }[];
    egresosMensuales: { mes: string; monto: number }[];
    balance: { mes: string; balance: number }[];
    facturasProveedorPorEstado: Record<string, number>;
    rankingMetodos: { metodo: string; cantidad: number }[];
  };
}

export default function DashboardCards({ data }: DashboardCardsProps) {
  const totalIngresos = data.ingresosMensuales.reduce((s, i) => s + i.monto, 0);
  const totalEgresos = data.egresosMensuales.reduce((s, i) => s + i.monto, 0);
  const balanceTotal = totalIngresos - totalEgresos;

  const pendientes = data.facturasProveedorPorEstado["PENDIENTE"] ?? 0;
  const pagadas = data.facturasProveedorPorEstado["PAGADA"] ?? 0;

  const metodoTop =
    data.rankingMetodos.sort((a, b) => b.cantidad - a.cantidad)[0] || {
      metodo: "—",
      cantidad: 0,
    };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <Card className="shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Total ingresos
        </h3>
        <p className="text-3xl font-bold text-green-600">
          ${totalIngresos.toLocaleString("es-AR")}
        </p>
      </Card>

      <Card className="shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Total egresos
        </h3>
        <p className="text-3xl font-bold text-red-500">
          ${totalEgresos.toLocaleString("es-AR")}
        </p>
      </Card>

      <Card className="shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Balance</h3>
        <p
          className={`text-3xl font-bold ${
            balanceTotal >= 0 ? "text-green-600" : "text-red-500"
          }`}
        >
          ${balanceTotal.toLocaleString("es-AR")}
        </p>
      </Card>

      <Card className="shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Método de pago más usado
        </h3>
        <p className="text-2xl font-bold text-blue-600">{metodoTop.metodo}</p>
        <p className="text-sm text-gray-500">
          {metodoTop.cantidad} reservas
        </p>
      </Card>
    </div>
  );
}
