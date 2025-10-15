"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { Tag } from "primereact/tag";

// 🔹 Tipos
export type RoomEstado =
  | "DISPONIBLE"
  | "OCUPADA"
  | "LIMPIEZA"
  | "MANTENIMIENTO";

export interface RoomRow {
  id_habitaciones: number;
  numero: string;
  tipo: string;
  capacidad: number;
  precio_base: number;
  estado: RoomEstado;
  seleccionado?: boolean;
}

// 🔹 Props
interface AvailabilityTableProps {
  onSelectHabitaciones?: (habitaciones: RoomRow[]) => void;
  habitacionesSeleccionadas?: RoomRow[];
}

const AvailabilityTable: React.FC<AvailabilityTableProps> = ({
  onSelectHabitaciones,
  habitacionesSeleccionadas = [], // ✅ Valor por defecto
}) => {
  const [rows, setRows] = useState<RoomRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 🔄 Cargar habitaciones desde la API
  const fetchHabitaciones = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch("/api/habitaciones");
      const data: RoomRow[] = await res.json();
      setRows(data);
    } catch (error) {
      console.error("❌ Error al obtener habitaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitaciones();
  }, []);

  // 🧩 Al seleccionar/desmarcar una habitación
  const handleSelect = (id: number, checked: boolean): void => {
    const updated = rows.map((r) =>
      r.id_habitaciones === id ? { ...r, seleccionado: checked } : r
    );
    setRows(updated);

    // 🔹 Enviar las habitaciones seleccionadas completas
    const seleccionadas = updated.filter((r) => r.seleccionado);
    onSelectHabitaciones?.(seleccionadas);
  };

  // 🧠 Sincronizar estado visual con el padre
  useEffect(() => {
    if (habitacionesSeleccionadas.length === 0) {
      // Si no hay seleccionadas, limpiar selección local
      setRows((prev) => prev.map((r) => ({ ...r, seleccionado: false })));
    } else {
      // Actualizar selección visual según el padre
      setRows((prev) =>
        prev.map((r) => ({
          ...r,
          seleccionado: habitacionesSeleccionadas.some(
            (h: RoomRow) => h.id_habitaciones === r.id_habitaciones
          ),
        }))
      );
    }
  }, [habitacionesSeleccionadas]);

  // 🏷️ Mostrar estado con colores
  const estadoBody = (row: RoomRow): React.ReactNode => {
    const colorMap: Record<RoomEstado, string> = {
      DISPONIBLE: "bg-green-500 text-white",
      OCUPADA: "bg-orange-500 text-white",
      LIMPIEZA: "bg-yellow-400 text-black",
      MANTENIMIENTO: "bg-gray-400 text-white",
    };

    return (
      <Tag
        value={row.estado}
        className={`text-xs px-2 py-1 ${colorMap[row.estado]}`}
        rounded
      />
    );
  };

  // ☑️ Checkbox de selección sincronizado
  const seleccionarBody = (row: RoomRow): React.ReactNode => {
    if (row.estado !== "DISPONIBLE") {
      return <span className="text-gray-500 text-xs">No disponible</span>;
    }

    const isChecked = !!habitacionesSeleccionadas?.some(
      (h) => h.id_habitaciones === row.id_habitaciones
    );

    return (
      <Checkbox
        inputId={`chk-${row.id_habitaciones}`}
        checked={isChecked}
        onChange={(e: CheckboxChangeEvent) =>
          handleSelect(row.id_habitaciones, e.checked ?? false)
        }
      />
    );
  };

  // 🔹 Cabecera de la tabla
  const header = (
    <div className="flex items-center justify-between px-1 py-2">
      <h2 className="text-2xl font-semibold text-gray-900">
        Habitaciones disponibles
      </h2>
      <Button
        icon="pi pi-refresh"
        rounded
        outlined
        aria-label="Actualizar"
        className="!h-10 !w-10"
        tooltip="Actualizar disponibilidad"
        tooltipOptions={{ position: "left" }}
        onClick={fetchHabitaciones}
        loading={loading}
      />
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <DataTable
        value={rows}
        dataKey="id_habitaciones" // ✅ clave única
        size="small"
        header={header}
        tableStyle={{ width: "100%", tableLayout: "auto" }}
        rowHover
        stripedRows
        loading={loading}
      >
        <Column field="numero" header="N°" />
        <Column field="tipo" header="Tipo" />
        <Column field="capacidad" header="Capacidad" />
        <Column field="precio_base" header="Precio Base (ARS)" />
        <Column header="Estado" body={estadoBody} />
        <Column header="Seleccionar" body={seleccionarBody} />
      </DataTable>
    </div>
  );
};

export default AvailabilityTable;
