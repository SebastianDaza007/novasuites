"use client";

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import FacturasFilters from '@/components/pages/facturas/FacturasFilters';
import FacturasTable from '@/components/pages/facturas/FacturasTable';
import { useFacturas } from '@/hooks/useFacturas';

interface SummaryData {
  totalPendiente: number;
  totalPagado: number;
  totalVencido: number;
  saldoPorProveedor: Record<string, { pendiente: number; pagado: number }>;
}

const FacturasPage = () => {
  const toast = useRef<Toast>(null);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalPendiente: 0,
    totalPagado: 0,
    totalVencido: 0,
    saldoPorProveedor: {}
  });

  const {
    // Estado de datos
    facturas,
    todasLasFacturas,
    proveedores,
    estadosFactura,
    tiposFactura,
    numerosFactura,
    ordenesCompra,
    loading,
    totalRecords,

    // Estado de filtros y paginación
    filtros,
    lazyState,

    // Funciones de control
    setFiltro,
    limpiarFiltros,
    onPage,
    onSort,
    fetchFacturas
  } = useFacturas();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  // Calcular datos de resumen basados en todas las facturas (sin filtros)
  useEffect(() => {
    if (todasLasFacturas.length > 0) {
      const ahora = new Date();
      let totalPendiente = 0;
      let totalPagado = 0;
      let totalVencido = 0;
      const saldoPorProveedor: Record<string, { pendiente: number; pagado: number }> = {};

      todasLasFacturas.forEach(factura => {
        const fechaVencimiento = new Date(factura.fecha_vencimiento);
        const esVencida = fechaVencimiento < ahora && factura.estado_factura === 'PENDIENTE';

        // Calcular monto real basado en los detalles con precios reales
        const montoReal = factura.detalles.reduce((sum, detalle) =>
          sum + (detalle.cantidad * detalle.precio), 0
        );

        const nombreProveedor = factura.proveedor.nombre_proveedor;

        if (!saldoPorProveedor[nombreProveedor]) {
          saldoPorProveedor[nombreProveedor] = { pendiente: 0, pagado: 0 };
        }

        switch (factura.estado_factura) {
          case 'PENDIENTE':
            totalPendiente += montoReal;
            saldoPorProveedor[nombreProveedor].pendiente += montoReal;
            if (esVencida) {
              totalVencido += montoReal;
            }
            break;
          case 'PAGADA':
            totalPagado += montoReal;
            saldoPorProveedor[nombreProveedor].pagado += montoReal;
            break;
          case 'VENCIDA':
            totalVencido += montoReal;
            saldoPorProveedor[nombreProveedor].pendiente += montoReal;
            break;
          case 'ANULADA':
            // Las facturas anuladas no se cuentan en los totales
            break;
        }
      });

      setSummaryData({
        totalPendiente,
        totalPagado,
        totalVencido,
        saldoPorProveedor
      });
    }
  }, [todasLasFacturas]);

  const handleExportar = useCallback(() => {
    toast.current?.show({
      severity: 'info',
      summary: 'Función en desarrollo',
      detail: 'La exportación estará disponible próximamente',
      life: 3000
    });
  }, []);

  const handleRegistrarFactura = useCallback(() => {
    toast.current?.show({
      severity: 'info',
      summary: 'Redirigiendo a...',
      detail: 'Funcionalidad en desarrollo',
      life: 3000
    });
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toast ref={toast} />

      <div className="max-w-full mx-auto max-y-full">
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <i className="pi pi-clock text-xl"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Total Pendiente</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summaryData.totalPendiente)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <i className="pi pi-check-circle text-xl"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pagado</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summaryData.totalPagado)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                <i className="pi pi-exclamation-triangle text-xl"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vencido</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(summaryData.totalVencido)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Saldo por Proveedor */}
        {Object.keys(summaryData.saldoPorProveedor).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saldo por Proveedor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(summaryData.saldoPorProveedor).map(([proveedor, saldo]) => (
                <div key={proveedor} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{proveedor}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-red-600">Pendiente:</span>
                      <span className="font-medium text-red-600">{formatCurrency(saldo.pendiente)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Pagado:</span>
                      <span className="font-medium text-green-600">{formatCurrency(saldo.pagado)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-2">
                      <span className="font-medium text-gray-700">Total:</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(saldo.pendiente + saldo.pagado)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtros y tabla */}
        <FacturasFilters
          filtros={filtros}
          proveedores={proveedores}
          estadosFactura={estadosFactura}
          tiposFactura={tiposFactura}
          numerosFactura={numerosFactura}
          ordenesCompra={ordenesCompra}
          onFiltroChange={setFiltro}
          onLimpiarFiltros={limpiarFiltros}
          onActualizar={fetchFacturas}
          onExportar={handleExportar}
          onRegistrarFactura={handleRegistrarFactura}
        />

        <FacturasTable
          facturas={facturas}
          loading={loading}
          totalRecords={totalRecords}
          lazyState={lazyState}
          onPage={onPage}
          onSort={onSort}
        />
      </div>
    </div>
  );
};

export default FacturasPage;
