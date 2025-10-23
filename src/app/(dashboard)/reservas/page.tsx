"use client";

import React, { useState } from "react";
import GuestForm from "@/components/pages/reservas/formulario";
import AvailabilityTable, { RoomRow } from "@/components/pages/reservas/tabla";

export default function ReservasPage() {
  // 🔹 Estado compartido entre los dos componentes
  const [habitacionesSeleccionadas, setHabitacionesSeleccionadas] = useState<RoomRow[]>([]);

  // 🔹 Total de personas en la reserva (adultos + menores)
  const [totalPersonas, setTotalPersonas] = useState<number>(1);

  // 🔹 Fechas de la reserva (compartidas entre formulario y tabla)
  const [fechaCheckin, setFechaCheckin] = useState<Date | null>(null);
  const [fechaCheckout, setFechaCheckout] = useState<Date | null>(null);

  // ✅ Nueva función: se llama cuando la reserva se registra con éxito
  const handleReservaExitosa = (): void => {
    // Limpia todo el estado compartido
    setHabitacionesSeleccionadas([]);
    setTotalPersonas(1);
    setFechaCheckin(null);
    setFechaCheckout(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 overflow-x-hidden">
      <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* 🧍 Formulario huésped y reserva */}
        <div className="lg:col-span-3">
          <GuestForm
            habitacionesSeleccionadas={habitacionesSeleccionadas}
            onTotalPersonasChange={setTotalPersonas}
            onFechasChange={(desde, hasta) => {
              setFechaCheckin(desde);
              setFechaCheckout(hasta);
            }}
            onReservaExitosa={handleReservaExitosa}
          />
        </div>

        {/* 🏨 Tabla de habitaciones */}
        <div className="lg:col-span-4">
          <AvailabilityTable
            onSelectHabitaciones={setHabitacionesSeleccionadas}
            habitacionesSeleccionadas={habitacionesSeleccionadas}
            totalPersonasReserva={totalPersonas}
            fechaCheckin={fechaCheckin}
            fechaCheckout={fechaCheckout}
          />
        </div>
      </div>
    </div>
  );
}
