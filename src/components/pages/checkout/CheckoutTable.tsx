import React, { useState, useEffect } from 'react';
import { DataTable, DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { SortOrder } from 'primereact/api';
import { generarFacturaPDF } from '@/lib/generarFacturaPDF';

// Función helper para generar consumos consistentes
function generarConsumos(idReserva: number) {
    const consumosBase = [
        { categoria: 'Minibar', items: ['Coca Cola 350ml', 'Agua Mineral 500ml', 'Cerveza Corona', 'Snickers', 'Papas Lays', 'Vino Tinto 187ml'] },
        { categoria: 'Room Service', items: ['Desayuno Continental', 'Hamburguesa Completa', 'Ensalada César', 'Pizza Margarita', 'Club Sandwich', 'Pasta Alfredo'] },
        { categoria: 'Lavandería', items: ['Camisa', 'Pantalón', 'Vestido', 'Traje Completo', 'Sábanas extras'] },
        { categoria: 'Spa & Wellness', items: ['Masaje Relajante 60min', 'Tratamiento Facial', 'Acceso Gimnasio', 'Sauna'] },
        { categoria: 'Bar & Restaurante', items: ['Cena para 2', 'Cocktail Mojito', 'Botella de Champagne', 'Postre del Chef'] },
        { categoria: 'Servicios', items: ['Estacionamiento', 'WiFi Premium', 'Late Checkout', 'Traslado Aeropuerto'] }
    ];

    const seed = idReserva;
    const numConsumos = (seed % 5) + 3; // Entre 3 y 7 consumos
    const consumos: Array<{
        id: number;
        categoria: string;
        descripcion: string;
        cantidad: number;
        precio_unitario: number;
        subtotal: number;
        fecha: Date;
    }> = [];
    let totalConsumos = 0;

    for (let i = 0; i < numConsumos; i++) {
        const catIndex = (seed * (i + 1)) % consumosBase.length;
        const categoria = consumosBase[catIndex];
        const itemIndex = (seed * (i + 2)) % categoria.items.length;
        const item = categoria.items[itemIndex];
        const cantidad = ((seed * (i + 3)) % 3) + 1;
        const precioBase = [500, 800, 1200, 1500, 2000, 2500, 3000, 3500, 4000];
        const precio = precioBase[(seed * (i + 4)) % precioBase.length];
        const subtotal = precio * cantidad;

        consumos.push({
            id: i + 1,
            categoria: categoria.categoria,
            descripcion: item,
            cantidad: cantidad,
            precio_unitario: precio,
            subtotal: subtotal,
            fecha: new Date(Date.now() - ((numConsumos - i) * 24 * 60 * 60 * 1000))
        });

        totalConsumos += subtotal;
    }

    return { consumos, totalConsumos };
}

interface Huesped {
    id_huespedes: number;
    nombre: string;
    apellido: string;
    documento: string;
    telefono?: string;
    email?: string;
}

interface MetodoPago {
    id_metodo: number;
    nombre_metodo: string;
}

interface Habitacion {
    id_habitacion: number;
    numero: string;
    tipo: string;
    capacidad: number;
    cantidad_personas: number;
}

interface Validaciones {
    checkout_vencido: boolean;
    checkout_temprano: boolean;
    dias_restantes: number;
}

interface Reserva {
    id_reservas: number;
    huesped: Huesped;
    fecha_checkin: string;
    fecha_checkout: string;
    cantidad_adultos: number;
    cantidad_menores: number;
    estado: string;
    monto_total: number;
    metodo_pago?: MetodoPago | null;
    habitaciones: Habitacion[];
    validaciones?: Validaciones;
}

interface CheckoutTableProps {
    reservas: Reserva[];
    loading: boolean;
    totalRecords: number;
    lazyState: {
        first: number;
        rows: number;
        page: number;
        sortField: string;
        sortOrder: SortOrder;
    };
    onPage: (event: DataTablePageEvent) => void;
    onSort: (event: DataTableSortEvent) => void;
    toastRef: React.RefObject<Toast | null>;
    onCheckoutSuccess: () => void;
    reservaIdPreseleccionada?: number | null;
    onReservaPreseleccionadaProcesada?: () => void;
}

const CheckoutTable: React.FC<CheckoutTableProps> = ({
    reservas,
    loading,
    totalRecords,
    lazyState,
    onPage,
    onSort,
    toastRef,
    onCheckoutSuccess,
    reservaIdPreseleccionada,
    onReservaPreseleccionadaProcesada
}) => {
    const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
    const [showDetallesDialog, setShowDetallesDialog] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
    const [procesando, setProcesando] = useState(false);

    // Abrir automáticamente el dialog si hay una reserva preseleccionada
    useEffect(() => {
        if (reservaIdPreseleccionada && reservas.length > 0 && !loading) {
            const reserva = reservas.find(r => r.id_reservas === reservaIdPreseleccionada);
            if (reserva) {
                handleOpenCheckout(reserva);
                onReservaPreseleccionadaProcesada?.();
            }
        }
    }, [reservaIdPreseleccionada, reservas, loading]);

    // Abrir dialog de checkout
    const handleOpenCheckout = (reserva: Reserva) => {
        setSelectedReserva(reserva);
        setShowCheckoutDialog(true);
    };

    // Abrir dialog de detalles
    const handleVerDetalles = (reserva: Reserva) => {
        setSelectedReserva(reserva);
        setShowDetallesDialog(true);
    };

    // Realizar checkout
    const handleCheckout = async () => {
        if (!selectedReserva) return;

        setProcesando(true);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_reserva: selectedReserva.id_reservas
                })
            });

            const data = await response.json();

            if (data.success) {
                toastRef.current?.show({
                    severity: 'success',
                    summary: 'Check-out realizado',
                    detail: `Check-out completado para ${selectedReserva.huesped.nombre} ${selectedReserva.huesped.apellido}`,
                    life: 3000
                });

                setShowCheckoutDialog(false);
                setSelectedReserva(null);
                onCheckoutSuccess();
            } else {
                toastRef.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: data.message || 'No se pudo realizar el check-out',
                    life: 5000
                });
            }
        } catch (error) {
            console.error('Error al realizar checkout:', error);
            toastRef.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al conectar con el servidor',
                life: 5000
            });
        } finally {
            setProcesando(false);
        }
    };

    // Templates para columnas
    const huespedTemplate = (rowData: Reserva) => {
        return (
            <div>
                <div className="font-semibold">{rowData.huesped.nombre} {rowData.huesped.apellido}</div>
                <div className="text-sm text-gray-600">DNI: {rowData.huesped.documento}</div>
                {rowData.huesped.telefono && (
                    <div className="text-sm text-gray-600">Tel: {rowData.huesped.telefono}</div>
                )}
            </div>
        );
    };

    const habitacionesTemplate = (rowData: Reserva) => {
        return (
            <div>
                {rowData.habitaciones.map((hab, index) => (
                    <div key={index} className="mb-1">
                        <span className="font-semibold">Hab. {hab.numero}</span>
                        <span className="text-sm text-gray-600"> ({hab.tipo})</span>
                        <div className="text-xs text-gray-500">
                            {hab.cantidad_personas} persona{hab.cantidad_personas !== 1 ? 's' : ''}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const fechaTemplate = (rowData: Reserva) => {
        const checkin = new Date(rowData.fecha_checkin);
        const checkout = new Date(rowData.fecha_checkout);
        const dias = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));

        return (
            <div>
                <div className="text-sm">
                    <strong>Entrada:</strong> {checkin.toLocaleDateString('es-AR')}
                </div>
                <div className="text-sm">
                    <strong>Salida:</strong> {checkout.toLocaleDateString('es-AR')}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    {dias} noche{dias !== 1 ? 's' : ''}
                </div>
            </div>
        );
    };

    const estadoTemplate = (rowData: Reserva) => {
        const checkoutVencido = rowData.validaciones?.checkout_vencido;
        const checkoutTemprano = rowData.validaciones?.checkout_temprano;
        const diasRestantes = rowData.validaciones?.dias_restantes || 0;

        // Determinar el estado según las condiciones
        if (checkoutTemprano) {
            // Checkout antes de la fecha programada
            return (
                <div className="flex flex-col gap-1">
                    <Tag severity="info" value={`Salida anticipada (${diasRestantes}d)`} icon="pi pi-clock" />
                </div>
            );
        } else if (checkoutVencido) {
            // Ya pasó la fecha de checkout (estadía extendida)
            return (
                <div className="flex flex-col gap-1">
                    <Tag severity="danger" value="Estadía extendida" icon="pi pi-exclamation-triangle" />
                </div>
            );
        } else {
            // Checkout en la fecha programada (hoy es el día)
            return (
                <div className="flex flex-col gap-1">
                    <Tag severity="success" value="Checkout programado" icon="pi pi-calendar-check" />
                </div>
            );
        }
    };

    const montoTemplate = (rowData: Reserva) => {
        return (
            <div className="text-right">
                <div className="font-semibold text-lg">
                    ${Number(rowData.monto_total).toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </div>
                {rowData.metodo_pago && (
                    <div className="text-xs text-gray-500">{rowData.metodo_pago.nombre_metodo}</div>
                )}
            </div>
        );
    };

    const accionesTemplate = (rowData: Reserva) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    rounded
                    text
                    severity="info"
                    tooltip="Ver detalles"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleVerDetalles(rowData)}
                />
                <Button
                    icon="pi pi-sign-out"
                    rounded
                    outlined
                    className="p-button-success"
                    tooltip="Check-out"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleOpenCheckout(rowData)}
                />
            </div>
        );
    };

    return (
        <>
            <Card>
                <DataTable
                    value={reservas}
                    lazy
                    paginator
                    first={lazyState.first}
                    rows={lazyState.rows}
                    totalRecords={totalRecords}
                    onPage={onPage}
                    onSort={onSort}
                    sortField={lazyState.sortField}
                    sortOrder={lazyState.sortOrder}
                    loading={loading}
                    emptyMessage="No hay reservas pendientes de check-out"
                    className="p-datatable-sm"
                    rowsPerPageOptions={[5, 10, 25, 50]}
                >
                    <Column
                        field="id_reservas"
                        header="ID"
                        sortable
                        style={{ width: '80px' }}
                    />
                    <Column
                        header="Huesped"
                        body={huespedTemplate}
                        sortable
                        sortField="huesped.nombre"
                    />
                    <Column
                        header="Habitaciones"
                        body={habitacionesTemplate}
                    />
                    <Column
                        header="Fechas"
                        body={fechaTemplate}
                        sortable
                        sortField="fecha_checkout"
                    />
                    <Column
                        header="Estado"
                        body={estadoTemplate}
                    />
                    <Column
                        header="Monto"
                        body={montoTemplate}
                        sortable
                        sortField="monto_total"
                    />
                    <Column
                        header="Acciones"
                        body={accionesTemplate}
                        style={{ width: '200px' }}
                    />
                </DataTable>
            </Card>

            {/* Dialog de Checkout */}
            <Dialog
                visible={showCheckoutDialog}
                onHide={() => !procesando && setShowCheckoutDialog(false)}
                header={selectedReserva?.validaciones?.checkout_temprano ? "⚠️ Check-out Temprano" : "Confirmar Check-out"}
                modal
                style={{ width: '900px', maxWidth: '95vw' }}
            >
                {selectedReserva && (() => {
                    // Generar consumos basados en el ID de la reserva para consistencia
                    const { consumos, totalConsumos } = generarConsumos(selectedReserva.id_reservas);
                    const totalFinal = Number(selectedReserva.monto_total) + totalConsumos;

                    return (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Información del huésped */}
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                        <i className="pi pi-user"></i>
                                        Información del Huésped
                                    </h3>
                                    <p className="text-sm">
                                        <strong>{selectedReserva.huesped.nombre} {selectedReserva.huesped.apellido}</strong>
                                    </p>
                                    <p className="text-sm text-gray-600">DNI: {selectedReserva.huesped.documento}</p>
                                    {selectedReserva.validaciones?.checkout_temprano && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Checkout programado: <strong>{new Date(selectedReserva.fecha_checkout).toLocaleDateString('es-AR')}</strong>
                                        </p>
                                    )}
                                </div>

                                {/* Habitaciones */}
                                <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
                                    <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                                        <i className="pi pi-home"></i>
                                        Habitaciones
                                    </h3>
                                    {selectedReserva.habitaciones.map((hab, index) => (
                                        <div key={index} className="text-sm text-gray-700">
                                            • Habitación {hab.numero} ({hab.tipo})
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Advertencia de checkout temprano */}
                            {selectedReserva.validaciones?.checkout_temprano && (
                                <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                                    <div className="flex items-start gap-2">
                                        <i className="pi pi-exclamation-triangle text-orange-600 mt-1"></i>
                                        <div>
                                            <p className="font-semibold text-orange-800">Checkout Anticipado</p>
                                            <p className="text-sm text-orange-700 mt-1">
                                                El huésped está realizando checkout <strong>{selectedReserva.validaciones.dias_restantes} día(s) antes</strong> de la fecha programada.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Consumos durante la estadía */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-green-500 to-green-600 p-3">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <i className="pi pi-shopping-cart"></i>
                                        Consumos Durante la Estadía
                                    </h3>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 sticky top-0">
                                            <tr>
                                                <th className="text-left p-2 font-semibold text-gray-700">Fecha</th>
                                                <th className="text-left p-2 font-semibold text-gray-700">Categoría</th>
                                                <th className="text-left p-2 font-semibold text-gray-700">Descripción</th>
                                                <th className="text-center p-2 font-semibold text-gray-700">Cant.</th>
                                                <th className="text-right p-2 font-semibold text-gray-700">P. Unit.</th>
                                                <th className="text-right p-2 font-semibold text-gray-700">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {consumos.map((consumo) => (
                                                <tr key={consumo.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-2 text-gray-600">
                                                        {consumo.fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                                                    </td>
                                                    <td className="p-2">
                                                        <Tag value={consumo.categoria} severity="info" className="text-xs" />
                                                    </td>
                                                    <td className="p-2 text-gray-800">{consumo.descripcion}</td>
                                                    <td className="p-2 text-center text-gray-600">{consumo.cantidad}</td>
                                                    <td className="p-2 text-right text-gray-600">
                                                        ${consumo.precio_unitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="p-2 text-right font-semibold text-gray-800">
                                                        ${consumo.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Resumen de cuenta */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <i className="pi pi-calculator"></i>
                                    Resumen de Cuenta
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Hospedaje ({selectedReserva.habitaciones.length} habitación{selectedReserva.habitaciones.length > 1 ? 'es' : ''}):</span>
                                        <span className="font-semibold">
                                            ${Number(selectedReserva.monto_total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Consumos adicionales ({consumos.length} item{consumos.length > 1 ? 's' : ''}):</span>
                                        <span className="font-semibold text-green-700">
                                            ${totalConsumos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-lg text-gray-800">Total a Pagar:</span>
                                            <span className="font-bold text-2xl text-green-600">
                                                ${totalFinal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedReserva.metodo_pago && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                            <i className="pi pi-credit-card"></i>
                                            <span>Método de pago: <strong>{selectedReserva.metodo_pago.nombre_metodo}</strong></span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                                <p className="text-sm text-blue-800">
                                    <i className="pi pi-info-circle mr-2"></i>
                                    Las habitaciones pasarán automáticamente a estado <strong>LIMPIEZA</strong>.
                                </p>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <Button
                                    label="Generar Factura"
                                    icon="pi pi-file-pdf"
                                    className="p-button-outlined p-button-info"
                                    onClick={() => {
                                        // Generar número de factura temporal para el PDF
                                        const numeroFactura = `FV-PREV-${selectedReserva.id_reservas}`;

                                        generarFacturaPDF({
                                            numeroFactura,
                                            fechaEmision: new Date(),
                                            huesped: selectedReserva.huesped,
                                            habitaciones: selectedReserva.habitaciones.map(h => ({
                                                numero: h.numero,
                                                tipo: h.tipo
                                            })),
                                            fechaCheckin: new Date(selectedReserva.fecha_checkin),
                                            fechaCheckout: new Date(selectedReserva.fecha_checkout),
                                            montoHospedaje: Number(selectedReserva.monto_total),
                                            consumos,
                                            totalConsumos,
                                            totalFinal,
                                            metodoPago: selectedReserva.metodo_pago?.nombre_metodo
                                        });

                                        toastRef.current?.show({
                                            severity: 'success',
                                            summary: 'Factura generada',
                                            detail: 'La factura PDF se ha descargado correctamente',
                                            life: 3000
                                        });
                                    }}
                                    disabled={procesando}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        label="Cancelar"
                                        icon="pi pi-times"
                                        className="p-button-text"
                                        onClick={() => setShowCheckoutDialog(false)}
                                        disabled={procesando}
                                    />
                                    <Button
                                        label={selectedReserva.validaciones?.checkout_temprano ? "Confirmar Checkout Temprano" : "Confirmar Check-out"}
                                        icon="pi pi-check"
                                        className={selectedReserva.validaciones?.checkout_temprano ? "p-button-warning" : "p-button-success"}
                                        onClick={handleCheckout}
                                        loading={procesando}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </Dialog>

            {/* Dialog de Detalles */}
            <Dialog
                visible={showDetallesDialog}
                onHide={() => setShowDetallesDialog(false)}
                header="Detalles de la Reserva"
                modal
                style={{ width: '700px', maxWidth: '90vw' }}
            >
                {selectedReserva && (
                    <div className="space-y-4">
                        {/* Informacion de la Reserva */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <h3 className="font-bold text-lg text-blue-900 mb-2 flex items-center gap-2">
                                <i className="pi pi-info-circle"></i>
                                Informacion General
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-700">ID Reserva:</span>
                                    <p className="text-gray-900">#{selectedReserva.id_reservas}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Estado:</span>
                                    <div className="mt-1">
                                        <Tag
                                            value={selectedReserva.estado}
                                            severity={selectedReserva.estado === 'CHECKIN' ? 'success' : 'info'}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Monto Total:</span>
                                    <p className="text-gray-900 font-bold text-lg">
                                        ${Number(selectedReserva.monto_total).toLocaleString('es-AR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </p>
                                </div>
                                {selectedReserva.metodo_pago && (
                                    <div>
                                        <span className="font-semibold text-gray-700">Metodo de Pago:</span>
                                        <p className="text-gray-900">{selectedReserva.metodo_pago.nombre_metodo}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informacion del Huesped */}
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                            <h3 className="font-bold text-lg text-green-900 mb-2 flex items-center gap-2">
                                <i className="pi pi-user"></i>
                                Informacion del Huesped
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-700">Nombre Completo:</span>
                                    <p className="text-gray-900">
                                        {selectedReserva.huesped.nombre} {selectedReserva.huesped.apellido}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Documento:</span>
                                    <p className="text-gray-900">{selectedReserva.huesped.documento}</p>
                                </div>
                                {selectedReserva.huesped.telefono && (
                                    <div>
                                        <span className="font-semibold text-gray-700">Telefono:</span>
                                        <p className="text-gray-900">{selectedReserva.huesped.telefono}</p>
                                    </div>
                                )}
                                {selectedReserva.huesped.email && (
                                    <div>
                                        <span className="font-semibold text-gray-700">Email:</span>
                                        <p className="text-gray-900">{selectedReserva.huesped.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fechas de Estadia */}
                        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
                            <h3 className="font-bold text-lg text-purple-900 mb-2 flex items-center gap-2">
                                <i className="pi pi-calendar"></i>
                                Fechas de Estadia
                            </h3>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-700">Check-in:</span>
                                    <p className="text-gray-900 font-semibold">
                                        {new Date(selectedReserva.fecha_checkin).toLocaleDateString('es-AR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Check-out:</span>
                                    <p className="text-gray-900 font-semibold">
                                        {new Date(selectedReserva.fecha_checkout).toLocaleDateString('es-AR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Duracion:</span>
                                    <p className="text-gray-900 font-semibold">
                                        {Math.ceil(
                                            (new Date(selectedReserva.fecha_checkout).getTime() -
                                                new Date(selectedReserva.fecha_checkin).getTime()) /
                                            (1000 * 60 * 60 * 24)
                                        )} noche(s)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Personas */}
                        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                            <h3 className="font-bold text-lg text-orange-900 mb-2 flex items-center gap-2">
                                <i className="pi pi-users"></i>
                                Cantidad de Personas
                            </h3>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-700">Adultos:</span>
                                    <p className="text-gray-900 text-2xl font-bold">{selectedReserva.cantidad_adultos}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Menores:</span>
                                    <p className="text-gray-900 text-2xl font-bold">{selectedReserva.cantidad_menores}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Total:</span>
                                    <p className="text-gray-900 text-2xl font-bold">
                                        {selectedReserva.cantidad_adultos + selectedReserva.cantidad_menores}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Habitaciones */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <h3 className="font-bold text-lg text-yellow-900 mb-3 flex items-center gap-2">
                                <i className="pi pi-home"></i>
                                Habitaciones Asignadas
                            </h3>
                            <div className="space-y-3">
                                {selectedReserva.habitaciones.map((hab, index) => (
                                    <div key={index} className="bg-white border border-yellow-200 rounded-lg p-3 shadow-sm">
                                        <div className="grid grid-cols-4 gap-3 text-sm">
                                            <div>
                                                <span className="font-semibold text-gray-700">Numero:</span>
                                                <p className="text-gray-900 font-bold text-lg">
                                                    {hab.numero}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-700">Tipo:</span>
                                                <p className="text-gray-900">{hab.tipo}</p>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-700">Capacidad:</span>
                                                <p className="text-gray-900">{hab.capacidad}</p>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-700">Asignadas:</span>
                                                <p className="text-gray-900 font-bold">{hab.cantidad_personas}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
};

export default CheckoutTable;
