import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { FileUpload, FileUploadHeaderTemplateOptions, ItemTemplateOptions } from 'primereact/fileupload';
import { FacturaDetalle } from '@/types/facturas';

interface PagarTodasDialogProps {
  visible: boolean;
  proveedor: string;
  facturas: FacturaDetalle[];
  onHide: () => void;
  onPagoRegistrado?: () => void;
}

const PagarTodasDialog: React.FC<PagarTodasDialogProps> = ({
  visible,
  proveedor,
  facturas,
  onHide,
  onPagoRegistrado
}) => {
  const [metodoPago, setMetodoPago] = useState<string | null>(null);
  const [fechaPago, setFechaPago] = useState<Date | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const fileUploadRef = useRef<FileUpload>(null);

  const metodosPago = [
    { label: 'Transferencia Bancaria', value: 'transferencia' },
    { label: 'Efectivo', value: 'efectivo' },
    { label: 'Cheque', value: 'cheque' },
    { label: 'Tarjeta de Crédito', value: 'tarjeta_credito' },
    { label: 'Tarjeta de Débito', value: 'tarjeta_debito' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-AR');
  };

  const getTipoFacturaLabel = (tipo: string) => {
    return `Factura ${tipo}`;
  };

  const getEstadoTag = (estado: string) => {
    const estados: Record<string, { severity: 'success' | 'warning' | 'danger' | 'info', label: string }> = {
      PENDIENTE: { severity: 'warning', label: 'Pendiente' },
      PAGADA: { severity: 'success', label: 'Pagada' },
      VENCIDA: { severity: 'danger', label: 'Vencida' },
      ANULADA: { severity: 'info', label: 'Anulada' }
    };
    const config = estados[estado] || { severity: 'info', label: estado };
    return <Tag severity={config.severity} value={config.label} />;
  };

  const totalAPagar = facturas.reduce((sum, factura) => sum + factura.costo_total, 0);
  const cantidadFacturas = facturas.length;

  const handleRegistrarPago = async () => {
    if (!metodoPago || !fechaPago || facturas.length === 0) return;

    setLoading(true);

    try {
      const requestBody = {
        id_facturas: facturas.map(f => f.id_factura),
        metodo_pago: metodoPago,
        fecha_pago: fechaPago.toISOString()
      };

      const response = await fetch('/api/facturas/pagar-todas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (onPagoRegistrado) {
          onPagoRegistrado();
        }
        handleClose();
      } else {
        console.error('Error al registrar los pagos:', data.message);
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: { files: File[] }) => {
    if (e.files && e.files.length > 0) {
      const validFiles = Array.from(e.files).filter(file => file.type === 'application/pdf');
      setUploadedFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setUploadedFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  const handleClearAllFiles = () => {
    setUploadedFiles([]);
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };

  const handleClose = () => {
    setMetodoPago(null);
    setFechaPago(null);
    setUploadedFiles([]);
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
    onHide();
  };

  const headerTemplate = (options: FileUploadHeaderTemplateOptions) => {
    const { chooseButton } = options;

    return (
      <div className="flex gap-2 items-center">
        {chooseButton}
        <Button
          label="Limpiar Todo"
          icon="pi pi-times"
          onClick={handleClearAllFiles}
          className="p-button-outlined p-button-danger p-button-sm"
          disabled={uploadedFiles.length === 0}
        />
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <i className="pi pi-cloud-upload text-5xl text-gray-400 mb-3"></i>
        <p className="text-gray-600 mb-2">Arrastra y suelta archivos PDF aquí</p>
        <small className="text-gray-500">o haz clic en &quot;Subir&quot; para seleccionar</small>
      </div>
    );
  };

  const dialogFooter = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={handleClose}
        className="p-button-outlined p-button-secondary"
        disabled={loading}
      />
      <Button
        label="Registrar Pagos"
        icon="pi pi-check"
        onClick={handleRegistrarPago}
        disabled={!metodoPago || !fechaPago || loading}
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      header={`Pagar Todas las Facturas - ${proveedor}`}
      visible={visible}
      onHide={handleClose}
      style={{ width: '900px' }}
      modal
      footer={dialogFooter}
      draggable={false}
      resizable={false}
    >
      <div className="space-y-6">
        {/* Resumen de pago */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cantidad de Facturas</p>
              <p className="text-2xl font-bold text-blue-900">{cantidadFacturas}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total a Pagar</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalAPagar)}</p>
            </div>
          </div>
        </div>

        {/* Método de pago */}
        <div className="space-y-2">
          <label htmlFor="metodo-pago" className="block font-semibold text-gray-700">
            Método de Pago <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="metodo-pago"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.value)}
            options={metodosPago}
            placeholder="Selecciona un método de pago"
            className="w-full"
          />
        </div>

        {/* Fecha de pago */}
        <div className="space-y-2">
          <label htmlFor="fecha-pago" className="block font-semibold text-gray-700">
            Fecha de Pago <span className="text-red-500">*</span>
          </label>
          <Calendar
            id="fecha-pago"
            value={fechaPago}
            onChange={(e) => setFechaPago(e.value as Date)}
            placeholder="Selecciona la fecha de pago"
            dateFormat="dd/mm/yy"
            showIcon
            className="w-full"
            maxDate={new Date()}
          />
        </div>

        {/* Carga de archivos */}
        <div className="space-y-2">
          <label className="block font-semibold text-gray-700">
            Adjuntar Comprobantes (PDF)
          </label>
          <FileUpload
            ref={fileUploadRef}
            name="comprobantes"
            accept="application/pdf"
            maxFileSize={5000000}
            multiple
            onSelect={handleFileSelect}
            headerTemplate={headerTemplate}
            emptyTemplate={emptyTemplate}
            chooseLabel="Subir"
            chooseOptions={{
              icon: 'pi pi-upload',
              className: 'p-button-sm'
            }}
            auto={false}
          />

          {/* Lista de archivos cargados */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2 mt-3">
              <p className="text-sm font-medium text-gray-700">
                Archivos adjuntos ({uploadedFiles.length})
              </p>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
                  <i className="pi pi-file-pdf text-3xl text-red-500"></i>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{file.name}</div>
                    <small className="text-gray-600">{(file.size / 1024).toFixed(2)} KB</small>
                  </div>
                  <Button
                    icon="pi pi-times"
                    className="p-button-rounded p-button-text p-button-danger p-button-sm"
                    onClick={() => handleRemoveFile(file)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acordeón de facturas */}
        <div className="space-y-2">
          <label className="block font-semibold text-gray-700">
            Detalle de Facturas ({cantidadFacturas})
          </label>
          <Accordion multiple className="max-h-96 overflow-y-auto">
            {facturas.map((factura, index) => (
              <AccordionTab
                key={factura.id_factura}
                header={
                  <div className="flex justify-between items-center w-full pr-4">
                    <span className="font-medium">
                      {factura.numero_factura} - {getTipoFacturaLabel(factura.tipo)}
                    </span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(factura.costo_total)}
                    </span>
                  </div>
                }
              >
                <div className="space-y-4">
                  {/* Información general */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Orden de Compra:</p>
                      <p className="font-medium">
                        {factura.orden_compra?.numero_orden || 'Sin orden asociada'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Estado:</p>
                      <div className="mt-1">{getEstadoTag(factura.estado_factura)}</div>
                    </div>
                    <div>
                      <p className="text-gray-600">Fecha Emisión:</p>
                      <p className="font-medium">{formatDate(factura.fecha_emision)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fecha Vencimiento:</p>
                      <p className="font-medium">{formatDate(factura.fecha_vencimiento)}</p>
                    </div>
                  </div>

                  {/* Tabla de detalles */}
                  {factura.detalles && factura.detalles.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Items de la Factura:</p>
                      <DataTable
                        value={factura.detalles}
                        size="small"
                        className="text-sm"
                      >
                        <Column
                          header="Insumo"
                          body={(rowData) => rowData.insumo.nombre_insumo}
                        />
                        <Column
                          field="cantidad"
                          header="Cantidad"
                          body={(rowData) => rowData.cantidad.toLocaleString('es-AR')}
                        />
                        <Column
                          field="precio"
                          header="Precio Unit."
                          body={(rowData) => formatCurrency(rowData.precio)}
                        />
                        <Column
                          header="Subtotal"
                          body={(rowData) => formatCurrency(rowData.cantidad * rowData.precio)}
                        />
                      </DataTable>
                    </div>
                  )}
                </div>
              </AccordionTab>
            ))}
          </Accordion>
        </div>
      </div>
    </Dialog>
  );
};

export default PagarTodasDialog;
