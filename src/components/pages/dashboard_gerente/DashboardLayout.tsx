"use client";

import React from "react";
import { Card } from "primereact/card";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  range: [Date, Date] | null;
  setRange: (value: [Date, Date] | null) => void;
  onApply: () => void;
}

export default function DashboardLayout({
  children,
  range,
  setRange,
  onApply,
}: DashboardLayoutProps) {

    
  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen flex justify-center">
      <div className="w-full max-w-[1600px]">
        <Card className="shadow-2 border-round-2xl p-6">
          {/* 🔹 Encabezado con título + filtro a la derecha */}
          <div
            className="flex align-items-center border-b pb-3 mb-5"
            style={{ justifyContent: "space-between", width: "100%" }}
          >
            <h1 className="text-2xl font-semibold text-gray-700 m-0">
              Panel de Control – Nova Suites
            </h1>

            {/* 📅 Selector de rango de fechas */}
            <div className="flex align-items-center gap-2">
              <Calendar
                value={range}
                selectionMode="range"
                readOnlyInput
                dateFormat="dd/mm/yy"
                showIcon
                placeholder="Rango de fechas"
                onChange={(e) => {
                  const val = e.value as [Date, Date];
                  if (val && val[0] && val[1]) {
                    // ✅ Forzar conversión a Date real (evita strings o formatos inconsistentes)
                    setRange([new Date(val[0]), new Date(val[1])]);
                  } else {
                    setRange(val);
                  }
                }}
              />
              <Button
                label="Aplicar"
                icon="pi pi-refresh"
                severity="info"
                outlined
                onClick={onApply}
              />
            </div>
          </div>

          {/* 🔹 Contenido del dashboard */}
          <div className="flex flex-col gap-8">{children}</div>
        </Card>
      </div>
    </div>
  );
}
