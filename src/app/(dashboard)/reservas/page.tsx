"use client";

import React from "react";
import GuestForm from "@/components/pages/reservas/formulario";
import AvailabilityTable from "@/components/pages/reservas/tabla";

export default function ReservasPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 overflow-x-hidden">
      <div className="w-full grid grid-cols-1 lg:grid-cols-7 gap-6 items-start">
        <div className="w-full h-full lg:col-span-3">
          <GuestForm />
        </div>
        <div className="w-full h-full lg:col-span-4">
          <AvailabilityTable />
        </div>
      </div>
    </div>
  );
}

