import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Timeline } from 'primereact/timeline';
import { Tag } from 'primereact/tag';

const CalendarioLimpieza = () => {
    const [date, setDate] = useState<Date>(new Date());

    const eventos = [
        {
            fecha: '08:00',
            habitacion: '101 - 105',
            tipo: 'Limpieza Matutina',
            personal: 'Equipo A',
            status: 'completado'
        },
        {
            fecha: '10:30',
            habitacion: '201 - 210',
            tipo: 'Limpieza Post Check-out',
            personal: 'Equipo B',
            status: 'en-progreso'
        },
        {
            fecha: '13:00',
            habitacion: '301 - 308',
            tipo: 'Limpieza Express',
            personal: 'Equipo C',
            status: 'pendiente'
        },
        {
            fecha: '15:30',
            habitacion: '401 - 415',
            tipo: 'Limpieza Vespertina',
            personal: 'Equipo A',
            status: 'pendiente'
        },
        {
            fecha: '18:00',
            habitacion: '501 - 512',
            tipo: 'Inspección Final',
            personal: 'Supervisor',
            status: 'pendiente'
        }
    ];

    const customizedMarker = (item: any) => {
        const iconMap: any = {
            'completado': { icon: 'pi-check-circle', color: 'bg-green-500' },
            'en-progreso': { icon: 'pi-spin pi-spinner', color: 'bg-blue-500' },
            'pendiente': { icon: 'pi-clock', color: 'bg-gray-400' }
        };

        const config = iconMap[item.status];

        return (
            <span className={`flex items-center justify-center w-8 h-8 rounded-full ${config.color} text-white shadow-md`}>
                <i className={`pi ${config.icon}`}></i>
            </span>
        );
    };

    const customizedContent = (item: any) => {
        const severityMap: any = {
            'completado': 'success',
            'en-progreso': 'info',
            'pendiente': 'warning'
        };

        return (
            <Card className="shadow-sm mb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Tag value={item.tipo} severity={severityMap[item.status]} />
                            <span className="text-sm text-gray-600">{item.personal}</span>
                        </div>
                        <p className="font-semibold text-gray-800">Habitaciones: {item.habitacion}</p>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-4">
            {/* Selector de fecha y vista general */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                    <Card>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            <i className="pi pi-calendar mr-2"></i>
                            Seleccionar Fecha
                        </h3>
                        <Calendar
                            value={date}
                            onChange={(e: any) => setDate(e.value)}
                            inline
                            className="w-full"
                        />
                    </Card>

                    <Card className="mt-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            <i className="pi pi-chart-bar mr-2"></i>
                            Resumen del Día
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                                <div className="flex items-center gap-2">
                                    <i className="pi pi-check-circle text-green-600"></i>
                                    <span className="text-sm font-semibold text-green-800">Completadas</span>
                                </div>
                                <span className="text-2xl font-bold text-green-600">12</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                                <div className="flex items-center gap-2">
                                    <i className="pi pi-spinner text-blue-600"></i>
                                    <span className="text-sm font-semibold text-blue-800">En Progreso</span>
                                </div>
                                <span className="text-2xl font-bold text-blue-600">5</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                    <i className="pi pi-clock text-gray-600"></i>
                                    <span className="text-sm font-semibold text-gray-800">Pendientes</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-600">8</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            <i className="pi pi-list mr-2"></i>
                            Cronograma del Día
                        </h3>
                        <Timeline
                            value={eventos}
                            align="left"
                            className="customized-timeline"
                            marker={customizedMarker}
                            content={customizedContent}
                            opposite={(item) => <span className="font-bold text-gray-700">{item.fecha}</span>}
                        />
                    </Card>
                </div>
            </div>

            {/* Estadísticas semanales */}
            <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    <i className="pi pi-chart-line mr-2"></i>
                    Rendimiento Semanal
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia, index) => (
                        <div key={index} className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                            <p className="text-sm font-semibold text-blue-700 mb-2">{dia}</p>
                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-blue-600">{Math.floor(Math.random() * 20) + 15}</p>
                                <p className="text-xs text-blue-600">habitaciones</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Información de demo */}
            <Card className="bg-blue-50 border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                    <i className="pi pi-info-circle text-blue-600 text-xl mt-1"></i>
                    <div>
                        <p className="font-semibold text-blue-900">Módulo de Demostración</p>
                        <p className="text-sm text-blue-700">
                            Esta sección muestra una vista previa del calendario de limpieza.
                            Los datos mostrados son ejemplos y no reflejan información real del sistema.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CalendarioLimpieza;
