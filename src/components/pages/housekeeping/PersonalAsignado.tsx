import React from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';

const PersonalAsignado = () => {
    const personal = [
        {
            id: 1,
            nombre: 'María González',
            foto: 'MG',
            rol: 'Supervisor',
            turno: 'Mañana',
            tareas_asignadas: 8,
            tareas_completadas: 6,
            estado: 'Activo',
            telefono: '+54 11 2345-6789',
            email: 'maria.gonzalez@hotel.com'
        },
        {
            id: 2,
            nombre: 'Carlos Ruiz',
            foto: 'CR',
            rol: 'Limpieza',
            turno: 'Mañana',
            tareas_asignadas: 12,
            tareas_completadas: 9,
            estado: 'Activo',
            telefono: '+54 347345-6790',
            email: 'carlos.ruiz@hotel.com'
        },
        {
            id: 3,
            nombre: 'Ana Martínez',
            foto: 'AM',
            rol: 'Limpieza',
            turno: 'Tarde',
            tareas_asignadas: 10,
            tareas_completadas: 10,
            estado: 'Activo',
            telefono: '+54 387345-6791',
            email: 'ana.martinez@hotel.com'
        },
        {
            id: 4,
            nombre: 'Lautaro Papiruna',
            foto: 'LP',
            rol: 'Limpieza',
            turno: 'Tarde',
            tareas_asignadas: 15,
            tareas_completadas: 8,
            estado: 'En Descanso',
            telefono: '+54 351345-6792',
            email: 'juan.lopez@hotel.com'
        },
        {
            id: 5,
            nombre: 'Laura Fernández',
            foto: 'LF',
            rol: 'Camarera',
            turno: 'Noche',
            tareas_asignadas: 6,
            tareas_completadas: 3,
            estado: 'Activo',
            telefono: '+54 387345-6793',
            email: 'laura.fernandez@hotel.com'
        },
        {
            id: 6,
            nombre: 'Sebastian Sánchez',
            foto: 'PS',
            rol: 'Supervisor',
            turno: 'Noche',
            tareas_asignadas: 5,
            tareas_completadas: 5,
            estado: 'Activo',
            telefono: '+54 387345-6794',
            email: 'pedro.sanchez@hotel.com'
        }
    ];

    const calcularProgreso = (completadas: number, asignadas: number) => {
        return Math.round((completadas / asignadas) * 100);
    };

    const getEstadoSeverity = (estado: string) => {
        switch (estado) {
            case 'Activo':
                return 'success';
            case 'En Descanso':
                return 'warning';
            default:
                return 'info';
        }
    };

    const getRolColor = (rol: string) => {
        return rol === 'Supervisor' ? 'bg-purple-500' : 'bg-blue-500';
    };

    return (
        <div className="space-y-4">
            {/* Resumen general */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-semibold">Personal Total</p>
                            <p className="text-3xl font-bold text-blue-600">6</p>
                        </div>
                        <i className="pi pi-users text-4xl text-blue-500"></i>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-semibold">Activos</p>
                            <p className="text-3xl font-bold text-green-600">5</p>
                        </div>
                        <i className="pi pi-check-circle text-4xl text-green-500"></i>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-700 font-semibold">Supervisores</p>
                            <p className="text-3xl font-bold text-purple-600">2</p>
                        </div>
                        <i className="pi pi-star text-4xl text-purple-500"></i>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-700 font-semibold">Eficiencia Prom.</p>
                            <p className="text-3xl font-bold text-orange-600">82%</p>
                        </div>
                        <i className="pi pi-chart-line text-4xl text-orange-500"></i>
                    </div>
                </Card>
            </div>

            {/* Tarjetas de personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personal.map((persona) => {
                    const progreso = calcularProgreso(persona.tareas_completadas, persona.tareas_asignadas);

                    return (
                        <Card key={persona.id} className="shadow-md hover:shadow-lg transition-shadow">
                            <div className="space-y-4">
                                {/* Header con foto y nombre */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            label={persona.foto}
                                            size="xlarge"
                                            className={`${getRolColor(persona.rol)} text-white font-bold`}
                                            shape="circle"
                                        />
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">{persona.nombre}</h3>
                                            <Tag value={persona.rol} severity={persona.rol === 'Supervisor' ? 'warning' : 'info'} />
                                        </div>
                                    </div>
                                    <Tag value={persona.estado} severity={getEstadoSeverity(persona.estado)} />
                                </div>

                                {/* Información del turno */}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <i className="pi pi-clock"></i>
                                    <span>Turno: <strong>{persona.turno}</strong></span>
                                </div>

                                {/* Progreso de tareas */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-700">Tareas del día</span>
                                        <span className="text-sm font-bold text-gray-800">
                                            {persona.tareas_completadas}/{persona.tareas_asignadas}
                                        </span>
                                    </div>
                                    <ProgressBar value={progreso} className="h-2" />
                                    <p className="text-xs text-gray-600 mt-1 text-right">{progreso}% completado</p>
                                </div>

                                {/* Contacto */}
                                <div className="border-t pt-3 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <i className="pi pi-phone text-gray-500"></i>
                                        <span>{persona.telefono}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <i className="pi pi-envelope text-gray-500"></i>
                                        <span className="truncate">{persona.email}</span>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        label="Ver Tareas"
                                        icon="pi pi-list"
                                        className="p-button-sm p-button-outlined flex-1"
                                    />
                                    <Button
                                        icon="pi pi-phone"
                                        className="p-button-sm p-button-outlined"
                                        tooltip="Llamar"
                                    />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Información de demo */}
            <Card className="bg-blue-50 border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                    <i className="pi pi-info-circle text-blue-600 text-xl mt-1"></i>
                    <div>
                        <p className="font-semibold text-blue-900">Módulo de Demostración</p>
                        <p className="text-sm text-blue-700">
                            Esta sección muestra una vista previa del personal asignado a housekeeping.
                            Los datos mostrados son ejemplos y no reflejan información real del sistema.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PersonalAsignado;
