import React, { useState } from 'react';
import { DataTable, DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FacturaDetalle, LazyState } from '@/types/facturas';

interface FacturasTableProps {
  facturas: FacturaDetalle[];
  loading: boolean;
  totalRecords: number;
  lazyState: LazyState;
  onPage: (event: { first: number; rows: number }) => void;
  onSort?: (event: DataTableStateEvent) => void;
}

const FacturasTable: React.FC<FacturasTableProps> = ({
  facturas,
  loading,
  totalRecords,
  lazyState,
  onPage,
  onSort
}) => {
  const [selectedFactura, setSelectedFactura] = useState<FacturaDetalle | null>(null);
  const [showModal, setShowModal] = useState(false);

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const estadoBodyTemplate = (rowData: FacturaDetalle) => {
    const getSeverity = (estado: string) => {
      switch (estado) {
        case 'PAGADA':
          return 'success';
        case 'PENDIENTE':
          return 'warning';
        case 'VENCIDA':
          return 'danger';
        case 'ANULADA':
          return 'secondary';
        default:
          return 'info';
      }
    };

    const getLabel = (estado: string) => {
      switch (estado) {
        case 'PAGADA':
          return 'Pagada';
        case 'PENDIENTE':
          return 'Pendiente';
        case 'VENCIDA':
          return 'Vencida';
        case 'ANULADA':
          return 'Anulada';
        default:
          return estado;
      }
    };

    const mostrarFechaVencimiento = rowData.estado_factura === 'PENDIENTE' || rowData.estado_factura === 'VENCIDA';

    return (
      <div className="flex flex-col gap-1">
        <Tag
          value={getLabel(rowData.estado_factura)}
          severity={getSeverity(rowData.estado_factura)}
          className="text-xs"
        />
        {mostrarFechaVencimiento && rowData.fecha_vencimiento && (
          <small className="text-orange-600">
            Vence: {formatDateOnly(rowData.fecha_vencimiento)}
          </small>
        )}
      </div>
    );
  };

  const tipoBodyTemplate = (rowData: FacturaDetalle) => {
    const getLabel = (tipo: string) => {
      switch (tipo) {
        case 'A':
          return 'A';
        case 'B':
          return 'B';
        case 'C':
          return 'C';
        default:
          return tipo;
      }
    };

    return (
      <Badge
        value={getLabel(rowData.tipo)}
        severity="info"
        className="text-xs"
      />
    );
  };

  const proveedorBodyTemplate = (rowData: FacturaDetalle) => {
    return (
      <span className="font-medium">{rowData.proveedor.nombre_proveedor}</span>
    );
  };

  const ordenBodyTemplate = (rowData: FacturaDetalle) => {
    return rowData.orden_compra ? (
      <span className="font-medium">{rowData.orden_compra.numero_orden}</span>
    ) : (
      <span className="text-gray-500">-</span>
    );
  };

  const detallesBodyTemplate = (rowData: FacturaDetalle) => {
    const handleVerDetalles = () => {
      setSelectedFactura(rowData);
      setShowModal(true);
    };

    const handlePagos = () => {
      // Funcionalidad futura para gestionar pagos
      console.log('Abrir modal de pagos para factura:', rowData.id_factura);
    };

    return (
      <div className="flex gap-1 justify-center">
        <Button
          icon="pi pi-eye"
          className="p-button-text p-button-secondary"
          onClick={handleVerDetalles}
          tooltip="Ver detalles"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-dollar"
          className={rowData.estado_factura === 'PENDIENTE'
            ? "p-button-text p-button-success"
            : "p-button-text p-button-secondary opacity-50"}
          onClick={handlePagos}
          tooltip="Registrar pago"
          tooltipOptions={{ position: 'top' }}
          disabled={rowData.estado_factura !== 'PENDIENTE'}
        />
      </div>
    );
  };

  const onHideModal = () => {
    setShowModal(false);
    setSelectedFactura(null);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg">
      <DataTable
        value={facturas}
        lazy
        dataKey="id_factura"
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
        emptyMessage="No se encontraron facturas"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        rowsPerPageOptions={[5, 10, 15, 30]}
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} facturas"
      >
        <Column
          field="numero_factura"
          header="Nro Factura"
          style={{ minWidth: '130px' }}
          headerStyle={{ textAlign: 'center' }}
          bodyStyle={{ fontWeight: 'bold' }}
        />

        <Column
          field="proveedor.nombre_proveedor"
          header="Proveedor"
          body={proveedorBodyTemplate}
          style={{ minWidth: '200px' }}
          headerStyle={{ textAlign: 'center' }}
        />

        <Column
          field="fecha_carga"
          header="Fecha de Carga"
          sortable
          body={(rowData) => formatDateTime(rowData.fecha_carga)}
          style={{ minWidth: '180px' }}
          headerStyle={{ textAlign: 'center' }}
        />

        <Column
          field="tipo"
          header="Tipo de Factura"
          body={tipoBodyTemplate}
          style={{ minWidth: '120px', textAlign: 'center' }}
          headerStyle={{ textAlign: 'center' }}
          bodyStyle={{ textAlign: 'center' }}
        />

        <Column
          header="Orden Asociada"
          body={ordenBodyTemplate}
          style={{ minWidth: '140px' }}
          headerStyle={{ textAlign: 'center' }}
        />

        <Column
          field="costo_total"
          header="Costo Total"
          sortable
          body={(rowData) => formatCurrency(rowData.costo_total)}
          style={{ minWidth: '140px' }}
          headerStyle={{ textAlign: 'center' }}
          bodyStyle={{ textAlign: 'right', fontWeight: 'bold' }}
        />

        <Column
          field="estado_factura"
          header="Estado"
          body={estadoBodyTemplate}
          style={{ minWidth: '100px', textAlign: 'center' }}
          headerStyle={{ textAlign: 'center' }}
          bodyStyle={{ textAlign: 'center' }}
        />

        <Column
          header="Acciones"
          body={detallesBodyTemplate}
          style={{ minWidth: '120px', textAlign: 'center' }}
          headerStyle={{ textAlign: 'center' }}
          bodyStyle={{ textAlign: 'center' }}
        />
      </DataTable>

      {/* Modal de detalles */}
      <Dialog
        header={`Detalle de factura ${selectedFactura?.numero_factura || ''}`}
        visible={showModal}
        onHide={onHideModal}
        style={{ width: '90vw', maxWidth: '900px' }}
        modal
        draggable={false}
        resizable={false}
      >
        {selectedFactura && (
          <div className="space-y-6">
            {/* Información de la factura en filas */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 py-2 border-b">
                <span className="font-medium text-gray-700">Proveedor:</span>
                <span>{selectedFactura.proveedor.nombre_proveedor}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b">
                <span className="font-medium text-gray-700">CUIT:</span>
                <span>{selectedFactura.proveedor.cuit_proveedor}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b">
                <span className="font-medium text-gray-700">Fecha de alta:</span>
                <span>{formatDateTime(selectedFactura.fecha_carga || null)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b">
                <span className="font-medium text-gray-700">Fecha de emisión:</span>
                <span>{formatDateOnly(selectedFactura.fecha_emision)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b">
                <span className="font-medium text-gray-700">Fecha de vencimiento:</span>
                <span>{formatDateOnly(selectedFactura.fecha_vencimiento)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b">
                <span className="font-medium text-gray-700">Tipo de factura:</span>
                <span>Factura {selectedFactura.tipo}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b">
                <span className="font-medium text-gray-700">Orden asociada:</span>
                <span>{selectedFactura.orden_compra?.numero_orden || 'Sin orden asociada'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b">
                <span className="font-medium text-gray-700">Estado:</span>
                <span>
                  <Tag
                    value={selectedFactura.estado_factura}
                    severity={selectedFactura.estado_factura === 'PAGADA' ? 'success' :
                             selectedFactura.estado_factura === 'PENDIENTE' ? 'warning' :
                             selectedFactura.estado_factura === 'VENCIDA' ? 'danger' : 'secondary'}
                    className="text-xs"
                  />
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b">
                <span className="font-medium text-gray-700">Observaciones:</span>
                <span>{selectedFactura.observaciones || 'Sin observaciones'}</span>
              </div>
            </div>

            {/* Insumos */}
            <div>
              <h4 className="font-semibold mb-3 text-lg">Insumos</h4>

              {/* Encabezados */}
              <div className="grid grid-cols-4 gap-4 py-2 border-b-2 border-gray-300 mb-2">
                <div className="font-medium text-gray-700">Insumo</div>
                <div className="font-medium text-gray-700">Cantidad</div>
                <div className="font-medium text-gray-700">Precio Unitario</div>
                <div className="font-medium text-gray-700">Subtotal</div>
              </div>

              {/* Filas de datos */}
              <div className="space-y-2">
                {selectedFactura.detalles.map((detalle) => (
                  <div key={detalle.id_detalle_factura} className="grid grid-cols-4 gap-4 py-3 border-b border-gray-200">
                    <div>{detalle.insumo.nombre_insumo}</div>
                    <div>{detalle.cantidad} unidades</div>
                    <div className="font-medium text-green-600">{formatCurrency(detalle.precio)}</div>
                    <div className="font-bold text-blue-600">{formatCurrency(detalle.cantidad * detalle.precio)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 py-2">
                <span className="font-bold text-gray-700 text-lg">Total:</span>
                <span className="font-bold text-lg text-blue-600">
                  {formatCurrency(
                    selectedFactura.detalles.reduce((total, detalle) =>
                      total + (detalle.cantidad * detalle.precio), 0
                    )
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default FacturasTable;