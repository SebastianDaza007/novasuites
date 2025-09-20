import React from 'react';
import { DataTable, DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import { MovimientoDetalle, LazyState } from '@/types/movimientos';

interface MovimientosTableProps {
  movimientos: MovimientoDetalle[];
  loading: boolean;
  totalRecords: number;
  lazyState: LazyState;
  onPage: (event: { first: number; rows: number }) => void;
  onSort?: (event: DataTableStateEvent) => void;
}

const MovimientosTable: React.FC<MovimientosTableProps> = ({
  movimientos,
  loading,
  totalRecords,
  lazyState,
  onPage,
  onSort
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };


  const tipoMovimientoBodyTemplate = (rowData: MovimientoDetalle) => {
    const razonMovimiento = rowData.movimiento.razon_movimiento;
    if (!razonMovimiento) return '-';

    const getSeverity = (tipo: string) => {
      switch (tipo) {
        case 'ALTA':
        case 'TRANSFERENCIA_ENTRADA':
          return 'success';
        case 'BAJA':
        case 'TRANSFERENCIA_SALIDA':
          return 'danger';
        case 'AJUSTE':
          return 'info';
        default:
          return 'secondary';
      }
    };

    const getLabel = (tipo: string) => {
      switch (tipo) {
        case 'ALTA':
          return 'Alta';
        case 'BAJA':
          return 'Baja';
        case 'TRANSFERENCIA_ENTRADA':
          return 'T. Entrada';
        case 'TRANSFERENCIA_SALIDA':
          return 'T. Salida';
        case 'AJUSTE':
          return 'Ajuste';
        default:
          return tipo;
      }
    };

    return (
      <div className="flex flex-col gap-1">
        <Tag 
          value={getLabel(razonMovimiento.tipo_movimiento)} 
          severity={getSeverity(razonMovimiento.tipo_movimiento)}
          className="text-xs"
        />
        <small className="text-gray-600">{razonMovimiento.nombre_razon}</small>
      </div>
    );
  };

  const cantidadBodyTemplate = (rowData: MovimientoDetalle) => {
    const isPositive = rowData.movimiento.razon_movimiento?.tipo_movimiento === 'ALTA' || 
                      rowData.movimiento.razon_movimiento?.tipo_movimiento === 'TRANSFERENCIA_ENTRADA';
    const isNegative = rowData.movimiento.razon_movimiento?.tipo_movimiento === 'BAJA' || 
                      rowData.movimiento.razon_movimiento?.tipo_movimiento === 'TRANSFERENCIA_SALIDA';

    return (
      <div className="flex items-center justify-center">
        <Badge 
          value={rowData.cantidad} 
          severity={isPositive ? 'success' : isNegative ? 'danger' : 'info'}
          className="text-sm font-bold"
        />
      </div>
    );
  };

  const insumoBodyTemplate = (rowData: MovimientoDetalle) => {
    return (
      <div className="flex flex-col gap-1">
        <span className="font-medium">{rowData.insumo.nombre_insumo}</span>
        <small className="text-gray-600">
          {rowData.insumo.categoria.nombre_categoria}
        </small>
        {rowData.insumo.descripcion_insumo && (
          <small className="text-gray-500 italic">
            {rowData.insumo.descripcion_insumo}
          </small>
        )}
      </div>
    );
  };

  const depositoBodyTemplate = (rowData: MovimientoDetalle) => {
    const deposito = rowData.movimiento.deposito;
    if (!deposito) return '-';
    
    return (
      <div className="flex flex-col gap-1">
        <span className="font-medium">{deposito.nombre_deposito}</span>
      </div>
    );
  };

  const usuarioBodyTemplate = (rowData: MovimientoDetalle) => {
    return (
      <small className="text-gray-600">
        {rowData.movimiento.usuario.email}
      </small>
    );
  };

  const loteVencimientoBodyTemplate = (rowData: MovimientoDetalle) => {
    return (
      <div className="flex flex-col gap-1">
        {rowData.lote && (
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {rowData.lote}
          </span>
        )}
        {rowData.fecha_vencimiento && (
          <small className="text-orange-600">
            Vence: {formatDateOnly(rowData.fecha_vencimiento)}
          </small>
        )}
        {!rowData.lote && !rowData.fecha_vencimiento && '-'}
      </div>
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-lg">
      <DataTable
        value={movimientos}
        lazy
        dataKey="id_detalle"
        paginator
        first={lazyState.first}
        rows={lazyState.rows}
        totalRecords={totalRecords}
        onPage={onPage}
        onSort={onSort}
        sortField={lazyState.sortField || undefined}
        sortOrder={lazyState.sortOrder as 1 | -1 | null || null}
        loading={loading}
        stripedRows
        showGridlines
        size="small"
        scrollable
        scrollHeight="600px"
        className="p-datatable-sm"
        emptyMessage="No se encontraron movimientos de insumos"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        rowsPerPageOptions={[5, 10, 15, 30]}
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} movimientos"
      >
        <Column
          field="movimiento.id_movimiento"
          header="#Nro Mov"
          sortable
          body={(rowData) => rowData.movimiento.id_movimiento}
          style={{ minWidth: '80px', textAlign: 'center' }}
          bodyStyle={{ textAlign: 'center' }}
          headerStyle={{ textAlign: 'center' }}
        />

        <Column
          field="insumo.nombre_insumo"
          header="Insumo/Categoría/Desc"
          body={insumoBodyTemplate}
          style={{ minWidth: '250px' }}
        />

        <Column
          field="cantidad"
          header="Cantidad"
          sortable
          body={cantidadBodyTemplate}
          style={{ minWidth: '100px', textAlign: 'center' }}
          bodyStyle={{ textAlign: 'center' }}
          headerStyle={{ textAlign: 'center' }}
        />

        <Column
          field="movimiento.fecha_movimiento"
          header="Fecha y Hora Mov."
          sortable
          body={(rowData) => formatDate(rowData.movimiento.fecha_movimiento)}
          style={{ minWidth: '160px' }}
          headerStyle={{ textAlign: 'center' }}
        />

        <Column
          header="Depósito"
          body={depositoBodyTemplate}
          style={{ minWidth: '150px' }}
          headerStyle={{ textAlign: 'center' }}
        />




        <Column
          field="fecha_vencimiento"
          header="Lote/Vencimiento"
          sortable
          body={loteVencimientoBodyTemplate}
          style={{ minWidth: '140px' }}
          headerStyle={{ textAlign: 'center' }}
        />

        <Column
          field="movimiento.numero_comprobante"
          header="Comprobante"
          body={(rowData) => rowData.movimiento.numero_comprobante || '-'}
          style={{ minWidth: '120px' }}
          headerStyle={{ textAlign: 'center' }}
        />

        <Column
          field="movimiento.observaciones"
          header="Observaciones"
          body={(rowData) => rowData.movimiento.observaciones || '-'}
          style={{ minWidth: '150px' }}
          headerStyle={{ textAlign: 'center' }}
        />

        <Column
          header="Usuario responsable"
          body={usuarioBodyTemplate}
          style={{ minWidth: '120px' }}
          headerStyle={{ textAlign: 'center' }}
        />

        <Column
          header="Tipo/Razón"
          body={tipoMovimientoBodyTemplate}
          style={{ minWidth: '150px', textAlign: 'center' }}
          headerStyle={{ textAlign: 'center' }}
        />
      </DataTable>
    </div>
  );
};

export default MovimientosTable;