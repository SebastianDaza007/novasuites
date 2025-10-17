"use client";

import React from "react";
import { Card } from "primereact/card";

interface DashboardCardsProps {
  data: {
    promedioEstadia: number;
    reservasPorCategoria: { tipo: string; cantidad: number }[];
    rankingMetodos: { metodo: string; cantidad: number }[];
  };
}

export default function DashboardCards({ data }: DashboardCardsProps) {
  const totalReservas = data.reservasPorCategoria.reduce(
    (acc, r) => acc + r.cantidad,
    0
  );
  const metodoTop =
    data.rankingMetodos.sort((a, b) => b.cantidad - a.cantidad)[0]?.metodo ?? "-";

  return (
    <div className="w-full flex flex-wrap justify-between gap-4">
      <Card className="flex-1 min-w-[280px] shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Total de reservas
        </h3>
        <p className="text-3xl font-bold text-blue-600">{totalReservas}</p>
      </Card>

      <Card className="flex-1 min-w-[280px] shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Promedio de estadía
        </h3>
        <p className="text-3xl font-bold text-green-600">
          {data.promedioEstadia} días
        </p>
      </Card>

      <Card className="flex-1 min-w-[280px] shadow-2 border-round-2xl text-center p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Método de pago más usado
        </h3>
        <p className="text-3xl font-bold text-purple-600">{metodoTop}</p>
      </Card>
    </div>
  );
}
