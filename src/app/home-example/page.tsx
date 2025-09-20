'use client';

import React from 'react';
import CardGridProv from '@/components/pages/Facturas/cargrid_prov';

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Prueba del Sistema de Gestión de Facturas</h1>
          <p className="mt-2 text-gray-600">
            Testing del componente de gestión de facturas con funcionalidades completas
          </p>
        </div>
        
        <CardGridProv />
      </div>
    </div>
  );
}
