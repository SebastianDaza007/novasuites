"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { Tag } from "primereact/tag";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";

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
  cantidad_personas?: number;
}

// 🔹 Props
interface AvailabilityTableProps {
  onSelectHabitaciones?: (habitaciones: RoomRow[]) => void;
  habitacionesSeleccionadas?: RoomRow[];
  totalPersonasReserva?: number;
  fechaCheckin?: Date | null;
  fechaCheckout?: Date | null;
}

const AvailabilityTable: React.FC<AvailabilityTableProps> = ({
  onSelectHabitaciones,
  habitacionesSeleccionadas = [], // ✅ Valor por defecto
  totalPersonasReserva = 10, // ✅ Máximo por defecto
  fechaCheckin,
  fechaCheckout,
}) => {
  const [rows, setRows] = useState<RoomRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 🔄 Cargar habitaciones disponibles según fechas
  const fetchHabitaciones = async (): Promise<void> => {
    // No cargar si no hay fechas seleccionadas
    if (!fechaCheckin || !fechaCheckout) {
      setRows([]);
      return;
    }

    try {
      setLoading(true);
      const checkin = fechaCheckin.toISOString().split('T')[0];
      const checkout = fechaCheckout.toISOString().split('T')[0];

      const res = await fetch(`/api/habitaciones/disponibles?fecha_checkin=${checkin}&fecha_checkout=${checkout}`);
      const data = await res.json();

      // Validar que data sea un array antes de asignarlo
      if (Array.isArray(data)) {
        setRows(data);
      } else {
        console.error("❌ La respuesta no es un array:", data);
        setRows([]);
      }
    } catch (error) {
      console.error("❌ Error al obtener habitaciones:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitaciones();
  }, [fechaCheckin, fechaCheckout]);

  // 🧩 Al seleccionar/desmarcar una habitación
  const handleSelect = (id: number, checked: boolean): void => {
    let seleccionadas: RoomRow[];

    if (checked) {
      // Agregar la habitación a las seleccionadas
      const habitacion = rows.find((r) => r.id_habitaciones === id);
      if (habitacion) {
        seleccionadas = [
          ...habitacionesSeleccionadas,
          { ...habitacion, seleccionado: true, cantidad_personas: 1 }
        ];
      } else {
        seleccionadas = habitacionesSeleccionadas;
      }
    } else {
      // Quitar la habitación de las seleccionadas
      seleccionadas = habitacionesSeleccionadas.filter(
        (h) => h.id_habitaciones !== id
      );
    }

    // Enviar al padre sin modificar estado local
    onSelectHabitaciones?.(seleccionadas);
  };

  // 🧩 Al cambiar la cantidad de personas en una habitación
  const handleCantidadPersonasChange = (id: number, cantidad: number): void => {
    // Solo actualizar la habitación específica, sin tocar las demás
    // para prevenir deselecciones accidentales
    const habitacionActualizada = habitacionesSeleccionadas.map((h) =>
      h.id_habitaciones === id ? { ...h, cantidad_personas: cantidad } : h
    );

    // Enviar directamente al padre sin modificar el estado local
    onSelectHabitaciones?.(habitacionActualizada);
  };

  // 🧠 Sincronizar estado visual con el padre
  // Actualizar rows solo cuando cambia habitacionesSeleccionadas desde el padre
  useEffect(() => {
    setRows((prevRows) =>
      prevRows.map((r) => {
        const seleccionada = habitacionesSeleccionadas.find(
          (h) => h.id_habitaciones === r.id_habitaciones
        );
        return {
          ...r,
          seleccionado: !!seleccionada,
          cantidad_personas: seleccionada?.cantidad_personas || 0
        };
      })
    );
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
    // Si no hay fechas seleccionadas, no permitir seleccionar
    if (!fechaCheckin || !fechaCheckout) {
      return <span className="text-gray-500 text-xs">Seleccione fechas</span>;
    }

    // Buscar en las habitaciones seleccionadas del padre
    const isChecked = habitacionesSeleccionadas.some(
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

  // 👥 Input de cantidad de personas
  const cantidadPersonasBody = (row: RoomRow): React.ReactNode => {
    const habitacionSeleccionada = habitacionesSeleccionadas.find(
      (h) => h.id_habitaciones === row.id_habitaciones
    );

    // Solo mostrar input si la habitación está seleccionada
    if (!habitacionSeleccionada) {
      return <span className="text-gray-400 text-xs">-</span>;
    }

    const cantidadActual = habitacionSeleccionada.cantidad_personas || 1;
    const maxPersonas = row.capacidad;

    return (
      <InputNumber
        value={cantidadActual}
        onValueChange={(e: InputNumberValueChangeEvent) => {
          const nuevoValor = e.value ?? 1;
          handleCantidadPersonasChange(row.id_habitaciones, nuevoValor);
        }}
        showButtons
        buttonLayout="horizontal"
        min={1}
        max={maxPersonas}
        className="w-full"
        inputClassName="w-16 text-center"
        decrementButtonClassName="p-button-sm"
        incrementButtonClassName="p-button-sm"
      />
    );
  };

  // 🔹 Cabecera de la tabla
  const header = (
    <div className="flex items-center justify-between px-1 py-2">
      <h2 className="text-2xl font-semibold text-gray-900">
        {!fechaCheckin || !fechaCheckout
          ? "Seleccione fechas para ver habitaciones disponibles"
          : "Habitaciones disponibles"}
      </h2>
      {fechaCheckin && fechaCheckout && (
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
      )}
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
        emptyMessage={!fechaCheckin || !fechaCheckout
          ? "Seleccione fechas de check-in y check-out para buscar habitaciones disponibles"
          : "No hay habitaciones disponibles en estas fechas"}
      >
        <Column field="numero" header="N°" style={{ width: '80px' }} />
        <Column field="tipo" header="Tipo" style={{ width: '120px' }} />
        <Column field="capacidad" header="Capacidad" style={{ width: '100px' }} />
        <Column header="Estado" body={estadoBody} style={{ width: '130px' }} />
        <Column header="Seleccionar" body={seleccionarBody} style={{ width: '110px' }} />
        <Column header="Personas asignadas" body={cantidadPersonasBody} style={{ width: '180px' }} />
        <Column field="precio_base" header="Precio Base (ARS)" style={{ width: '150px' }} />
      </DataTable>
    </div>
  );
};

export default AvailabilityTable;
