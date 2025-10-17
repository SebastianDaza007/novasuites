"use client";

import React from "react";
import { Card } from "primereact/card";

interface DashboardCardsProps {
  data: {
    stockAgrupado: Record<string, number>;
    insumosCriticos: any[];
  };
}

export default function DashboardCards({ data }: DashboardCardsProps) {
  const totalStock = Object.values(data.stockAgrupado).reduce((a, b) => a + b, 0);
  const totalDepositos = Object.keys(data.stockAgrupado).length;
  const totalCriticos = data.insumosCriticos.length;

  return (
    <div className="w-full flex flex-wrap justify-between gap-4">
      <Card className="flex-1 min-w-[280px] shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Stock total (todas las sedes)
        </h3>
        <p className="text-3xl font-bold text-blue-600">{totalStock}</p>
        <p className="text-sm text-gray-500">{totalDepositos} depósitos</p>
      </Card>

      <Card className="flex-1 min-w-[280px] shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Insumos bajo stock crítico
        </h3>
        <p className="text-3xl font-bold text-red-500">{totalCriticos}</p>
        <p className="text-sm text-gray-500">Necesitan reposición</p>
      </Card>

      <Card className="flex-1 min-w-[280px] shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Promedio de stock por depósito
        </h3>
        <p className="text-3xl font-bold text-green-600">
          {Math.round(totalStock / totalDepositos || 0)}
        </p>
      </Card>
    </div>
  );
}
