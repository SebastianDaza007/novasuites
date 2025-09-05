import React from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { Categoria, TipoMovimiento, MovimientosFiltros } from '@/types/movimientos';

interface MovimientosFiltersProps {
  filtros: MovimientosFiltros;
  categorias: Categoria[];
  tiposMovimiento: TipoMovimiento[];
  onFiltroChange: <K extends keyof MovimientosFiltros>(
    campo: K,
    valor: MovimientosFiltros[K]
  ) => void;
  onLimpiarFiltros: () => void;
  onActualizar: () => void;
}

const MovimientosFilters: React.FC<MovimientosFiltersProps> = ({
  filtros,
  categorias,
  tiposMovimiento,
  onFiltroChange,
  onLimpiarFiltros,
  onActualizar
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Movimientos de Insumos</h2>
        <Button 
          icon="pi pi-refresh" 
          className="p-button-outlined p-button-sm"
          onClick={onActualizar}
          tooltip="Actualizar"
        />
      </div>
      
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div className="flex flex-col">
            <label htmlFor="fechaDesde" className="text-sm font-medium mb-2">
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
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="fechaHasta" className="text-sm font-medium mb-2">
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
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="categoria" className="text-sm font-medium mb-2">
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
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="tipoMovimiento" className="text-sm font-medium mb-2">
              Tipo Movimiento
            </label>
            <Dropdown
              id="tipoMovimiento"
              value={filtros.tipoMovimientoFiltro}
              options={tiposMovimiento}
              onChange={(e) => onFiltroChange('tipoMovimientoFiltro', e.value)}
              optionLabel="nombre_tipo"
              optionValue="id_tipo_movimiento"
              placeholder="Todos los tipos"
              className="w-full"
              showClear
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="busqueda" className="text-sm font-medium mb-2">
              Búsqueda
            </label>
            <span className="p-input-icon-left w-full">
              <i className="pi pi-search" />
              <InputText
                id="busqueda"
                value={filtros.globalFilter}
                onChange={(e) => onFiltroChange('globalFilter', e.target.value)}
                placeholder="Buscar..."
                className="w-full"
              />
            </span>
          </div>

          <div className="flex flex-col justify-end">
            <Button
              label="Limpiar Filtros"
              icon="pi pi-filter-slash"
              className="p-button-outlined p-button-secondary"
              onClick={onLimpiarFiltros}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MovimientosFilters;