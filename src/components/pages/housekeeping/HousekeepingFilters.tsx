import React from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

interface HousekeepingFiltersProps {
    estadoFiltro: string;
    tipoFiltro: string;
    busqueda: string;
    onEstadoChange: (value: string) => void;
    onTipoChange: (value: string) => void;
    onBusquedaChange: (value: string) => void;
    onLimpiarFiltros: () => void;
    onActualizar: () => void;
}

const HousekeepingFilters: React.FC<HousekeepingFiltersProps> = ({
    estadoFiltro,
    tipoFiltro,
    busqueda,
    onEstadoChange,
    onTipoChange,
    onBusquedaChange,
    onLimpiarFiltros,
    onActualizar
}) => {
    const estadosHabitacion = [
        { label: 'Todos los estados', value: '' },
        { label: 'Disponible', value: 'DISPONIBLE' },
        { label: 'Ocupada', value: 'OCUPADA' },
        { label: 'Limpieza', value: 'LIMPIEZA' },
        { label: 'Mantenimiento', value: 'MANTENIMIENTO' }
    ];

    const tiposHabitacion = [
        { label: 'Todos los tipos', value: '' },
        { label: 'Simple', value: 'SIMPLE' },
        { label: 'Doble', value: 'DOBLE' },
        { label: 'Suite', value: 'SUITE' },
        { label: 'Deluxe', value: 'DELUXE' }
    ];

    return (
        <Card className="mb-6 shadow-md">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        <i className="pi pi-filter mr-2"></i>
                        Filtros
                    </h2>
                    <div className="flex gap-2">
                        <Button
                            label="Actualizar"
                            icon="pi pi-refresh"
                            className="p-button-outlined"
                            onClick={onActualizar}
                        />
                        <Button
                            label="Limpiar"
                            icon="pi pi-times"
                            className="p-button-outlined p-button-secondary"
                            onClick={onLimpiarFiltros}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Búsqueda */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="busqueda" className="font-semibold text-gray-700">
                            Búsqueda
                        </label>
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search" />
                            <InputText
                                id="busqueda"
                                value={busqueda}
                                onChange={(e) => onBusquedaChange(e.target.value)}
                                placeholder="Buscar por número..."
                                className="w-full"
                            />
                        </span>
                    </div>

                    {/* Estado */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="estado" className="font-semibold text-gray-700">
                            Estado
                        </label>
                        <Dropdown
                            id="estado"
                            value={estadoFiltro}
                            onChange={(e) => onEstadoChange(e.value)}
                            options={estadosHabitacion}
                            placeholder="Seleccionar estado"
                            className="w-full"
                        />
                    </div>

                    {/* Tipo */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="tipo" className="font-semibold text-gray-700">
                            Tipo de Habitación
                        </label>
                        <Dropdown
                            id="tipo"
                            value={tipoFiltro}
                            onChange={(e) => onTipoChange(e.value)}
                            options={tiposHabitacion}
                            placeholder="Seleccionar tipo"
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default HousekeepingFilters;
