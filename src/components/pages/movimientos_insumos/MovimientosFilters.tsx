import React from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { useRouter } from 'next/navigation';
import { Categoria, TipoMovimiento, Deposito, MovimientosFiltros, NumeroMovimiento, InsumoOption, LoteOption } from '@/types/movimientos';

interface MovimientosFiltersProps {
  filtros: MovimientosFiltros;
  categorias: Categoria[];
  tiposMovimiento: TipoMovimiento[];
  depositos: Deposito[];
  numerosMovimiento: NumeroMovimiento[];
  insumosOptions: InsumoOption[];
  lotesOptions: LoteOption[];
  onFiltroChange: <K extends keyof MovimientosFiltros>(
    campo: K,
    valor: MovimientosFiltros[K]
  ) => void;
  onLimpiarFiltros: () => void;
  onActualizar: () => void;
  onExportar?: () => void;
}

const MovimientosFilters: React.FC<MovimientosFiltersProps> = ({
  filtros,
  categorias,
  tiposMovimiento,
  depositos,
  numerosMovimiento,
  insumosOptions,
  lotesOptions,
  onFiltroChange,
  onLimpiarFiltros,
  onActualizar,
  onExportar
}) => {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-6 mb-0">
      {/* Encabezado y Navegación */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            label="Registrar movimientos"
            icon="pi pi-arrow-circle-left"
            className="p-button-info"
            onClick={() => router.push('/insumos/movimientos/registrar')}
          />
        </div>
        <div className="flex gap-2">
          {onExportar && (
            <Button
              label="Exportar a PDF/CSV"
              icon="pi pi-download"
              className="p-button"
              onClick={onExportar}
            />
          )}
        </div>
      </div>
      
      {/* Sistema de Filtros */}
      <Card className="p-4 shadow-lg rounded-t-lg rounded-b-none mb-0" style={{ backgroundColor: '#eff3f8', borderBottomLeftRadius: 0, borderBottomRightRadius: 0  }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <label htmlFor="fechaDesde" className="text-sm font-medium mb-2 text-gray-700">
              Fecha Desde
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
              Fecha Hasta
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

          <div className="flex flex-col">
            <label htmlFor="categoria" className="text-sm font-medium mb-2 text-gray-700">
              Categoría
            </label>
            <Dropdown
              id="categoria"
              value={filtros.categoriaFiltro}
              options={categorias}
              onChange={(e) => onFiltroChange('categoriaFiltro', e.value)}
              optionLabel="nombre_categoria"
              optionValue="id_categoria"
              placeholder="Todas las categorías"
              className="w-full"
              showClear
              filter
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="tipoMovimiento" className="text-sm font-medium mb-2 text-gray-700">
              Tipo Movimiento
            </label>
            <Dropdown
              id="tipoMovimiento"
              value={filtros.tipoMovimientoFiltro}
              options={tiposMovimiento}
              onChange={(e) => onFiltroChange('tipoMovimientoFiltro', e.value)}
              optionLabel="label"
              optionValue="value"
              placeholder="Todos los tipos"
              className="w-full"
              showClear
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="deposito" className="text-sm font-medium mb-2 text-gray-700">
              Depósito
            </label>
            <Dropdown
              id="deposito"
              value={filtros.depositoFiltro}
              options={depositos}
              onChange={(e) => onFiltroChange('depositoFiltro', e.value)}
              optionLabel="nombre_deposito"
              optionValue="id_deposito"
              placeholder="Todos los depósitos"
              className="w-full"
              showClear
              filter
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="flex flex-col">
            <label htmlFor="busquedaNumero" className="text-sm font-medium mb-2 text-gray-700">
              Nro Mov
            </label>
            <Dropdown
              id="busquedaNumero"
              value={filtros.numeroMovimiento}
              options={numerosMovimiento}
              onChange={(e) => onFiltroChange('numeroMovimiento', e.value)}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar número de movimiento"
              className="w-full"
              showClear
              filter
              filterPlaceholder="Buscar movimiento..."
              emptyMessage="No se encontraron movimientos"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="busquedaInsumo" className="text-sm font-medium mb-2 text-gray-700">
              Insumo
            </label>
            <Dropdown
              id="busquedaInsumo"
              value={filtros.insumoFilter}
              options={insumosOptions}
              onChange={(e) => onFiltroChange('insumoFilter', e.value)}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar insumo"
              className="w-full"
              showClear
              filter
              filterPlaceholder="Buscar insumo..."
              emptyMessage="No se encontraron insumos"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="busquedaLote" className="text-sm font-medium mb-2 text-gray-700">
              Lote
            </label>
            <Dropdown
              id="busquedaLote"
              value={filtros.loteFilter}
              options={lotesOptions}
              onChange={(e) => onFiltroChange('loteFilter', e.value)}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar lote"
              className="w-full"
              showClear
              filter
              filterPlaceholder="Buscar lote..."
              emptyMessage="No se encontraron lotes"
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

export default MovimientosFilters;