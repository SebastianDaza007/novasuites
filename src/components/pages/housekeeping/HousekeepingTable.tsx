import React, { useState } from 'react';
import { DataTable, DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { SortOrder } from 'primereact/api';

interface Habitacion {
    id_habitaciones: number;
    numero: string;
    tipo: string;
    capacidad: number;
    precio_base: number;
    estado: string;
}

interface HousekeepingTableProps {
    habitaciones: Habitacion[];
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
    onEstadoActualizado: () => void;
}

const HousekeepingTable: React.FC<HousekeepingTableProps> = ({
    habitaciones,
    loading,
    totalRecords,
    lazyState,
    onPage,
    onSort,
    toastRef,
    onEstadoActualizado
}) => {
    const [showCambiarEstadoDialog, setShowCambiarEstadoDialog] = useState(false);
    const [selectedHabitacion, setSelectedHabitacion] = useState<Habitacion | null>(null);
    const [nuevoEstado, setNuevoEstado] = useState<string>('');
    const [observaciones, setObservaciones] = useState('');
    const [procesando, setProcesando] = useState(false);

    const estadosDisponibles = [
        { label: 'Disponible', value: 'DISPONIBLE' },
        { label: 'Ocupada', value: 'OCUPADA' },
        { label: 'Limpieza', value: 'LIMPIEZA' },
        { label: 'Mantenimiento', value: 'MANTENIMIENTO' }
    ];

    // Abrir dialog para cambiar estado
    const handleAbrirCambiarEstado = (habitacion: Habitacion) => {
        setSelectedHabitacion(habitacion);
        setNuevoEstado(habitacion.estado);
        setObservaciones('');
        setShowCambiarEstadoDialog(true);
    };

    // Cambiar estado de habitación
    const handleCambiarEstado = async () => {
        if (!selectedHabitacion) return;

        if (nuevoEstado === selectedHabitacion.estado) {
            toastRef.current?.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'El estado seleccionado es el mismo que el actual',
                life: 3000
            });
            return;
        }

        setProcesando(true);

        try {
            const response = await fetch('/api/housekeeping/cambiar-estado', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_habitacion: selectedHabitacion.id_habitaciones,
                    nuevo_estado: nuevoEstado,
                    observaciones: observaciones || undefined
                })
            });

            const data = await response.json();

            if (data.success) {
                toastRef.current?.show({
                    severity: 'success',
                    summary: 'Estado actualizado',
                    detail: `Habitación ${selectedHabitacion.numero} ahora está en estado: ${nuevoEstado}`,
                    life: 3000
                });

                setShowCambiarEstadoDialog(false);
                setSelectedHabitacion(null);
                setNuevoEstado('');
                setObservaciones('');
                onEstadoActualizado();
            } else {
                toastRef.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: data.message || 'No se pudo cambiar el estado',
                    life: 5000
                });
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error);
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

    // Marcar como limpia directamente
    const handleMarcarLimpia = async (habitacion: Habitacion) => {
        setProcesando(true);

        try {
            const response = await fetch('/api/housekeeping/cambiar-estado', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_habitacion: habitacion.id_habitaciones,
                    nuevo_estado: 'DISPONIBLE',
                    observaciones: 'Limpieza completada'
                })
            });

            const data = await response.json();

            if (data.success) {
                toastRef.current?.show({
                    severity: 'success',
                    summary: 'Habitación limpia',
                    detail: `Habitación ${habitacion.numero} marcada como limpia y disponible`,
                    life: 3000
                });

                onEstadoActualizado();
            } else {
                toastRef.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: data.message || 'No se pudo marcar como limpia',
                    life: 5000
                });
            }
        } catch (error) {
            console.error('Error al marcar como limpia:', error);
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
    const numeroTemplate = (rowData: Habitacion) => {
        return (
            <div className="flex items-center gap-2">
                <i className="pi pi-home text-gray-600"></i>
                <span className="font-bold text-lg">{rowData.numero}</span>
            </div>
        );
    };

    const tipoTemplate = (rowData: Habitacion) => {
        const iconMap: Record<string, string> = {
            SIMPLE: 'pi-user',
            DOBLE: 'pi-users',
            SUITE: 'pi-star',
            DELUXE: 'pi-star-fill'
        };

        return (
            <div className="flex items-center gap-2">
                <i className={`pi ${iconMap[rowData.tipo] || 'pi-home'} text-gray-600`}></i>
                <span>{rowData.tipo}</span>
            </div>
        );
    };

    const capacidadTemplate = (rowData: Habitacion) => {
        return (
            <div className="flex items-center gap-2">
                <i className="pi pi-users text-gray-600"></i>
                <span>{rowData.capacidad} persona{rowData.capacidad !== 1 ? 's' : ''}</span>
            </div>
        );
    };


    const estadoTemplate = (rowData: Habitacion) => {
        const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
            DISPONIBLE: 'success',
            OCUPADA: 'info',
            LIMPIEZA: 'warning',
            MANTENIMIENTO: 'danger'
        };

        const iconMap: Record<string, string> = {
            DISPONIBLE: 'pi-check-circle',
            OCUPADA: 'pi-users',
            LIMPIEZA: 'pi-sync',
            MANTENIMIENTO: 'pi-wrench'
        };

        return (
            <Tag
                value={rowData.estado}
                severity={severityMap[rowData.estado] || 'info'}
                icon={`pi ${iconMap[rowData.estado]}`}
            />
        );
    };

    const accionesTemplate = (rowData: Habitacion) => {
        return (
            <div className="flex gap-2">
                {/* Botón para marcar como limpia - solo visible en estado LIMPIEZA */}
                {rowData.estado === 'LIMPIEZA' && (
                    <Button
                        icon="pi pi-check"
                        rounded
                        outlined
                        severity="success"
                        tooltip="Marcar como limpia"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => handleMarcarLimpia(rowData)}
                        disabled={procesando}
                    />
                )}

                {/* Botón para cambiar estado */}
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    severity="info"
                    tooltip="Cambiar estado"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleAbrirCambiarEstado(rowData)}
                />
            </div>
        );
    };

    return (
        <>
            <Card className="shadow-md">
                <DataTable
                    value={habitaciones}
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
                    emptyMessage="No hay habitaciones disponibles"
                    className="p-datatable-sm"
                    rowsPerPageOptions={[10, 20, 50]}
                    stripedRows
                >
                    <Column
                        field="numero"
                        header="Número"
                        body={numeroTemplate}
                        sortable
                        style={{ width: '150px' }}
                    />
                    <Column
                        field="tipo"
                        header="Tipo"
                        body={tipoTemplate}
                        sortable
                        style={{ width: '200px' }}
                    />
                    <Column
                        field="capacidad"
                        header="Capacidad"
                        body={capacidadTemplate}
                        sortable
                        style={{ width: '150px' }}
                    />
                    <Column
                        field="estado"
                        header="Estado"
                        body={estadoTemplate}
                        sortable
                        style={{ width: '180px' }}
                    />
                    <Column
                        header="Acciones"
                        body={accionesTemplate}
                        style={{ width: '150px' }}
                    />
                </DataTable>
            </Card>

            {/* Dialog para cambiar estado */}
            <Dialog
                visible={showCambiarEstadoDialog}
                onHide={() => !procesando && setShowCambiarEstadoDialog(false)}
                header="Cambiar Estado de Habitación"
                modal
                style={{ width: '500px' }}
            >
                {selectedHabitacion && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                            <p className="font-semibold text-blue-900">
                                Habitación {selectedHabitacion.numero}
                            </p>
                            <p className="text-sm text-blue-700">
                                {selectedHabitacion.tipo} - Capacidad: {selectedHabitacion.capacidad} persona{selectedHabitacion.capacidad !== 1 ? 's' : ''}
                            </p>
                            <div className="mt-2">
                                <span className="text-sm text-blue-700">Estado actual: </span>
                                <Tag
                                    value={selectedHabitacion.estado}
                                    severity={
                                        selectedHabitacion.estado === 'DISPONIBLE' ? 'success' :
                                        selectedHabitacion.estado === 'OCUPADA' ? 'info' :
                                        selectedHabitacion.estado === 'LIMPIEZA' ? 'warning' : 'danger'
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="nuevo-estado" className="font-semibold text-gray-700">
                                Nuevo Estado <span className="text-red-500">*</span>
                            </label>
                            <Dropdown
                                id="nuevo-estado"
                                value={nuevoEstado}
                                onChange={(e) => setNuevoEstado(e.value)}
                                options={estadosDisponibles}
                                placeholder="Seleccionar estado"
                                className="w-full"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="observaciones" className="font-semibold text-gray-700">
                                Observaciones
                            </label>
                            <InputTextarea
                                id="observaciones"
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                rows={4}
                                placeholder="Ingrese observaciones (opcional)..."
                                className="w-full"
                                autoResize
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                label="Cancelar"
                                icon="pi pi-times"
                                className="p-button-text"
                                onClick={() => setShowCambiarEstadoDialog(false)}
                                disabled={procesando}
                            />
                            <Button
                                label="Guardar"
                                icon="pi pi-check"
                                className="p-button-success"
                                onClick={handleCambiarEstado}
                                loading={procesando}
                            />
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
};

export default HousekeepingTable;
