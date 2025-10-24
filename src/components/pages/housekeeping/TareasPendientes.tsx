import React from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

const TareasPendientes = () => {
    const tareasMockup = [
        {
            id: 1,
            habitacion: '101',
            tarea: 'Limpieza completa',
            prioridad: 'Alta',
            asignado: 'María González',
            estado: 'Pendiente',
            tiempo_estimado: '45 min'
        },
        {
            id: 2,
            habitacion: '205',
            tarea: 'Cambio de sábanas',
            prioridad: 'Media',
            asignado: 'Carlos Ruiz',
            estado: 'En Progreso',
            tiempo_estimado: '20 min'
        },
        {
            id: 3,
            habitacion: '310',
            tarea: 'Limpieza profunda',
            prioridad: 'Alta',
            asignado: 'Ana Martínez',
            estado: 'Pendiente',
            tiempo_estimado: '60 min'
        },
        {
            id: 4,
            habitacion: '402',
            tarea: 'Reposición de amenities',
            prioridad: 'Baja',
            asignado: 'Juan López',
            estado: 'En Progreso',
            tiempo_estimado: '15 min'
        },
        {
            id: 5,
            habitacion: '508',
            tarea: 'Limpieza express',
            prioridad: 'Media',
            asignado: 'María González',
            estado: 'Completada',
            tiempo_estimado: '30 min'
        }
    ];

    const prioridadTemplate = (rowData: any) => {
        const severityMap: any = {
            'Alta': 'danger',
            'Media': 'warning',
            'Baja': 'info'
        };

        return <Tag value={rowData.prioridad} severity={severityMap[rowData.prioridad]} />;
    };

    const estadoTemplate = (rowData: any) => {
        const severityMap: any = {
            'Pendiente': 'warning',
            'En Progreso': 'info',
            'Completada': 'success'
        };

        return <Tag value={rowData.estado} severity={severityMap[rowData.estado]} />;
    };

    const accionesTemplate = () => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-check" rounded outlined severity="success" size="small" tooltip="Completar" />
                <Button icon="pi pi-pencil" rounded outlined severity="info" size="small" tooltip="Editar" />
                <Button icon="pi pi-times" rounded outlined severity="danger" size="small" tooltip="Cancelar" />
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Resumen de tareas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-red-50 to-red-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-700 font-semibold">Prioridad Alta</p>
                            <p className="text-3xl font-bold text-red-600">2</p>
                        </div>
                        <i className="pi pi-exclamation-circle text-4xl text-red-500"></i>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-700 font-semibold">Pendientes</p>
                            <p className="text-3xl font-bold text-yellow-600">2</p>
                        </div>
                        <i className="pi pi-clock text-4xl text-yellow-500"></i>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-semibold">En Progreso</p>
                            <p className="text-3xl font-bold text-blue-600">2</p>
                        </div>
                        <i className="pi pi-spinner text-4xl text-blue-500"></i>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-semibold">Completadas Hoy</p>
                            <p className="text-3xl font-bold text-green-600">8</p>
                        </div>
                        <i className="pi pi-check-circle text-4xl text-green-500"></i>
                    </div>
                </Card>
            </div>

            {/* Tabla de tareas */}
            <Card>
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        <i className="pi pi-list mr-2"></i>
                        Lista de Tareas
                    </h2>
                </div>
                <DataTable
                    value={tareasMockup}
                    stripedRows
                    className="p-datatable-sm"
                    emptyMessage="No hay tareas pendientes"
                >
                    <Column field="habitacion" header="Habitación" sortable />
                    <Column field="tarea" header="Tarea" sortable />
                    <Column field="prioridad" header="Prioridad" body={prioridadTemplate} sortable />
                    <Column field="asignado" header="Asignado a" sortable />
                    <Column field="tiempo_estimado" header="Tiempo Est." sortable />
                    <Column field="estado" header="Estado" body={estadoTemplate} sortable />
                    <Column header="Acciones" body={accionesTemplate} style={{ width: '180px' }} />
                </DataTable>
            </Card>

            {/* Información de demo */}
            <Card className="bg-blue-50 border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                    <i className="pi pi-info-circle text-blue-600 text-xl mt-1"></i>
                    <div>
                        <p className="font-semibold text-blue-900">Módulo de Demostración</p>
                        <p className="text-sm text-blue-700">
                            Esta sección muestra una vista previa de la gestión de tareas pendientes.
                            Los datos mostrados son ejemplos y no reflejan información real del sistema.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default TareasPendientes;
