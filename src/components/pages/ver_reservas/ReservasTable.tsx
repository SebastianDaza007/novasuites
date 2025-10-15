import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { useRouter } from 'next/navigation';

interface Huesped {
    nombre: string;
    apellido: string;
    documento: string;
    telefono?: string;
    email?: string;
}

interface Habitacion {
    numero: string;
    tipo: string;
    capacidad: number;
}

interface ReservaHabitacion {
    habitacion: Habitacion;
    cantidad_personas: number;
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
    reservas_habitaciones: ReservaHabitacion[];
}

interface ReservasTableProps {
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
    onPage: (event: any) => void;
    onSort: (event: any) => void;
    toastRef: React.RefObject<Toast | null>;
}

const ReservasTable: React.FC<ReservasTableProps> = ({
    reservas,
    loading,
    totalRecords,
    lazyState,
    onPage,
    onSort,
    toastRef
}) => {
    const router = useRouter();
    const [showCancelarDialog, setShowCancelarDialog] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
    const [motivoCancelacion, setMotivoCancelacion] = useState('');
    const [cancelando, setCancelando] = useState(false);
    const [cargoPenalizacion, setCargoPenalizacion] = useState(0);
    const [diasAnticipacion, setDiasAnticipacion] = useState(0);

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
        const dias = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));

        return (
            <div>
                <div className="text-sm">
                    <strong>Entrada:</strong> {checkin.toLocaleDateString('es-AR')}
                </div>
                <div className="text-sm">
                    <strong>Salida:</strong> {checkout.toLocaleDateString('es-AR')}
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

    const estadoTemplate = (rowData: Reserva) => {
        const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
            RESERVADA: 'info',
            CHECKIN: 'success',
            CHECKOUT: 'warning',
            CANCELADA: 'danger'
        };

        return (
            <Tag
                value={rowData.estado}
                severity={severityMap[rowData.estado] || 'info'}
            />
        );
    };

    const montoTemplate = (rowData: Reserva) => {
        return (
            <div className="text-right font-semibold">
                ${Number(rowData.monto_total).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
        );
    };

    const handleCheckIn = (reserva: Reserva) => {
        // Redirigir a la página de check-in (por crear)
        router.push(`/reservas/check-in/${reserva.id_reservas}`);
    };

    const calcularDiasAnticipacion = (fechaCheckin: string): number => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche
        const checkin = new Date(fechaCheckin);
        checkin.setHours(0, 0, 0, 0);
        const diferencia = checkin.getTime() - hoy.getTime();
        return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    };

    const calcularCargoPenalizacion = (montoTotal: number, diasAnticipacion: number): number => {
        // Política de cancelación:
        // - Más de 5 días: Sin cargo
        // - 5 días o menos: 30% del monto total como penalización
        if (diasAnticipacion <= 5 && diasAnticipacion >= 0) {
            return montoTotal * 0.30;
        }
        return 0;
    };

    const handleOpenCancelar = (reserva: Reserva) => {
        setSelectedReserva(reserva);
        setMotivoCancelacion('');

        // Calcular días de anticipación y cargo por penalización
        const dias = calcularDiasAnticipacion(reserva.fecha_checkin);
        const cargo = calcularCargoPenalizacion(reserva.monto_total, dias);

        setDiasAnticipacion(dias);
        setCargoPenalizacion(cargo);
        setShowCancelarDialog(true);
    };

    const handleCheckout = (reserva: Reserva) => {
        // Redirigir a la página de checkout (por crear)
        router.push(`/reservas/check-out/${reserva.id_reservas}`);
    };

    const handleCancelarReserva = async () => {
        if (!selectedReserva) return;

        if (!motivoCancelacion.trim()) {
            toastRef.current?.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Por favor ingrese un motivo de cancelación',
                life: 3000
            });
            return;
        }

        setCancelando(true);
        try {
            const response = await fetch(`/api/ver_reservas/cancelar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_reserva: selectedReserva.id_reservas,
                    motivo: motivoCancelacion,
                    cargo_penalizacion: cargoPenalizacion
                })
            });

            const data = await response.json();

            if (data.success) {
                toastRef.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Reserva cancelada correctamente',
                    life: 3000
                });
                setShowCancelarDialog(false);
                setSelectedReserva(null);
                setMotivoCancelacion('');
                // Recargar la página para actualizar la tabla
                window.location.reload();
            } else {
                toastRef.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: data.message || 'Error al cancelar la reserva',
                    life: 3000
                });
            }
        } catch (error) {
            console.error('Error al cancelar reserva:', error);
            toastRef.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al conectar con el servidor',
                life: 3000
            });
        } finally {
            setCancelando(false);
        }
    };

    const accionesTemplate = (rowData: Reserva) => {
        const isReservada = rowData.estado === 'RESERVADA';
        const isCheckin = rowData.estado === 'CHECKIN';
        const isCancelada = rowData.estado === 'CANCELADA';
        const isCheckout = rowData.estado === 'CHECKOUT';

        return (
            <div className="flex gap-2">
                {/* Botón Check-in - Solo visible para estado RESERVADA */}
                {isReservada && (
                    <Button
                        icon="pi pi-sign-in"
                        rounded
                        outlined
                        className="p-button-success"
                        tooltip="Check-in"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => handleCheckIn(rowData)}
                    />
                )}

                {/* Botón Checkout - Solo visible para estado CHECKIN */}
                {isCheckin && (
                    <Button
                        icon="pi pi-sign-out"
                        rounded
                        outlined
                        className="p-button-warning"
                        tooltip="Check-out"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => handleCheckout(rowData)}
                    />
                )}

                {/* Botón Cancelar - Solo visible y habilitado para estado RESERVADA */}
                {isReservada && (
                    <Button
                        icon="pi pi-times"
                        rounded
                        outlined
                        className="p-button-danger"
                        tooltip="Cancelar reserva"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => handleOpenCancelar(rowData)}
                    />
                )}

                {/* Estados finalizados - Sin acciones */}
                {(isCancelada || isCheckout) && (
                    <span className="text-xs text-gray-500 italic">Sin acciones disponibles</span>
                )}
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
                    emptyMessage="No se encontraron reservas"
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
                        header="Estado"
                        body={estadoTemplate}
                        sortable
                        sortField="estado"
                        style={{ width: '130px' }}
                    />
                    <Column
                        header="Monto Total"
                        body={montoTemplate}
                        sortable
                        sortField="monto_total"
                        style={{ width: '150px' }}
                    />
                    <Column
                        header="Acciones"
                        body={accionesTemplate}
                        style={{ width: '130px' }}
                    />
                </DataTable>
            </Card>

            {/* Dialog para cancelar reserva */}
            <Dialog
                header="Cancelar Reserva"
                visible={showCancelarDialog}
                onHide={() => {
                    setShowCancelarDialog(false);
                    setSelectedReserva(null);
                    setMotivoCancelacion('');
                }}
                style={{ width: '500px' }}
                modal
            >
                {selectedReserva && (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex items-start">
                                <i className="pi pi-exclamation-triangle text-yellow-600 mr-3 mt-1"></i>
                                <div>
                                    <p className="font-semibold text-yellow-800">
                                        ¿Está seguro de cancelar esta reserva?
                                    </p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Esta acción no se puede deshacer.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <span className="font-semibold">Reserva ID:</span>
                                <span>#{selectedReserva.id_reservas}</span>

                                <span className="font-semibold">Huésped:</span>
                                <span>{selectedReserva.huesped.nombre} {selectedReserva.huesped.apellido}</span>

                                <span className="font-semibold">DNI:</span>
                                <span>{selectedReserva.huesped.documento}</span>

                                <span className="font-semibold">Fecha Check-in:</span>
                                <span>{new Date(selectedReserva.fecha_checkin).toLocaleDateString('es-AR')}</span>

                                <span className="font-semibold">Monto Total:</span>
                                <span className="font-semibold">
                                    ${Number(selectedReserva.monto_total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        {/* Información de política de cancelación */}
                        {diasAnticipacion > 5 ? (
                            <div className="bg-green-50 border-l-4 border-green-400 p-4">
                                <div className="flex items-start">
                                    <i className="pi pi-check-circle text-green-600 mr-3 mt-1"></i>
                                    <div>
                                        <p className="font-semibold text-green-800">
                                            Cancelación sin cargo
                                        </p>
                                        <p className="text-sm text-green-700 mt-1">
                                            Faltan {diasAnticipacion} días para el check-in. No se aplicará cargo por cancelación.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                <div className="flex items-start">
                                    <i className="pi pi-info-circle text-red-600 mr-3 mt-1"></i>
                                    <div>
                                        <p className="font-semibold text-red-800">
                                            Cargo por cancelación tardía
                                        </p>
                                        <p className="text-sm text-red-700 mt-1">
                                            {diasAnticipacion > 0
                                                ? `Faltan solo ${diasAnticipacion} día${diasAnticipacion !== 1 ? 's' : ''} para el check-in.`
                                                : 'La fecha de check-in es hoy o ya pasó.'
                                            } Se aplicará un cargo de penalización del 30%.
                                        </p>
                                        <p className="text-sm font-semibold text-red-800 mt-2">
                                            Cargo: ${cargoPenalizacion.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label htmlFor="motivo" className="font-semibold text-gray-700">
                                Motivo de cancelación <span className="text-red-500">*</span>
                            </label>
                            <InputTextarea
                                id="motivo"
                                value={motivoCancelacion}
                                onChange={(e) => setMotivoCancelacion(e.target.value)}
                                rows={4}
                                placeholder="Ingrese el motivo de la cancelación..."
                                className="w-full"
                                autoResize
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                label="Volver"
                                icon="pi pi-times"
                                onClick={() => {
                                    setShowCancelarDialog(false);
                                    setSelectedReserva(null);
                                    setMotivoCancelacion('');
                                }}
                                className="p-button-text"
                                disabled={cancelando}
                            />
                            <Button
                                label="Cancelar Reserva"
                                icon="pi pi-ban"
                                onClick={handleCancelarReserva}
                                className="p-button-danger"
                                loading={cancelando}
                            />
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
};

export default ReservasTable;
