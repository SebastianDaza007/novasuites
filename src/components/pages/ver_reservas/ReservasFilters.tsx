import React from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

interface ReservasFiltersProps {
    busqueda: string;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    estadoFiltro: string | null;
    onBusquedaChange: (value: string) => void;
    onFechaInicioChange: (value: Date | null) => void;
    onFechaFinChange: (value: Date | null) => void;
    onEstadoChange: (value: string | null) => void;
    onLimpiarFiltros: () => void;
    onActualizar: () => void;
}

const ReservasFilters: React.FC<ReservasFiltersProps> = ({
    busqueda,
    fechaInicio,
    fechaFin,
    estadoFiltro,
    onBusquedaChange,
    onFechaInicioChange,
    onFechaFinChange,
    onEstadoChange,
    onLimpiarFiltros,
    onActualizar
}) => {
    const estadosReserva = [
        { label: 'Todos', value: null },
        { label: 'Reservada', value: 'RESERVADA' },
        { label: 'Check-in', value: 'CHECKIN' },
        { label: 'Check-out', value: 'CHECKOUT' },
        { label: 'Cancelada', value: 'CANCELADA' }
    ];

    return (
        <Card className="mb-4">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Reservas de Habitaciones</h1>
                <p className="text-gray-600">Visualiza y gestiona las reservas del hotel</p>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Búsqueda</label>
                    <InputText
                        value={busqueda}
                        onChange={(e) => onBusquedaChange(e.target.value)}
                        placeholder="Buscar por nombre, DNI..."
                        className="w-full"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Fecha desde</label>
                    <Calendar
                        value={fechaInicio}
                        onChange={(e) => onFechaInicioChange(e.value as Date)}
                        placeholder="Fecha inicio"
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Fecha hasta</label>
                    <Calendar
                        value={fechaFin}
                        onChange={(e) => onFechaFinChange(e.value as Date)}
                        placeholder="Fecha fin"
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Estado</label>
                    <Dropdown
                        value={estadoFiltro}
                        options={estadosReserva}
                        onChange={(e) => onEstadoChange(e.value)}
                        placeholder="Seleccionar estado"
                        className="w-full"
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    label="Limpiar Filtros"
                    icon="pi pi-filter-slash"
                    onClick={onLimpiarFiltros}
                    className="p-button-outlined"
                />
                <Button
                    label="Actualizar"
                    icon="pi pi-refresh"
                    onClick={onActualizar}
                    className="p-button-outlined"
                />
            </div>
        </Card>
    );
};

export default ReservasFilters;
