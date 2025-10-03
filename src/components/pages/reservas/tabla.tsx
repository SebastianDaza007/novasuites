"use client";

import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Tag } from "primereact/tag";

export type RoomEstado = "reservado" | "ocupado" | "libre";

export interface RoomRow {
  habitacion: string;
  tipo: string;
  camas: string;
  estado: RoomEstado;
  nota?: string; // para "No disponible hasta el 16/11"
  seleccionado?: boolean;
}

const initialRows: RoomRow[] = [
  { habitacion: "112", tipo: "Suite", camas: "1 - Matrimonial\n3 - Individuales", estado: "reservado", nota: "No disponible" },
  { habitacion: "212", tipo: "Suite", camas: "1 - Matrimonial\n3 - Individuales", estado: "ocupado", nota: "No disponible hasta el 16/11" },
  { habitacion: "512", tipo: "Suite", camas: "2 - Matrimonial\n1 - Individuales", estado: "libre", seleccionado: false },
  { habitacion: "014", tipo: "Suite", camas: "1 - Matrimonial", estado: "libre", seleccionado: true },
];

const estadoBadgeClass = (estado: RoomEstado) => {
  switch (estado) {
    case "reservado":
      return "bg-indigo-700 text-white"; // azul oscuro
    case "ocupado":
      return "bg-orange-500 text-white"; // naranja
    case "libre":
      return "bg-blue-400 text-white"; // azul claro
    default:
      return "bg-gray-300 text-gray-800";
  }
};

const AvailabilityTable: React.FC = () => {
  const [rows, setRows] = useState<RoomRow[]>(initialRows);

  const header = (
    <div className="flex items-center justify-between px-1 py-2">
      <h2 className="text-2xl font-semibold text-gray-900">Habitaciones disponibles</h2>
      <Button
        icon="pi pi-refresh"
        rounded
        outlined
        aria-label="Actualizar"
        className="!h-10 !w-10 flex items-center justify-center"
        tooltip="Actualizar disponibilidad"
        tooltipOptions={{ position: "left" }}
        onClick={() => {
          // aquí se podría reconsultar la API
          setRows((r) => [...r]);
        }}
      />
    </div>
  );

  const estadoBody = (row: RoomRow) => {
    // PrimeReact Tag severities supported: 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'contrast'
    // Usamos 'info' para azul y aplicamos una clase extra en 'reservado' para un azul más oscuro.
    const map: Record<RoomEstado, { value: string; severity: "info" | "warning"; extraClass?: string }> = {
      reservado: { value: "Reservado", severity: "info", extraClass: "bg-indigo-700 text-white border-none" },
      ocupado: { value: "Ocupado", severity: "warning" },
      libre: { value: "Libre", severity: "info" },
    };
    const cfg = map[row.estado];
    return <Tag value={cfg.value} severity={cfg.severity} rounded className={`text-xs px-2 py-1 ${cfg.extraClass ?? ""}`} />;
  };

  const seleccionarBody = (row: RoomRow, options: any) => {
    if (row.estado !== "libre") {
      return <span className="text-gray-500 text-xs whitespace-normal break-words">{row.nota ?? "No disponible"}</span>;
    }
    return (
      <Checkbox
        checked={!!row.seleccionado}
        onChange={(e) => {
          const checked = e.checked as boolean;
          setRows((prev) => prev.map((r) => (r.habitacion === row.habitacion ? { ...r, seleccionado: checked } : r)));
        }}
      />
    );
  };

  const camasBody = (row: RoomRow) => (
    <div className="whitespace-pre-line">{row.camas}</div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <DataTable
        value={rows}
        size="small"
        header={header}
        tableStyle={{ width: '100%', tableLayout: 'auto' }}
        rowHover
        stripedRows
        className="rounded-lg"
      >
        <Column
          field="habitacion"
          header="Habitaciones"
          headerStyle={{ backgroundColor: 'white', color: 'black', fontWeight: 600 }}
          bodyClassName="text-gray-700 whitespace-normal break-words"
          bodyStyle={{ textAlign: 'left' }}
          style={{ minWidth: '8rem' }}
        />
        <Column
          field="tipo"
          header="Tipo"
          headerStyle={{ backgroundColor: 'white', color: 'black', fontWeight: 600 }}
          bodyClassName="text-gray-700 whitespace-normal break-words"
          bodyStyle={{ textAlign: 'left' }}
          style={{ minWidth: '8rem' }}
        />
        <Column
          field="camas"
          header="Camas"
          body={camasBody}
          headerStyle={{ backgroundColor: 'white', color: 'black', fontWeight: 600 }}
          bodyClassName="text-gray-700 whitespace-pre-line break-words"
          bodyStyle={{ textAlign: 'left' }}
          style={{ minWidth: '11rem' }}
        />
        <Column
          header="Estado"
          body={estadoBody}
          headerStyle={{ backgroundColor: 'white', color: 'black', fontWeight: 600 }}
          bodyClassName="text-center whitespace-normal"
          style={{ minWidth: '6rem' }}
        />
        <Column
          header="Seleccionar"
          body={seleccionarBody}
          headerStyle={{ backgroundColor: 'white', color: 'black', fontWeight: 600 }}
          bodyClassName="text-left whitespace-normal break-words"
          style={{ minWidth: '8rem' }}
        />
      </DataTable>
    </div>
  );
}
;

export default AvailabilityTable;
