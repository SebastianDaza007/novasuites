import React, { useState, useMemo } from 'react';
import { DataTable, DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { MovimientoDetalle, LazyState } from '@/types/movimientos';

interface MovimientosTableProps {
  movimientos: MovimientoDetalle[];
  loading: boolean;
  totalRecords: number;
  lazyState: LazyState;
  onPage: (event: { first: number; rows: number }) => void;
  onSort?: (event: DataTableStateEvent) => void;
}

interface MovimientoAgrupado {
  id_movimiento: number;
  fecha_movimiento: string;
  deposito: any;
  numero_comprobante: string | null;
  razon_movimiento: any;
  observaciones: string | null;
  usuario: any;
  detalles: MovimientoDetalle[];
}

const MovimientosTable: React.FC<MovimientosTableProps> = ({
  movimientos,
  loading,
  totalRecords,
  lazyState,
  onPage,
  onSort
}) => {
  const [selectedMovimiento, setSelectedMovimiento] = useState<MovimientoAgrupado | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Agrupar movimientos por id_movimiento
  const movimientosAgrupados = useMemo(() => {
    const grupos = new Map<number, MovimientoAgrupado>();

    movimientos.forEach((detalle) => {
      const idMov = detalle.movimiento.id_movimiento;

      if (!grupos.has(idMov)) {
        grupos.set(idMov, {
          id_movimiento: idMov,
          fecha_movimiento: detalle.movimiento.fecha_movimiento,
          deposito: detalle.movimiento.deposito,
          numero_comprobante: detalle.movimiento.numero_comprobante,
          razon_movimiento: detalle.movimiento.razon_movimiento,
          observaciones: detalle.movimiento.observaciones,
          usuario: detalle.movimiento.usuario,
          detalles: []
        });
      }

      grupos.get(idMov)!.detalles.push(detalle);
    });

    return Array.from(grupos.values());
  }, [movimientos]);

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

  const tipoMovimientoBodyTemplate = (rowData: MovimientoAgrupado) => {
    const razonMovimiento = rowData.razon_movimiento;
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

  const depositoBodyTemplate = (rowData: MovimientoAgrupado) => {
    const deposito = rowData.deposito;
    if (!deposito) return '-';

    return (
      <div className="flex flex-col gap-1">
        <span className="font-medium">{deposito.nombre_deposito}</span>
      </div>
    );
  };

  const detallesBodyTemplate = (rowData: MovimientoAgrupado) => {
    const handleVerDetalles = () => {
      setSelectedMovimiento(rowData);
      setShowDialog(true);
    };

    return (
      <div className="flex justify-center">
        <Button
          icon="pi pi-eye"
          className="p-button-text p-button-secondary"
          onClick={handleVerDetalles}
          tooltip="Ver detalles"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  const onHideDialog = () => {
    setShowDialog(false);
    setSelectedMovimiento(null);
  };

  const getCantidadSeverity = (tipo: string) => {
    if (tipo === 'ALTA' || tipo === 'TRANSFERENCIA_ENTRADA') return 'success';
    if (tipo === 'BAJA' || tipo === 'TRANSFERENCIA_SALIDA') return 'danger';
    return 'info';
  };

  return (
    <div className="bg-white shadow-lg rounded-lg">
      <DataTable
        value={movimientosAgrupados}
        lazy
        dataKey="id_movimiento"
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
          field="id_movimiento"
          header="#Nro Mov"
          sortable
          body={(rowData) => rowData.id_movimiento}
          style={{ minWidth: '100px', textAlign: 'center' }}
          bodyStyle={{ textAlign: 'center', fontWeight: 'bold' }}
          headerStyle={{ textAlign: 'center' }}
        />

        <Column
          field="fecha_movimiento"
          header="Fecha y Hora"
          sortable
          body={(rowData) => formatDate(rowData.fecha_movimiento)}
          style={{ minWidth: '180px' }}
          headerStyle={{ textAlign: 'center' }}
        />

        <Column
          header="Depósito"
          body={depositoBodyTemplate}
          style={{ minWidth: '180px' }}
          headerStyle={{ textAlign: 'center' }}
        />

        <Column
          field="numero_comprobante"
          header="Comprobante"
          body={(rowData) => rowData.numero_comprobante || '-'}
          style={{ minWidth: '150px' }}
          headerStyle={{ textAlign: 'center' }}
        />

        <Column
          header="Tipo/Razón"
          body={tipoMovimientoBodyTemplate}
          style={{ minWidth: '180px', textAlign: 'center' }}
          headerStyle={{ textAlign: 'center' }}
        />

        <Column
          header="Detalles"
          body={detallesBodyTemplate}
          style={{ minWidth: '100px', textAlign: 'center' }}
          headerStyle={{ textAlign: 'center' }}
          bodyStyle={{ textAlign: 'center' }}
        />
      </DataTable>

      {/* Diálogo de detalles del movimiento */}
      <Dialog
        header={`Detalle del Movimiento #${selectedMovimiento?.id_movimiento || ''}`}
        visible={showDialog}
        onHide={onHideDialog}
        style={{ width: '90vw', maxWidth: '1000px' }}
        modal
        draggable={false}
        resizable={false}
      >
        {selectedMovimiento && (
          <div className="space-y-6">
            {/* Información general del movimiento */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b">
                <h3 className="font-semibold text-gray-800">Información del Movimiento</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 py-2 border-b">
                  <span className="font-medium text-gray-700">Número de Movimiento:</span>
                  <span className="font-bold text-blue-600">#{selectedMovimiento.id_movimiento}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-b">
                  <span className="font-medium text-gray-700">Fecha y Hora:</span>
                  <span>{formatDate(selectedMovimiento.fecha_movimiento)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-b">
                  <span className="font-medium text-gray-700">Tipo de Movimiento:</span>
                  <span>{tipoMovimientoBodyTemplate(selectedMovimiento)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-b">
                  <span className="font-medium text-gray-700">Depósito:</span>
                  <span>{selectedMovimiento.deposito?.nombre_deposito || '-'}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-b">
                  <span className="font-medium text-gray-700">Número de Comprobante:</span>
                  <span>{selectedMovimiento.numero_comprobante || '-'}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-b">
                  <span className="font-medium text-gray-700">Usuario Responsable:</span>
                  <span>{selectedMovimiento.usuario.email}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2">
                  <span className="font-medium text-gray-700">Observaciones:</span>
                  <span>{selectedMovimiento.observaciones || '-'}</span>
                </div>
              </div>
            </div>

            {/* Tabla de insumos del movimiento */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b">
                <h3 className="font-semibold text-gray-800">
                  Insumos del Movimiento ({selectedMovimiento.detalles.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Insumo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Categoría
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Lote
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Vencimiento
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedMovimiento.detalles.map((detalle, index) => (
                      <tr key={detalle.id_detalle} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-gray-900">
                              {detalle.insumo.nombre_insumo}
                            </span>
                            {detalle.insumo.descripcion_insumo && (
                              <small className="text-gray-500 italic">
                                {detalle.insumo.descripcion_insumo}
                              </small>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {detalle.insumo.categoria.nombre_categoria}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            value={detalle.cantidad}
                            severity={getCantidadSeverity(selectedMovimiento.razon_movimiento?.tipo_movimiento)}
                            className="text-sm font-bold"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {detalle.lote ? (
                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {detalle.lote}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {detalle.fecha_vencimiento ? (
                            <span className="text-orange-600 font-medium text-sm">
                              {formatDateOnly(detalle.fecha_vencimiento)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default MovimientosTable;
