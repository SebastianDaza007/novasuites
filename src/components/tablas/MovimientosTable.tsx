import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { MovimientoDetalle, LazyState } from '@/types/movimientos';

interface MovimientosTableProps {
  movimientos: MovimientoDetalle[];
  loading: boolean;
  totalRecords: number;
  lazyState: LazyState;
  globalFilter: string;
  onPage: (event: { first: number; rows: number }) => void;
}

const MovimientosTable: React.FC<MovimientosTableProps> = ({
  movimientos,
  loading,
  totalRecords,
  lazyState,
  globalFilter,
  onPage
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  const estadoBodyTemplate = (rowData: MovimientoDetalle) => {
    const estado = rowData.movimiento.estado_movimiento;
    const severity = estado === 'COMPLETADO' ? 'success' : 
                    estado === 'PENDIENTE' ? 'warning' : 'danger';
    return <Tag value={estado} severity={severity} />;
  };

  const tipoMovimientoBodyTemplate = (rowData: MovimientoDetalle) => {
    const tipo = rowData.movimiento.tipo_movimiento;
    const color = tipo.afecta_stock === 'POSITIVO' ? 'success' : 
                 tipo.afecta_stock === 'NEGATIVO' ? 'danger' : 'info';
    return <Tag value={tipo.nombre_tipo} severity={color} />;
  };

  const depositoBodyTemplate = (rowData: MovimientoDetalle) => {
    const origen = rowData.movimiento.deposito_origen?.nom_deposito;
    const destino = rowData.movimiento.deposito_destino?.nom_deposito;
    
    if (origen && destino) {
      return `${origen} → ${destino}`;
    } else if (origen) {
      return `Salida: ${origen}`;
    } else if (destino) {
      return `Entrada: ${destino}`;
    }
    return '-';
  };

  return (
    <DataTable
      value={movimientos}
      lazy
      dataKey="id_detalle"
      paginator
      first={lazyState.first}
      rows={lazyState.rows}
      totalRecords={totalRecords}
      onPage={onPage}
      loading={loading}
      stripedRows
      showGridlines
      size="small"
      scrollable
      className="p-datatable-sm"
      emptyMessage="No se encontraron movimientos"
      globalFilter={globalFilter}
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      rowsPerPageOptions={[10, 20, 50]}
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} movimientos"
    >
      <Column
        field="movimiento.fecha_movimiento"
        header="Fecha"
        sortable
        body={(rowData) => formatDate(rowData.movimiento.fecha_movimiento)}
        style={{ minWidth: '150px' }}
      />
      <Column
        field="insumo.nombre_insumo"
        header="Insumo"
        sortable
        style={{ minWidth: '200px' }}
      />
      <Column
        field="movimiento.tipo_movimiento.nombre_tipo"
        header="Tipo Movimiento"
        body={tipoMovimientoBodyTemplate}
        style={{ minWidth: '150px' }}
      />
      <Column
        header="Depósitos"
        body={depositoBodyTemplate}
        style={{ minWidth: '200px' }}
      />
      <Column
        field="cantidad"
        header="Cantidad"
        sortable
        style={{ minWidth: '100px', textAlign: 'center' }}
        bodyStyle={{ textAlign: 'center' }}
      />
      <Column
        field="costo_unitario"
        header="Costo Unit."
        body={(rowData) => formatCurrency(rowData.costo_unitario)}
        style={{ minWidth: '120px', textAlign: 'right' }}
        bodyStyle={{ textAlign: 'right' }}
      />
      <Column
        field="lote"
        header="Lote"
        body={(rowData) => rowData.lote || '-'}
        style={{ minWidth: '100px' }}
      />
      <Column
        field="movimiento.numero_comprobante"
        header="Comprobante"
        body={(rowData) => rowData.movimiento.numero_comprobante || '-'}
        style={{ minWidth: '120px' }}
      />
      <Column
        field="movimiento.estado_movimiento"
        header="Estado"
        body={estadoBodyTemplate}
        style={{ minWidth: '100px', textAlign: 'center' }}
        bodyStyle={{ textAlign: 'center' }}
      />
    </DataTable>
  );
};

export default MovimientosTable;