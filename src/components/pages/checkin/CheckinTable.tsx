import React, { useState, useEffect } from 'react';
import { DataTable, DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Steps } from 'primereact/steps';

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
    activo: boolean;
}

interface Tarjeta {
    id_tarjeta: number;
    numero_tarjeta: string;
    titular_tarjeta: string;
}

interface Habitacion {
    numero: string;
    tipo: string;
    capacidad: number;
    estado?: string;
}

interface ReservaHabitacion {
    habitacion: Habitacion;
    cantidad_personas: number;
}

interface Validaciones {
    excede_capacidad: boolean;
    habitaciones_disponibles: boolean;
    tiene_metodo_pago: boolean;
    capacidad_total: number;
    personas_total: number;
}

interface Acompanante {
    id_acompanante: number;
    nombre: string;
    apellido: string;
    dni: string;
    fecha_nacimiento: string;
    fecha_creacion?: string;
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
    fecha_creacion: string;
    metodo_pago?: MetodoPago | null;
    tarjeta?: Tarjeta | null;
    reservas_habitaciones: ReservaHabitacion[];
    acompanantes: Acompanante[];
    validaciones?: Validaciones;
}

interface CheckinTableProps {
    reservas: Reserva[];
    loading: boolean;
    totalRecords: number;
    lazyState: {
        first: number;
        rows: number;
        page: number;
        sortField: string;
        sortOrder: number;
    };
    onPage: (event: DataTablePageEvent) => void;
    onSort: (event: DataTableSortEvent) => void;
    toastRef: React.RefObject<Toast | null>;
    onCheckinSuccess: () => void;
    reservaIdPreseleccionada?: number | null;
    onReservaPreseleccionadaProcesada?: () => void;
}

const CheckinTable: React.FC<CheckinTableProps> = ({
    reservas,
    loading,
    totalRecords,
    lazyState,
    onPage,
    onSort,
    toastRef,
    onCheckinSuccess,
    reservaIdPreseleccionada,
    onReservaPreseleccionadaProcesada
}) => {
    const [showCheckinDialog, setShowCheckinDialog] = useState(false);
    const [showDetallesDialog, setShowDetallesDialog] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
    const [procesando, setProcesando] = useState(false);

    // Datos de contacto actualizables
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');

    // Wizard de check-in - pasos
    const [currentStep, setCurrentStep] = useState(1);
    const [acompanantesData, setAcompanantesData] = useState<Omit<Acompanante, 'id_acompanante' | 'fecha_creacion'>[]>([]);

    // Plantillas para las columnas
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
                {rowData.reservas_habitaciones.map((rh, index) => (
                    <div key={index} className="mb-1">
                        <span className="font-semibold">Hab. {rh.habitacion.numero}</span>
                        <span className="text-sm text-gray-600"> ({rh.habitacion.tipo})</span>
                        <div className="text-xs text-gray-500">
                            {rh.cantidad_personas} persona{rh.cantidad_personas !== 1 ? 's' : ''}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const fechaTemplate = (rowData: Reserva) => {
        const checkin = new Date(rowData.fecha_checkin);
        const checkout = new Date(rowData.fecha_checkout);

        // Extraer fecha UTC y crear fechas locales con horarios estándar
        const checkinLocal = new Date(
            checkin.getUTCFullYear(),
            checkin.getUTCMonth(),
            checkin.getUTCDate(),
            14, 0, 0, 0 // Check-in a las 14:00 hora local
        );

        const checkoutLocal = new Date(
            checkout.getUTCFullYear(),
            checkout.getUTCMonth(),
            checkout.getUTCDate(),
            10, 0, 0, 0 // Check-out a las 10:00 hora local
        );

        const dias = Math.ceil((checkoutLocal.getTime() - checkinLocal.getTime()) / (1000 * 60 * 60 * 24));

        return (
            <div>
                <div className="text-sm">
                    <strong>Entrada:</strong> {checkinLocal.toLocaleString('es-AR', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                    })}
                </div>
                <div className="text-sm">
                    <strong>Salida:</strong> {checkoutLocal.toLocaleString('es-AR', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                    })}
                </div>
                <div className="text-xs text-gray-600">{dias} noche{dias !== 1 ? 's' : ''}</div>
            </div>
        );
    };

    const personasTemplate = (rowData: Reserva) => {
        return (
            <div className="text-sm">
                <div>{rowData.cantidad_adultos} adulto{rowData.cantidad_adultos !== 1 ? 's' : ''}</div>
                {rowData.cantidad_menores > 0 && (
                    <div>{rowData.cantidad_menores} menor{rowData.cantidad_menores !== 1 ? 'es' : ''}</div>
                )}
            </div>
        );
    };

    const montoTemplate = (rowData: Reserva) => {
        return (
            <div className="text-right font-semibold">
                ${Number(rowData.monto_total).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
        );
    };

    const validacionesTemplate = (rowData: Reserva) => {
        if (!rowData.validaciones) return null;

        const { excede_capacidad, tiene_metodo_pago, habitaciones_disponibles } = rowData.validaciones;
        const tieneProblemas = excede_capacidad || !tiene_metodo_pago || !habitaciones_disponibles;

        if (!tieneProblemas) {
            return (
                <div className="flex items-center gap-1 text-green-600">
                    <i className="pi pi-check-circle"></i>
                    <span className="text-xs">Lista</span>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-1">
                {excede_capacidad && (
                    <div className="flex items-center gap-1 text-red-600" title="Excede capacidad">
                        <i className="pi pi-exclamation-triangle text-xs"></i>
                        <span className="text-xs">Capacidad</span>
                    </div>
                )}
                {!tiene_metodo_pago && (
                    <div className="flex items-center gap-1 text-orange-600" title="Sin método de pago">
                        <i className="pi pi-exclamation-circle text-xs"></i>
                        <span className="text-xs">Pago</span>
                    </div>
                )}
                {!habitaciones_disponibles && (
                    <div className="flex items-center gap-1 text-red-600" title="Una o más habitaciones no están disponibles">
                        <i className="pi pi-times-circle text-xs"></i>
                        <span className="text-xs">Hab. ocupadas</span>
                    </div>
                )}
            </div>
        );
    };

    const handleVerDetalles = (reserva: Reserva) => {
        setSelectedReserva(reserva);
        setShowDetallesDialog(true);
    };

    const handleOpenCheckin = (reserva: Reserva) => {
        setSelectedReserva(reserva);
        setTelefono(reserva.huesped.telefono || '');
        setEmail(reserva.huesped.email || '');
        setCurrentStep(1);
        setAcompanantesData([]);

        // Calcular cuántos acompañantes se necesitan (total de personas - 1 titular)
        const personasTotal = reserva.cantidad_adultos + reserva.cantidad_menores;
        const numAcompanantes = Math.max(0, personasTotal - 1);

        // Pre-cargar acompañantes vacíos si hay más de 1 persona
        if (numAcompanantes > 0) {
            const acompanantesVacios = Array.from({ length: numAcompanantes }, () => ({
                nombre: '',
                apellido: '',
                dni: '',
                fecha_nacimiento: ''
            }));
            setAcompanantesData(acompanantesVacios);
        }

        setShowCheckinDialog(true);
    };

    // Efecto para abrir automáticamente el dialog si hay una reserva preseleccionada
    useEffect(() => {
        if (reservaIdPreseleccionada && reservas.length > 0) {
            const reservaEncontrada = reservas.find(r => r.id_reservas === reservaIdPreseleccionada);
            if (reservaEncontrada) {
                handleOpenCheckin(reservaEncontrada);
                // Notificar que ya procesamos la preselección
                if (onReservaPreseleccionadaProcesada) {
                    onReservaPreseleccionadaProcesada();
                }
            } else {
                // Si no encontramos la reserva, mostrar un mensaje
                toastRef.current?.show({
                    severity: 'warn',
                    summary: 'Reserva no encontrada',
                    detail: `No se encontró la reserva #${reservaIdPreseleccionada} en la lista de reservas disponibles para check-in`,
                    life: 5000
                });
                if (onReservaPreseleccionadaProcesada) {
                    onReservaPreseleccionadaProcesada();
                }
            }
        }
    }, [reservaIdPreseleccionada, reservas]);

    const handleRealizarCheckin = async () => {
        if (!selectedReserva) return;

        setProcesando(true);
        try {
            const contacto_actualizado = {
                telefono: telefono !== selectedReserva.huesped.telefono ? telefono : undefined,
                email: email !== selectedReserva.huesped.email ? email : undefined
            };

            // Preparar acompañantes para enviar (solo los que tienen datos completos)
            const acompanantesParaEnviar = acompanantesData.filter(
                acomp => acomp.nombre && acomp.apellido && acomp.dni && acomp.fecha_nacimiento
            );

            const response = await fetch('/api/checkin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_reserva: selectedReserva.id_reservas,
                    contacto_actualizado: (contacto_actualizado.telefono || contacto_actualizado.email) ? contacto_actualizado : undefined,
                    acompanantes: acompanantesParaEnviar.length > 0 ? acompanantesParaEnviar : undefined,
                    crear_factura: true,
                    notificar_housekeeping: true
                })
            });

            const data = await response.json();

            if (data.success) {
                toastRef.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Check-in realizado exitosamente',
                    life: 3000
                });
                setShowCheckinDialog(false);
                setSelectedReserva(null);
                setTelefono('');
                setEmail('');
                setCurrentStep(1);
                setAcompanantesData([]);
                onCheckinSuccess();
            } else {
                toastRef.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: data.message || 'Error al realizar check-in',
                    life: 3000
                });
            }
        } catch (error) {
            console.error('Error al realizar check-in:', error);
            toastRef.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al conectar con el servidor',
                life: 3000
            });
        } finally {
            setProcesando(false);
        }
    };

    const accionesTemplate = (rowData: Reserva) => {
        return (
            <div className="flex gap-2">
                {/* Botón Ver Detalles */}
                <Button
                    icon="pi pi-eye"
                    rounded
                    outlined
                    className="p-button-info"
                    tooltip="Ver detalles"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleVerDetalles(rowData)}
                />

                {/* Botón Check-in */}
                <Button
                    icon="pi pi-sign-in"
                    rounded
                    outlined
                    className="p-button-success"
                    tooltip="Realizar Check-in"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleOpenCheckin(rowData)}
                />
            </div>
        );
    };

    return (
        <>
            <Card>
                <DataTable
                    value={reservas}
                    loading={loading}
                    lazy
                    paginator
                    rows={lazyState.rows}
                    totalRecords={totalRecords}
                    first={lazyState.first}
                    onPage={onPage}
                    onSort={onSort}
                    sortField={lazyState.sortField}
                    sortOrder={lazyState.sortOrder as 1 | -1 | 0 | null | undefined}
                    rowsPerPageOptions={[10, 25, 50]}
                    emptyMessage="No hay reservas pendientes de check-in"
                    className="p-datatable-sm"
                    stripedRows
                >
                    <Column
                        field="id_reservas"
                        header="ID"
                        sortable
                        style={{ width: '80px' }}
                    />
                    <Column
                        header="Huésped"
                        body={huespedTemplate}
                        style={{ minWidth: '200px' }}
                    />
                    <Column
                        header="Habitaciones"
                        body={habitacionesTemplate}
                        style={{ minWidth: '150px' }}
                    />
                    <Column
                        header="Fechas"
                        body={fechaTemplate}
                        sortable
                        sortField="fecha_checkin"
                        style={{ minWidth: '180px' }}
                    />
                    <Column
                        header="Personas"
                        body={personasTemplate}
                        style={{ width: '120px' }}
                    />
                    <Column
                        header="Monto Total"
                        body={montoTemplate}
                        sortable
                        sortField="monto_total"
                        style={{ width: '150px' }}
                    />
                    <Column
                        header="Estado"
                        body={validacionesTemplate}
                        style={{ width: '100px' }}
                    />
                    <Column
                        header="Acciones"
                        body={accionesTemplate}
                        style={{ width: '130px' }}
                    />
                </DataTable>
            </Card>

            {/* Dialog para ver detalles */}
            <Dialog
                header="Detalles de la Reserva"
                visible={showDetallesDialog}
                onHide={() => {
                    setShowDetallesDialog(false);
                    setSelectedReserva(null);
                }}
                style={{ width: '700px', maxWidth: '90vw' }}
                modal
            >
                {selectedReserva && (
                    <div className="space-y-4">
                        {/* Información de la Reserva */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <h3 className="font-bold text-lg text-blue-900 mb-2 flex items-center gap-2">
                                <i className="pi pi-info-circle"></i>
                                Información General
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-700">ID Reserva:</span>
                                    <p className="text-gray-900">#{selectedReserva.id_reservas}</p>
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
                            </div>
                        </div>

                        {/* Información del Huésped */}
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                            <h3 className="font-bold text-lg text-green-900 mb-2 flex items-center gap-2">
                                <i className="pi pi-user"></i>
                                Información del Huésped
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
                                        <span className="font-semibold text-gray-700">Teléfono:</span>
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

                        {/* Fechas de Estadía */}
                        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
                            <h3 className="font-bold text-lg text-purple-900 mb-2 flex items-center gap-2">
                                <i className="pi pi-calendar"></i>
                                Fechas de Estadía
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-700">Check-in:</span>
                                    <p className="text-gray-900 font-semibold">
                                        {new Date(selectedReserva.fecha_checkin).toLocaleString('es-AR', {
                                            dateStyle: 'full',
                                            timeStyle: 'short'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Check-out:</span>
                                    <p className="text-gray-900 font-semibold">
                                        {new Date(selectedReserva.fecha_checkout).toLocaleDateString('es-AR', {
                                            dateStyle: 'full'
                                        })}
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
                                {selectedReserva.reservas_habitaciones.map((rh, index) => {
                                    const excedeCapacidad = rh.cantidad_personas > rh.habitacion.capacidad;
                                    return (
                                        <div
                                            key={index}
                                            className={`border rounded-lg p-3 shadow-sm ${excedeCapacidad ? 'bg-red-50 border-red-300' : 'bg-white border-yellow-200'}`}
                                        >
                                            <div className="grid grid-cols-4 gap-3 text-sm">
                                                <div>
                                                    <span className="font-semibold text-gray-700">Número:</span>
                                                    <p className="text-gray-900 font-bold text-lg">
                                                        {rh.habitacion.numero}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-700">Tipo:</span>
                                                    <p className="text-gray-900">{rh.habitacion.tipo}</p>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-700">Capacidad:</span>
                                                    <p className="text-gray-900">{rh.habitacion.capacidad} persona{rh.habitacion.capacidad !== 1 ? 's' : ''}</p>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-700">Asignadas:</span>
                                                    <p className={`font-semibold ${excedeCapacidad ? 'text-red-600' : 'text-gray-900'}`}>
                                                        {rh.cantidad_personas}
                                                        {excedeCapacidad && (
                                                            <i className="pi pi-exclamation-triangle ml-2 text-xs" title="Excede la capacidad"></i>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            {excedeCapacidad && (
                                                <div className="mt-2 pt-2 border-t border-red-200">
                                                    <p className="text-xs text-red-700 flex items-center gap-1">
                                                        <i className="pi pi-exclamation-circle"></i>
                                                        <strong>Advertencia:</strong> Esta habitación tiene {rh.cantidad_personas - rh.habitacion.capacidad} persona{(rh.cantidad_personas - rh.habitacion.capacidad) > 1 ? 's' : ''} por encima de su capacidad
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-3 pt-3 border-t border-yellow-200 text-sm">
                                <p className="text-gray-700">
                                    <span className="font-semibold">Total de personas en la reserva:</span> {selectedReserva.cantidad_adultos + selectedReserva.cantidad_menores}
                                    ({selectedReserva.cantidad_adultos} adulto{selectedReserva.cantidad_adultos !== 1 ? 's' : ''}, {selectedReserva.cantidad_menores} menor{selectedReserva.cantidad_menores !== 1 ? 'es' : ''})
                                </p>
                            </div>
                        </div>

                        {/* Acompañantes (si hay) */}
                        {selectedReserva.acompanantes && selectedReserva.acompanantes.length > 0 && (
                            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded">
                                <h3 className="font-bold text-lg text-indigo-900 mb-3 flex items-center gap-2">
                                    <i className="pi pi-users"></i>
                                    Acompañantes ({selectedReserva.acompanantes.length})
                                </h3>
                                <div className="space-y-2">
                                    {selectedReserva.acompanantes.map((acompanante, index) => {
                                        const edad = Math.floor(
                                            (new Date().getTime() - new Date(acompanante.fecha_nacimiento).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
                                        );
                                        return (
                                            <div
                                                key={acompanante.id_acompanante}
                                                className="bg-white border border-indigo-200 rounded-lg p-3 shadow-sm"
                                            >
                                                <div className="grid grid-cols-3 gap-3 text-sm">
                                                    <div>
                                                        <span className="font-semibold text-gray-700">Nombre:</span>
                                                        <p className="text-gray-900">
                                                            {acompanante.nombre} {acompanante.apellido}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-700">DNI:</span>
                                                        <p className="text-gray-900">{acompanante.dni}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-700">Edad:</span>
                                                        <p className="text-gray-900">{edad} años</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Botón Cerrar */}
                        <div className="flex justify-end pt-3 border-t">
                            <Button
                                label="Cerrar"
                                icon="pi pi-times"
                                onClick={() => {
                                    setShowDetallesDialog(false);
                                    setSelectedReserva(null);
                                }}
                                className="p-button-secondary"
                            />
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Dialog para realizar check-in */}
            <Dialog
                header="Realizar Check-in"
                visible={showCheckinDialog}
                onHide={() => {
                    setShowCheckinDialog(false);
                    setSelectedReserva(null);
                    setTelefono('');
                    setEmail('');
                    setCurrentStep(1);
                    setAcompanantesData([]);
                }}
                style={{ width: '600px', maxWidth: '90vw' }}
                modal
            >
                {selectedReserva && (
                    <div className="space-y-4">
                        {/* Steps/Wizard indicator */}
                        {acompanantesData.length > 0 && (
                            <Steps
                                model={[
                                    { label: 'Información' },
                                    { label: 'Acompañantes' },
                                    { label: 'Confirmar' }
                                ]}
                                activeIndex={currentStep - 1}
                                readOnly
                                className="mb-4"
                            />
                        )}

                        {/* PASO 1: Información y Contacto */}
                        {currentStep === 1 && (
                            <>
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <i className="pi pi-info-circle text-blue-600"></i>
                                        Información de la Reserva
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="font-semibold">Reserva ID:</span>
                                        <span>#{selectedReserva.id_reservas}</span>

                                        <span className="font-semibold">Huésped Titular:</span>
                                        <span>{selectedReserva.huesped.nombre} {selectedReserva.huesped.apellido}</span>

                                        <span className="font-semibold">DNI:</span>
                                        <span>{selectedReserva.huesped.documento}</span>

                                        <span className="font-semibold">Habitaciones:</span>
                                        <span>
                                            {selectedReserva.reservas_habitaciones.map(rh => rh.habitacion.numero).join(', ')}
                                        </span>

                                        <span className="font-semibold">Total Personas:</span>
                                        <span className="font-medium text-blue-700">
                                            {selectedReserva.cantidad_adultos + selectedReserva.cantidad_menores}
                                            ({selectedReserva.cantidad_adultos} adultos, {selectedReserva.cantidad_menores} menores)
                                        </span>

                                        <span className="font-semibold">Check-in:</span>
                                        <span>
                                            {new Date(selectedReserva.fecha_checkin).toLocaleString('es-AR', {
                                                dateStyle: 'short',
                                                timeStyle: 'short'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Validaciones */}
                                {selectedReserva.validaciones && (
                                    <div className="space-y-2">
                                        {selectedReserva.validaciones.excede_capacidad && (
                                            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                                                <p className="text-sm text-red-800">
                                                    <i className="pi pi-exclamation-triangle mr-2"></i>
                                                    <strong>Advertencia:</strong> La cantidad de personas ({selectedReserva.validaciones.personas_total})
                                                    excede la capacidad total ({selectedReserva.validaciones.capacidad_total})
                                                </p>
                                            </div>
                                        )}
                                        {!selectedReserva.validaciones.tiene_metodo_pago && (
                                            <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
                                                <p className="text-sm text-orange-800">
                                                    <i className="pi pi-exclamation-circle mr-2"></i>
                                                    <strong>Atención:</strong> No hay método de pago registrado
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actualizar datos de contacto */}
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-gray-700 mb-3">Confirmar/Actualizar Contacto del Titular</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                                                Teléfono
                                            </label>
                                            <InputText
                                                id="telefono"
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value)}
                                                placeholder="Teléfono del huésped"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                                Email
                                            </label>
                                            <InputText
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Email del huésped"
                                                type="email"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* PASO 2: Acompañantes */}
                        {currentStep === 2 && acompanantesData.length > 0 && (
                            <div>
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-4">
                                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                        <i className="pi pi-users"></i>
                                        Registrar Acompañantes
                                    </h4>
                                    <p className="text-sm text-blue-800">
                                        La reserva tiene {selectedReserva.cantidad_adultos + selectedReserva.cantidad_menores} personas.
                                        Registre los datos de los {acompanantesData.length} acompañante{acompanantesData.length > 1 ? 's' : ''} (además del titular).
                                    </p>
                                </div>

                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {acompanantesData.map((acomp, index) => (
                                        <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                                            <h5 className="font-semibold text-gray-700 mb-3">
                                                Acompañante #{index + 1}
                                            </h5>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        Nombre *
                                                    </label>
                                                    <InputText
                                                        value={acomp.nombre}
                                                        onChange={(e) => {
                                                            const newData = [...acompanantesData];
                                                            newData[index].nombre = e.target.value;
                                                            setAcompanantesData(newData);
                                                        }}
                                                        placeholder="Nombre"
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        Apellido *
                                                    </label>
                                                    <InputText
                                                        value={acomp.apellido}
                                                        onChange={(e) => {
                                                            const newData = [...acompanantesData];
                                                            newData[index].apellido = e.target.value;
                                                            setAcompanantesData(newData);
                                                        }}
                                                        placeholder="Apellido"
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        DNI/Documento *
                                                    </label>
                                                    <InputText
                                                        value={acomp.dni}
                                                        onChange={(e) => {
                                                            const newData = [...acompanantesData];
                                                            newData[index].dni = e.target.value;
                                                            setAcompanantesData(newData);
                                                        }}
                                                        placeholder="Número de documento"
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        Fecha de Nacimiento *
                                                    </label>
                                                    <Calendar
                                                        value={acomp.fecha_nacimiento ? new Date(acomp.fecha_nacimiento) : null}
                                                        onChange={(e) => {
                                                            const newData = [...acompanantesData];
                                                            newData[index].fecha_nacimiento = e.value ? e.value.toISOString() : '';
                                                            setAcompanantesData(newData);
                                                        }}
                                                        dateFormat="dd/mm/yy"
                                                        placeholder="Seleccionar fecha"
                                                        showIcon
                                                        className="w-full"
                                                        maxDate={new Date()}
                                                        yearNavigator
                                                        yearRange="1920:2024"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PASO 3: Confirmación */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                                    <div className="flex items-start">
                                        <i className="pi pi-check-circle text-green-600 mr-3 mt-1 text-xl"></i>
                                        <div>
                                            <p className="font-semibold text-green-800 text-lg">
                                                ¿Confirmar check-in?
                                            </p>
                                            <p className="text-sm text-green-700 mt-1">
                                                Revise los datos antes de finalizar el proceso.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h5 className="font-semibold text-gray-800 mb-3">Resumen</h5>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Reserva:</span>
                                            <span className="font-semibold">#{selectedReserva.id_reservas}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Titular:</span>
                                            <span className="font-semibold">
                                                {selectedReserva.huesped.nombre} {selectedReserva.huesped.apellido}
                                            </span>
                                        </div>
                                        {acompanantesData.length > 0 && (
                                            <div className="border-t pt-2 mt-2">
                                                <span className="text-gray-600 font-semibold">
                                                    Acompañantes registrados: {acompanantesData.filter(a => a.nombre && a.dni).length}/{acompanantesData.length}
                                                </span>
                                                <div className="mt-2 space-y-1">
                                                    {acompanantesData.map((acomp, idx) => (
                                                        acomp.nombre && acomp.dni && (
                                                            <div key={idx} className="flex items-center gap-2 text-xs bg-white p-2 rounded">
                                                                <i className="pi pi-user text-blue-600"></i>
                                                                <span>{acomp.nombre} {acomp.apellido} - DNI: {acomp.dni}</span>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botones de navegación */}
                        <div className="flex justify-between gap-2 pt-4 border-t">
                            <Button
                                label="Cancelar"
                                icon="pi pi-times"
                                onClick={() => {
                                    setShowCheckinDialog(false);
                                    setSelectedReserva(null);
                                    setTelefono('');
                                    setEmail('');
                                    setCurrentStep(1);
                                    setAcompanantesData([]);
                                }}
                                className="p-button-text"
                                disabled={procesando}
                            />

                            <div className="flex gap-2">
                                {currentStep > 1 && (
                                    <Button
                                        label="Anterior"
                                        icon="pi pi-arrow-left"
                                        onClick={() => setCurrentStep(currentStep - 1)}
                                        className="p-button-secondary"
                                        disabled={procesando}
                                    />
                                )}

                                {currentStep < (acompanantesData.length > 0 ? 3 : 1) && (
                                    <Button
                                        label="Siguiente"
                                        icon="pi pi-arrow-right"
                                        iconPos="right"
                                        onClick={() => setCurrentStep(currentStep + 1)}
                                        className="p-button-primary"
                                        disabled={procesando}
                                    />
                                )}

                                {(currentStep === 3 || acompanantesData.length === 0) && (
                                    <Button
                                        label="Confirmar Check-in"
                                        icon="pi pi-check"
                                        onClick={handleRealizarCheckin}
                                        className="p-button-success"
                                        loading={procesando}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
};

export default CheckinTable;
