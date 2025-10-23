import React from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import {
  FacturasFiltros,
  Proveedor,
  EstadoFactura,
  TipoFactura,
  NumeroFactura,
  OrdenCompraOption
} from '@/types/facturas';

interface FacturasFiltersProps {
  filtros: FacturasFiltros;
  proveedores: Proveedor[];
  estadosFactura: EstadoFactura[];
  tiposFactura: TipoFactura[];
  numerosFactura: NumeroFactura[];
  ordenesCompra: OrdenCompraOption[];
  onFiltroChange: <K extends keyof FacturasFiltros>(
    campo: K,
    valor: FacturasFiltros[K]
  ) => void;
  onLimpiarFiltros: () => void;
  onActualizar: () => void;
  onPagosParciales?: () => void;
  onRegistrarFactura?: () => void;
}

const FacturasFilters: React.FC<FacturasFiltersProps> = ({
  filtros,
  proveedores,
  estadosFactura,
  tiposFactura,
  numerosFactura,
  ordenesCompra,
  onFiltroChange,
  onLimpiarFiltros,
  onActualizar,
  onPagosParciales,
  onRegistrarFactura
}) => {
  return (
    <div className="flex flex-col gap-6 mb-0">
      {/* Barra superior de acciones */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <Button
          label="Registrar factura"
          icon="pi pi-plus"
          severity="success"
          onClick={onRegistrarFactura}
        />
        <div className="flex flex-wrap gap-2">
          {onPagosParciales && (
            <Button
              label="Realizar pagos parciales"
              icon="pi pi-wallet"
              severity="info"
              onClick={onPagosParciales}
            />
          )}
        </div>
      </div>

      {/* Sistema de Filtros */}
      <Card className="p-4 shadow-lg rounded-t-lg rounded-b-none mb-0" style={{ backgroundColor: '#eff3f8', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label htmlFor="numeroFactura" className="text-sm font-medium mb-2 text-gray-700">
              Nro Factura
            </label>
            <Dropdown
              id="numeroFactura"
              value={filtros.numeroFactura}
              options={numerosFactura}
              onChange={(e) => onFiltroChange('numeroFactura', e.value)}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar número de factura"
              className="w-full"
              showClear
              filter
              filterPlaceholder="Buscar factura..."
              emptyMessage="No se encontraron facturas"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="proveedor" className="text-sm font-medium mb-2 text-gray-700">
              Proveedor
            </label>
            <Dropdown
              id="proveedor"
              value={filtros.proveedorFiltro}
              options={proveedores}
              onChange={(e) => onFiltroChange('proveedorFiltro', e.value)}
              optionLabel="nombre_proveedor"
              optionValue="id_proveedor"
              placeholder="Todos los proveedores"
              className="w-full"
              showClear
              filter
              filterPlaceholder="Buscar proveedor..."
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="estadoFactura" className="text-sm font-medium mb-2 text-gray-700">
              Estado
            </label>
            <Dropdown
              id="estadoFactura"
              value={filtros.estadoFactura}
              options={estadosFactura}
              onChange={(e) => onFiltroChange('estadoFactura', e.value)}
              optionLabel="label"
              optionValue="value"
              placeholder="Todos los estados"
              className="w-full"
              showClear
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="ordenCompra" className="text-sm font-medium mb-2 text-gray-700">
              Orden de Compra
            </label>
            <Dropdown
              id="ordenCompra"
              value={filtros.ordenCompra}
              options={ordenesCompra}
              onChange={(e) => onFiltroChange('ordenCompra', e.value)}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar orden"
              className="w-full"
              showClear
              filter
              filterPlaceholder="Buscar orden..."
              emptyMessage="No se encontraron órdenes"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="flex flex-col">
            <label htmlFor="tipoFactura" className="text-sm font-medium mb-2 text-gray-700">
              Tipo de Factura
            </label>
            <Dropdown
              id="tipoFactura"
              value={filtros.tipoFactura}
              options={tiposFactura}
              onChange={(e) => onFiltroChange('tipoFactura', e.value)}
              optionLabel="label"
              optionValue="value"
              placeholder="Todos los tipos"
              className="w-full"
              showClear
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="fechaDesde" className="text-sm font-medium mb-2 text-gray-700">
              Desde
            </label>
            <Calendar
              id="fechaDesde"
              value={filtros.fechaDesde}
              onChange={(e) => onFiltroChange('fechaDesde', e.value || null)}
              dateFormat="dd/mm/yy"
              placeholder="dd/mm/yyyy"
              className="w-full"
              showIcon
              showButtonBar
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="fechaHasta" className="text-sm font-medium mb-2 text-gray-700">
              Hasta
            </label>
            <Calendar
              id="fechaHasta"
              value={filtros.fechaHasta}
              onChange={(e) => onFiltroChange('fechaHasta', e.value || null)}
              dateFormat="dd/mm/yy"
              placeholder="dd/mm/yyyy"
              className="w-full"
              showIcon
              showButtonBar
            />
          </div>

          <div className="flex flex-row justify-end items-end gap-2">
            <Button
              label="Limpiar Filtros"
              icon="pi pi-filter-slash"
              className="p-button-outlined h-10"
              onClick={onLimpiarFiltros}
              style={{
                borderColor: '#EFC87A',
                color: '#C88419',
                backgroundColor: 'transparent'
              }}
            />
            <Button
              icon="pi pi-refresh"
              className="p-button-outlined h-10"
              onClick={onActualizar}
              tooltip="Actualizar"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FacturasFilters;