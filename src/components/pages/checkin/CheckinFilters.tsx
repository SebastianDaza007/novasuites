import React from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';

interface CheckinFiltersProps {
    busqueda: string;
    onBusquedaChange: (value: string) => void;
    onLimpiarFiltros: () => void;
    onActualizar: () => void;
}

const CheckinFilters: React.FC<CheckinFiltersProps> = ({
    busqueda,
    onBusquedaChange,
    onLimpiarFiltros,
    onActualizar
}) => {
    return (
        <Card className="mb-4">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Check-in de Reservas</h1>
                <p className="text-gray-600">
                    Realiza el check-in de reservas programadas (disponible desde 30 minutos antes hasta 1 día después)
                </p>
            </div>

            {/* Información de política */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex items-start">
                    <i className="pi pi-info-circle text-blue-600 mr-3 mt-1"></i>
                    <div>
                        <p className="font-semibold text-blue-800">Política de Check-in</p>
                        <p className="text-sm text-blue-700 mt-1">
                            El check-in puede realizarse desde <strong>30 minutos antes</strong> hasta <strong>1 día después</strong> de la hora programada.
                            Solo se muestran las reservas dentro de este rango de tiempo.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Búsqueda</label>
                    <InputText
                        value={busqueda}
                        onChange={(e) => onBusquedaChange(e.target.value)}
                        placeholder="Buscar por nombre, apellido o DNI..."
                        className="w-full"
                    />
                </div>

                <div className="flex items-end gap-2">
                    <Button
                        label="Limpiar Filtros"
                        icon="pi pi-filter-slash"
                        className="p-button-outlined h-10"
                        onClick={onLimpiarFiltros}
                        style={{
                            borderColor: '#EFC87A',
                            color: '#C88419',
                            backgroundColor: 'transparent'
                        }}
                    />
                    <Button
                        icon="pi pi-refresh"
                        className="p-button-outlined h-10"
                        onClick={onActualizar}
                        tooltip="Actualizar"
                    />
                </div>
            </div>
        </Card>
    );
};

export default CheckinFilters;
