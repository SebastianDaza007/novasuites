import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
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
  const [montoPagar, setMontoPagar] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para nota de crédito/débito
  const [showNotaDialog, setShowNotaDialog] = useState(false);
  const [tipoNota, setTipoNota] = useState<'CREDITO' | 'DEBITO' | null>(null);
  const [motivoNota, setMotivoNota] = useState<string>('');
  const [diferencia, setDiferencia] = useState<number>(0);

  const fileUploadRef = useRef<FileUpload>(null);

  const metodosPago = [
    { label: 'Transferencia Bancaria', value: 'transferencia' },
    { label: 'Efectivo', value: 'efectivo' },
    { label: 'Cheque', value: 'cheque' },
    { label: 'Tarjeta de Crédito', value: 'tarjeta_credito' },
    { label: 'Tarjeta de Débito', value: 'tarjeta_debito' }
  ];

  const motivosNotaCredito = [
    { label: 'Descuento aplicado', value: 'descuento' },
    { label: 'Devolución de mercadería', value: 'devolucion' },
    { label: 'Servicios no prestados', value: 'servicios_no_prestados' },
    { label: 'Error de facturación', value: 'error_facturacion' },
    { label: 'Otro', value: 'otro' }
  ];

  const motivosNotaDebito = [
    { label: 'Servicios adicionales', value: 'servicios_adicionales' },
    { label: 'Ajuste de precio', value: 'ajuste_precio' },
    { label: 'Penalidades', value: 'penalidades' },
    { label: 'Intereses por mora', value: 'intereses' },
    { label: 'Otro', value: 'otro' }
  ];

  // Inicializar el monto a pagar con el total de la factura
  useEffect(() => {
    if (factura && visible) {
      setMontoPagar(factura.costo_total);
    }
  }, [factura, visible]);

  // Calcular diferencia cuando cambia el monto a pagar
  useEffect(() => {
    if (factura && montoPagar !== null) {
      const diff = montoPagar - factura.costo_total;
      setDiferencia(diff);

      // Determinar tipo de nota si hay diferencia
      if (diff < 0) {
        setTipoNota('CREDITO');
      } else if (diff > 0) {
        setTipoNota('DEBITO');
      } else {
        setTipoNota(null);
      }
    }
  }, [montoPagar, factura]);

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

  const handleContinuarPago = () => {
    // Si hay diferencia, mostrar el diálogo de nota
    if (diferencia !== 0) {
      setShowNotaDialog(true);
    } else {
      // Si no hay diferencia, procesar pago directamente
      handleRegistrarPago();
    }
  };

  const handleRegistrarPago = async () => {
    if (!factura || !metodoPago || !fechaPago || montoPagar === null) return;

    setLoading(true);

    try {
      const requestBody: {
        id_factura: number;
        metodo_pago: string;
        fecha_pago: string;
        monto_pagado: number;
        nota?: {
          tipo: 'CREDITO' | 'DEBITO';
          monto: number;
          motivo: string;
        };
      } = {
        id_factura: factura.id_factura,
        metodo_pago: metodoPago,
        fecha_pago: fechaPago.toISOString(),
        monto_pagado: montoPagar
      };

      // Si hay diferencia, incluir datos de la nota
      if (diferencia !== 0 && tipoNota && motivoNota) {
        requestBody.nota = {
          tipo: tipoNota,
          monto: Math.abs(diferencia),
          motivo: motivoNota
        };
      }

      const response = await fetch('/api/facturas/registrar-pago', {
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
    setMontoPagar(null);
    setUploadedFile(null);
    setShowNotaDialog(false);
    setMotivoNota('');
    setDiferencia(0);
    setTipoNota(null);
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
        label={diferencia !== 0 ? "Continuar" : "Registrar Pago"}
        icon={diferencia !== 0 ? "pi pi-arrow-right" : "pi pi-check"}
        onClick={handleContinuarPago}
        disabled={!metodoPago || !fechaPago || montoPagar === null || montoPagar <= 0 || loading}
        loading={loading}
      />
    </div>
  );

  const notaDialogFooter = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={() => setShowNotaDialog(false)}
        className="p-button-outlined p-button-secondary"
        disabled={loading}
      />
      <Button
        label="Generar Nota y Registrar Pago"
        icon="pi pi-check"
        onClick={handleRegistrarPago}
        disabled={!motivoNota || loading}
        loading={loading}
      />
    </div>
  );

  return (
    <>
      {/* Diálogo principal de registro de pago */}
      <Dialog
        header="Registrar Pago de Factura"
        visible={visible && !showNotaDialog}
        onHide={handleClose}
        style={{ width: '650px' }}
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
                    <td className="p-3 font-semibold text-gray-700">Importe Factura</td>
                    <td className="p-3 font-bold text-blue-600">{formatCurrency(factura.costo_total)}</td>
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

            {/* Monto a pagar */}
            <div className="space-y-2">
              <label htmlFor="monto-pagar" className="block font-semibold text-gray-700">
                Monto a Pagar <span className="text-red-500">*</span>
              </label>
              <InputNumber
                id="monto-pagar"
                value={montoPagar}
                onValueChange={(e) => setMontoPagar(e.value ?? null)}
                mode="currency"
                currency="ARS"
                locale="es-AR"
                className="w-full"
                min={0}
              />

              {/* Mostrar diferencia si existe */}
              {diferencia !== 0 && (
                <Message
                  severity={diferencia < 0 ? "warn" : "info"}
                  text={
                    diferencia < 0
                      ? `Diferencia de ${formatCurrency(Math.abs(diferencia))} - Se generará Nota de Crédito`
                      : `Diferencia de ${formatCurrency(diferencia)} - Se generará Nota de Débito`
                  }
                  className="w-full"
                />
              )}
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

      {/* Diálogo de Nota de Crédito/Débito */}
      <Dialog
        header={
          <div className="flex items-center gap-2">
            <i className={`pi ${tipoNota === 'CREDITO' ? 'pi-minus-circle text-orange-600' : 'pi-plus-circle text-blue-600'} text-xl`}></i>
            <span>Generar Nota de {tipoNota === 'CREDITO' ? 'Crédito' : 'Débito'}</span>
          </div>
        }
        visible={showNotaDialog}
        onHide={() => setShowNotaDialog(false)}
        style={{ width: '600px' }}
        modal
        footer={notaDialogFooter}
        draggable={false}
        resizable={false}
      >
        {factura && tipoNota && (
          <div className="space-y-6">
            {/* Alerta de diferencia */}
            <Message
              severity={tipoNota === 'CREDITO' ? "warn" : "info"}
              className="w-full"
              content={
                <div className="flex flex-col gap-2">
                  <div className="font-semibold">
                    Se ha detectado una diferencia en el monto de pago
                  </div>
                  <div className="text-sm">
                    {tipoNota === 'CREDITO'
                      ? 'El monto a pagar es menor que el importe de la factura. Se generará una Nota de Crédito automáticamente.'
                      : 'El monto a pagar es mayor que el importe de la factura. Se generará una Nota de Débito automáticamente.'}
                  </div>
                </div>
              }
            />

            {/* Información de la nota */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-3">Detalle de la Nota</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Factura Nro:</span>
                  <span className="font-medium">{factura.numero_factura}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Importe Factura:</span>
                  <span className="font-medium">{formatCurrency(factura.costo_total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Monto a Pagar:</span>
                  <span className="font-medium">{formatCurrency(montoPagar || 0)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-semibold text-gray-700">
                    Monto de la Nota de {tipoNota === 'CREDITO' ? 'Crédito' : 'Débito'}:
                  </span>
                  <span className={`font-bold ${tipoNota === 'CREDITO' ? 'text-orange-600' : 'text-blue-600'}`}>
                    {formatCurrency(Math.abs(diferencia))}
                  </span>
                </div>
              </div>
            </div>

            {/* Motivo de la nota */}
            <div className="space-y-2">
              <label htmlFor="motivo-nota" className="block font-semibold text-gray-700">
                Motivo de la Nota <span className="text-red-500">*</span>
              </label>
              <Dropdown
                id="motivo-nota"
                value={motivoNota}
                onChange={(e) => setMotivoNota(e.value)}
                options={tipoNota === 'CREDITO' ? motivosNotaCredito : motivosNotaDebito}
                placeholder="Selecciona el motivo"
                className="w-full"
              />
            </div>

            {/* Observaciones adicionales si el motivo es "Otro" */}
            {motivoNota === 'otro' && (
              <div className="space-y-2">
                <label htmlFor="observaciones-nota" className="block font-semibold text-gray-700">
                  Especificar motivo
                </label>
                <InputTextarea
                  id="observaciones-nota"
                  rows={3}
                  className="w-full"
                  placeholder="Describe el motivo de la nota..."
                />
              </div>
            )}

            {/* Información importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex gap-2">
                <i className="pi pi-info-circle text-blue-600 mt-1"></i>
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Información:</p>
                  <p>La nota se generará automáticamente al confirmar el registro del pago y quedará asociada a esta factura.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default RegistrarPagoDialog;
