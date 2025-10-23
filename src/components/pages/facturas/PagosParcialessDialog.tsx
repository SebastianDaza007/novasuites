import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { FileUpload } from 'primereact/fileupload';
import { FacturaDetalle } from '@/types/facturas';

interface PagosParcialessDialogProps {
  visible: boolean;
  onHide: () => void;
  onPagoRegistrado?: () => void;
}

const PagosParcialessDialog: React.FC<PagosParcialessDialogProps> = ({
  visible,
  onHide,
  onPagoRegistrado
}) => {
  const [facturasDisponibles, setFacturasDisponibles] = useState<FacturaDetalle[]>([]);
  const [facturasSeleccionadas, setFacturasSeleccionadas] = useState<FacturaDetalle[]>([]);
  const [metodoPago, setMetodoPago] = useState<string | null>(null);
  const [fechaPago, setFechaPago] = useState<Date | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFacturas, setLoadingFacturas] = useState(false);
  const [proveedorFiltro, setProveedorFiltro] = useState<number | null>(null);

  const fileUploadRef = useRef<FileUpload>(null);

  // Fetch facturas pendientes cuando el dialog se abre
  useEffect(() => {
    const fetchFacturasPendientes = async () => {
      if (!visible) return;

      setLoadingFacturas(true);
      try {
        const response = await fetch('/api/facturas');
        const data = await response.json();

        if (data.success && data.data) {
          // Filtrar solo facturas pendientes
          const pendientes = data.data.filter((f: FacturaDetalle) => f.estado_factura === 'PENDIENTE');
          setFacturasDisponibles(pendientes);
        }
      } catch (error) {
        console.error('Error al cargar facturas:', error);
      } finally {
        setLoadingFacturas(false);
      }
    };

    fetchFacturasPendientes();
  }, [visible]);

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

  const totalAPagar = facturasSeleccionadas.reduce((sum, factura) => sum + factura.costo_total, 0);

  // Obtener lista única de proveedores
  const proveedoresUnicos = useMemo(() => {
    const proveedoresMap = new Map<number, { id_proveedor: number; nombre_proveedor: string }>();
    facturasDisponibles.forEach(factura => {
      if (!proveedoresMap.has(factura.proveedor.id_proveedor)) {
        proveedoresMap.set(factura.proveedor.id_proveedor, {
          id_proveedor: factura.proveedor.id_proveedor,
          nombre_proveedor: factura.proveedor.nombre_proveedor
        });
      }
    });
    return Array.from(proveedoresMap.values());
  }, [facturasDisponibles]);

  // Filtrar facturas por proveedor
  const facturasFiltradas = useMemo(() => {
    if (!proveedorFiltro) return facturasDisponibles;
    return facturasDisponibles.filter(f => f.proveedor.id_proveedor === proveedorFiltro);
  }, [facturasDisponibles, proveedorFiltro]);

  const handleRegistrarPago = async () => {
    if (!metodoPago || !fechaPago || facturasSeleccionadas.length === 0) return;

    setLoading(true);

    try {
      const requestBody = {
        id_facturas: facturasSeleccionadas.map(f => f.id_factura),
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
    setFacturasSeleccionadas([]);
    setMetodoPago(null);
    setFechaPago(null);
    setUploadedFiles([]);
    setProveedorFiltro(null);
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
    onHide();
  };

  const headerTemplate = (options: { chooseButton: React.ReactNode; uploadButton: React.ReactNode; cancelButton: React.ReactNode }) => {
    return (
      <div className="flex gap-2 items-center">
        {options.chooseButton}
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
        disabled={!metodoPago || !fechaPago || facturasSeleccionadas.length === 0 || loading}
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      header="Realizar Pagos Parciales"
      visible={visible}
      onHide={handleClose}
      style={{ width: '1100px' }}
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
              <p className="text-sm text-gray-600 mb-1">Facturas Seleccionadas</p>
              <p className="text-2xl font-bold text-blue-900">{facturasSeleccionadas.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total a pagar</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalAPagar)}</p>
            </div>
          </div>
        </div>

        {/* Filtro por proveedor */}
        <div className="space-y-2">
          <label htmlFor="proveedor-filtro" className="block font-semibold text-gray-700">
            Filtrar por Proveedor
          </label>
          <Dropdown
            id="proveedor-filtro"
            value={proveedorFiltro}
            onChange={(e) => setProveedorFiltro(e.value)}
            options={proveedoresUnicos}
            optionLabel="nombre_proveedor"
            optionValue="id_proveedor"
            placeholder="Todos los proveedores"
            className="w-full"
            showClear
            filter
            filterPlaceholder="Buscar proveedor..."
          />
        </div>

        {/* Tabla de facturas con selección múltiple */}
        <div className="space-y-2">
          <label className="block font-semibold text-gray-700">
            Facturas Pendientes ({facturasFiltradas.length})
          </label>
          <DataTable
            value={facturasFiltradas}
            selection={facturasSeleccionadas}
            onSelectionChange={(e) => {
              const selected = Array.isArray(e.value) ? e.value : [];
              setFacturasSeleccionadas(selected as FacturaDetalle[]);
            }}
            selectionMode="multiple"
            dataKey="id_factura"
            scrollable
            scrollHeight="400px"
            size="small"
            stripedRows
            loading={loadingFacturas}
            emptyMessage="No hay facturas pendientes"
          >
            <Column
              selectionMode="multiple"
              style={{ width: '3rem' }}
              frozen
            />
            <Column
              field="numero_factura"
              header="Número"
              style={{ minWidth: '150px' }}
            />
            <Column
              field="proveedor.nombre_proveedor"
              header="Proveedor"
              style={{ minWidth: '200px' }}
            />
            <Column
              body={(rowData) => getTipoFacturaLabel(rowData.tipo)}
              header="Tipo"
              style={{ minWidth: '100px' }}
            />
            <Column
              body={(rowData) => formatDate(rowData.fecha_emision)}
              header="F. Emisión"
              style={{ minWidth: '120px' }}
            />
            <Column
              field="fecha_vencimiento"
              body={(rowData) => formatDate(rowData.fecha_vencimiento)}
              header="F. Vencimiento"
              sortable
              style={{ minWidth: '120px' }}
            />
            <Column
              body={(rowData) => getEstadoTag(rowData.estado_factura)}
              header="Estado"
              style={{ minWidth: '120px' }}
            />
            <Column
              field="costo_total"
              body={(rowData) => formatCurrency(rowData.costo_total)}
              header="Monto"
              sortable
              style={{ minWidth: '120px' }}
              align="right"
            />
          </DataTable>
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
      </div>
    </Dialog>
  );
};

export default PagosParcialessDialog;
