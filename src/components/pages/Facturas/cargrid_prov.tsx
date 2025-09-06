"use client";

import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Paginator } from 'primereact/paginator';

interface Factura {
  id: number;
  numeroFactura: string;
  proveedor: string;
  fechaEmision: Date | null;
  fechaVencimiento: Date | null;
  monto: number;
  moneda: string;
  estadoPago: 'pendiente' | 'pagado';
  descripcion?: string;
}

interface CardGridProvProps {
  className?: string;
}

export default function CardGridProv({ className = "" }: CardGridProvProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [selectedEstado, setSelectedEstado] = useState(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(9);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  
  const [facturas, setFacturas] = useState<Factura[]>([
    {
      id: 1,
      numeroFactura: "FAC-001",
      proveedor: "Proveedor Higienix",
      fechaEmision: new Date('2024-01-15'),
      fechaVencimiento: new Date('2024-02-15'),
      monto: 15000,
      moneda: "ARS",
      estadoPago: 'pendiente'
    },
    {
      id: 2,
      numeroFactura: "FAC-002",
      proveedor: "Proveedor DecoHome",
      fechaEmision: new Date('2024-01-10'),
      fechaVencimiento: new Date('2024-02-10'),
      monto: 25000,
      moneda: "ARS",
      estadoPago: 'pagado'
    },
    {
      id: 3,
      numeroFactura: "FAC-003",
      proveedor: "Proveedor TechHotel",
      fechaEmision: new Date('2024-01-20'),
      fechaVencimiento: new Date('2024-02-20'),
      monto: 8500,
      moneda: "ARS",
      estadoPago: 'pendiente'
    },
    {
      id: 4,
      numeroFactura: "FAC-004",
      proveedor: "Proveedor EDESA",
      fechaEmision: new Date('2024-01-25'),
      fechaVencimiento: new Date('2024-02-25'),
      monto: 12000,
      moneda: "ARS",
      estadoPago: 'pagado'
    },
    {
      id: 5,
      numeroFactura: "FAC-005",
      proveedor: "Proveedor Gasnor",
      fechaEmision: new Date('2024-01-30'),
      fechaVencimiento: new Date('2024-03-01'),
      monto: 18500,
      moneda: "ARS",
      estadoPago: 'pendiente'
    },
    {
      id: 6,
      numeroFactura: "FAC-006",
      proveedor: "Proveedor Aguas del Norte",
      fechaEmision: new Date('2024-02-05'),
      fechaVencimiento: new Date('2024-03-05'),
      monto: 22000,
      moneda: "ARS",
      estadoPago: 'pendiente'
    }
  ]);

  const [formData, setFormData] = useState({
    numeroFactura: '',
    proveedor: '',
    fechaEmision: null as Date | null,
    fechaVencimiento: null as Date | null,
    monto: 0,
    moneda: 'ARS',
    estadoPago: 'pendiente' as 'pendiente' | 'pagado',
    descripcion: ''
  });

  const proveedores = [
    { label: 'Proveedor ABC', value: 'Proveedor ABC' },
    { label: 'Proveedor XYZ', value: 'Proveedor XYZ' },
    { label: 'Proveedor DEF', value: 'Proveedor DEF' },
    { label: 'Proveedor GHI', value: 'Proveedor GHI' }
  ];

  const estadosPago = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Pagado', value: 'pagado' }
  ];

  const monedas = [
    { label: 'ARS', value: 'ARS' },
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' }
  ];

  // Calculate financial summary
  const totalPendiente = facturas
    .filter(f => f.estadoPago === 'pendiente')
    .reduce((sum, f) => sum + f.monto, 0);
  
  const totalPagado = facturas
    .filter(f => f.estadoPago === 'pagado')
    .reduce((sum, f) => sum + f.monto, 0);

  // Calculate balance by provider
  const saldoPorProveedor = facturas.reduce((acc, factura) => {
    if (!acc[factura.proveedor]) {
      acc[factura.proveedor] = { pendiente: 0, pagado: 0 };
    }
    if (factura.estadoPago === 'pendiente') {
      acc[factura.proveedor].pendiente += factura.monto;
    } else {
      acc[factura.proveedor].pagado += factura.monto;
    }
    return acc;
  }, {} as Record<string, { pendiente: number; pagado: number }>);

  // Filter facturas
  const filteredFacturas = facturas.filter(factura => {
    const matchesSearch = factura.numeroFactura.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         factura.proveedor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProveedor = !selectedProveedor || factura.proveedor === selectedProveedor;
    const matchesEstado = !selectedEstado || factura.estadoPago === selectedEstado;
    
    return matchesSearch && matchesProveedor && matchesEstado;
  });

  // Paginated facturas
  const paginatedFacturas = filteredFacturas.slice(first, first + rows);

  const handleAddFactura = () => {
    setSelectedFactura(null);
    setFormData({
      numeroFactura: '',
      proveedor: '',
      fechaEmision: null,
      fechaVencimiento: null,
      monto: 0,
      moneda: 'ARS',
      estadoPago: 'pendiente',
      descripcion: ''
    });
    setShowModal(true);
  };

  const handleEditFactura = (factura: Factura) => {
    setSelectedFactura(factura);
    setFormData({
      numeroFactura: factura.numeroFactura,
      proveedor: factura.proveedor,
      fechaEmision: factura.fechaEmision,
      fechaVencimiento: factura.fechaVencimiento,
      monto: factura.monto,
      moneda: factura.moneda,
      estadoPago: factura.estadoPago,
      descripcion: factura.descripcion || ''
    });
    setShowModal(true);
  };

  const handleRegistrarPago = (factura: Factura) => {
    const updatedFacturas = facturas.map(f => 
      f.id === factura.id ? { ...f, estadoPago: 'pagado' as const } : f
    );
    setFacturas(updatedFacturas);
  };

  const handleEliminarFactura = (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar esta factura?')) {
      setFacturas(facturas.filter(f => f.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFactura) {
      // Edit existing factura
      const updatedFacturas = facturas.map(f => 
        f.id === selectedFactura.id ? { ...selectedFactura, ...formData } : f
      );
      setFacturas(updatedFacturas);
    } else {
      // Add new factura
      const newFactura: Factura = {
        id: Math.max(...facturas.map(f => f.id)) + 1,
        numeroFactura: formData.numeroFactura,
        proveedor: formData.proveedor,
        fechaEmision: formData.fechaEmision,
        fechaVencimiento: formData.fechaVencimiento,
        monto: formData.monto,
        moneda: formData.moneda,
        estadoPago: formData.estadoPago,
        descripcion: formData.descripcion
      };
      setFacturas([...facturas, newFactura]);
    }
    
    setShowModal(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    if (!isClient) return 'Loading...';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getEstadoBadge = (estado: string) => {
    return estado === 'pagado' ? 
      <Badge value="Pagado" severity="success" /> :
      <Badge value="Pendiente" severity="warning" />;
  };

  const isVencida = (fecha: Date | null, estado: string) => {
    return fecha && estado === 'pendiente' && new Date() > fecha;
  };

  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <i className="pi pi-clock text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Total Pendiente</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPendiente)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <i className="pi pi-check-circle text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pagado</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPagado)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <i className="pi pi-chart-line text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total General</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalPendiente + totalPagado)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Balance by Provider */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Saldo por Proveedor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(saldoPorProveedor).map(([proveedor, saldo]) => (
            <div key={proveedor} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{proveedor}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-600">Pendiente:</span>
                  <span className="font-medium text-black">{formatCurrency(saldo.pendiente)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Pagado:</span>
                  <span className="font-medium text-black">{formatCurrency(saldo.pagado)}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-black">{formatCurrency(saldo.pendiente + saldo.pagado)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <InputText
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número o proveedor..."
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
            <Dropdown
              value={selectedProveedor}
              onChange={(e) => setSelectedProveedor(e.value)}
              options={[{ label: 'Todos', value: null }, ...proveedores]}
              placeholder="Seleccionar proveedor"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <Dropdown
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.value)}
              options={estadosPago}
              placeholder="Seleccionar estado"
              className="w-full"
            />
          </div>
          
          <div className="flex items-end">
            <Button
              label="Limpiar Filtros"
              icon="pi pi-times"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              onClick={() => {
                setSearchTerm('');
                setSelectedProveedor(null);
                setSelectedEstado(null);
              }}
            />
          </div>
        </div>
      </div>


      <div className="flex justify-end mb-6">
        <Button
          label="Agregar Factura"
          icon="pi pi-plus"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg"
          onClick={handleAddFactura}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {paginatedFacturas.map((factura) => (
          <Card key={factura.id} className="shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{factura.numeroFactura}</h3>
                  <p className="text-sm text-gray-600">{factura.proveedor}</p>
                </div>
                {getEstadoBadge(factura.estadoPago)}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Emisión:</span>
                  <span>{formatDate(factura.fechaEmision)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vencimiento:</span>
                  <span className={isVencida(factura.fechaVencimiento, factura.estadoPago) ? 'text-red-600 font-medium' : ''}>
                    {formatDate(factura.fechaVencimiento)}
                    {isVencida(factura.fechaVencimiento, factura.estadoPago) && (
                      <i className="pi pi-exclamation-triangle ml-1"></i>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-semibold">{formatCurrency(factura.monto)}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  icon="pi pi-pencil"
                  className="p-button-sm p-button-outlined"
                  tooltip="Editar"
                  onClick={() => handleEditFactura(factura)}
                />
                {factura.estadoPago === 'pendiente' && (
                  <Button
                    icon="pi pi-dollar"
                    className="p-button-sm p-button-success p-button-outlined"
                    tooltip="Registrar Pago"
                    onClick={() => handleRegistrarPago(factura)}
                  />
                )}
                <Button
                  icon="pi pi-trash"
                  className="p-button-sm p-button-danger p-button-outlined"
                  tooltip="Eliminar"
                  onClick={() => handleEliminarFactura(factura.id)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredFacturas.length === 0 && (
        <div className="text-center py-12">
          <i className="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500 text-lg">No se encontraron facturas</p>
        </div>
      )}

      {/* Pagination */}
      {filteredFacturas.length > rows && (
        <div className="flex justify-center">
          <Paginator
            first={first}
            rows={rows}
            totalRecords={filteredFacturas.length}
            rowsPerPageOptions={[9, 18, 27]}
            onPageChange={onPageChange}
            className="border-0"
          />
        </div>
      )}

      
      <Dialog
        header={selectedFactura ? "Editar Factura" : "Nueva Factura"}
        visible={showModal}
        onHide={() => setShowModal(false)}
        style={{ width: '50vw' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        modal
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número de Factura</label>
              <InputText
                value={formData.numeroFactura}
                onChange={(e) => setFormData({...formData, numeroFactura: e.target.value})}
                required
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
              <Dropdown
                value={formData.proveedor}
                onChange={(e) => setFormData({...formData, proveedor: e.value})}
                options={proveedores}
                placeholder="Seleccionar proveedor"
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Emisión</label>
              <Calendar
                value={formData.fechaEmision}
                onChange={(e) => setFormData({...formData, fechaEmision: e.value as Date | null})}
                dateFormat="dd/mm/yy"
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Vencimiento</label>
              <Calendar
                value={formData.fechaVencimiento}
                onChange={(e) => setFormData({...formData, fechaVencimiento: e.value as Date | null})}
                dateFormat="dd/mm/yy"
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monto</label>
              <InputNumber
                value={formData.monto}
                onChange={(e) => setFormData({...formData, monto: e.value || 0})}
                mode="currency"
                currency="ARS"
                locale="es-AR"
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
              <Dropdown
                value={formData.moneda}
                onChange={(e) => setFormData({...formData, moneda: e.value})}
                options={monedas}
                className="w-full"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado de Pago</label>
              <Dropdown
                value={formData.estadoPago}
                onChange={(e) => setFormData({...formData, estadoPago: e.value})}
                options={[
                  { label: 'Pendiente', value: 'pendiente' },
                  { label: 'Pagado', value: 'pagado' }
                ]}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-outlined"
              type="button"
              onClick={() => setShowModal(false)}
            />
            <Button
              label={selectedFactura ? "Actualizar" : "Crear"}
              icon="pi pi-check"
              type="submit"
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}