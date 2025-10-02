import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { FileUpload, FileUploadHeaderTemplateOptions, ItemTemplateOptions } from 'primereact/fileupload';
import { FacturaDetalle } from '@/types/facturas';

interface RegistrarPagoDialogProps {
  visible: boolean;
  factura: FacturaDetalle | null;
  onHide: () => void;
  onPagoRegistrado?: () => void;
}

const RegistrarPagoDialog: React.FC<RegistrarPagoDialogProps> = ({
  visible,
  factura,
  onHide,
  onPagoRegistrado
}) => {
  const [metodoPago, setMetodoPago] = useState<string | null>(null);
  const [fechaPago, setFechaPago] = useState<Date | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
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

  const getTipoFacturaLabel = (tipo: string) => {
    return `Factura ${tipo}`;
  };

  const handleFileSelect = (e: { files: File[] }) => {
    if (e.files && e.files.length > 0) {
      const file = e.files[0];
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
      }
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };

  const handleRegistrarPago = async () => {
    if (!factura || !metodoPago || !fechaPago) return;

    setLoading(true);

    try {
      const response = await fetch('/api/facturas/registrar-pago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_factura: factura.id_factura,
          metodo_pago: metodoPago,
          fecha_pago: fechaPago.toISOString()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Notificar al componente padre para refrescar los datos
        if (onPagoRegistrado) {
          onPagoRegistrado();
        }
        handleClose();
      } else {
        console.error('Error al registrar el pago:', data.message);
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMetodoPago(null);
    setFechaPago(null);
    setUploadedFile(null);
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
          label="Limpiar"
          icon="pi pi-times"
          onClick={handleClearFile}
          className="p-button-outlined p-button-danger p-button-sm"
          disabled={!uploadedFile}
        />
      </div>
    );
  };

  const itemTemplate = (file: object, props: ItemTemplateOptions) => {
    const fileObj = file as File;
    return (
      <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
        <i className="pi pi-file-pdf text-4xl text-red-500"></i>
        <div className="flex-1">
          <div className="font-medium">{fileObj.name}</div>
          <small className="text-gray-600">{(fileObj.size / 1024).toFixed(2)} KB</small>
        </div>
        <Button
          icon="pi pi-times"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={handleClearFile}
        />
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <i className="pi pi-cloud-upload text-5xl text-gray-400 mb-3"></i>
        <p className="text-gray-600 mb-2">Arrastra y suelta archivos PDF aquí</p>
        <small className="text-gray-500">o haz clic en "Subir" para seleccionar</small>
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
        label="Registrar Pago"
        icon="pi pi-check"
        onClick={handleRegistrarPago}
        disabled={!metodoPago || !fechaPago || loading}
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      header="Registrar Pago de Factura"
      visible={visible}
      onHide={handleClose}
      style={{ width: '600px' }}
      modal
      footer={dialogFooter}
      draggable={false}
      resizable={false}
    >
      {factura && (
        <div className="space-y-6">
          {/* Tabla de información de la factura */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                <tr className="border-b bg-gray-50">
                  <td className="p-3 font-semibold text-gray-700 w-1/2">Orden Asociada</td>
                  <td className="p-3">{factura.orden_compra?.numero_orden || 'Sin orden asociada'}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-semibold text-gray-700">Importe pagado</td>
                  <td className="p-3 font-bold text-green-600">{formatCurrency(factura.costo_total)}</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3 font-semibold text-gray-700">Proveedor</td>
                  <td className="p-3">{factura.proveedor.nombre_proveedor}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-gray-700">Tipo de factura</td>
                  <td className="p-3">{getTipoFacturaLabel(factura.tipo)}</td>
                </tr>
              </tbody>
            </table>
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
              Adjuntar Comprobante (PDF)
            </label>
            <FileUpload
              ref={fileUploadRef}
              name="comprobante"
              accept="application/pdf"
              maxFileSize={5000000}
              onSelect={handleFileSelect}
              headerTemplate={headerTemplate}
              itemTemplate={uploadedFile ? itemTemplate : undefined}
              emptyTemplate={emptyTemplate}
              chooseLabel="Subir"
              chooseOptions={{
                icon: 'pi pi-upload',
                className: 'p-button-sm'
              }}
              auto={false}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default RegistrarPagoDialog;
