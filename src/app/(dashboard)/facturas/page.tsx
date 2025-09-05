"use client";

import React from 'react';
import CardGridProv from '@/components/cardgrid/cargrid_prov';

export default function FacturasPage() {
  return (
    <div className="h-screen overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Facturas </h1>
          <p className="mt-2 text-gray-600">
            Administra y controla todas las facturas de proveedores
          </p>
        </div>
        
        <CardGridProv />
      </div>
    </div>
  );
}
