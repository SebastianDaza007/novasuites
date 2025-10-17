import React from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';

interface CheckoutFiltersProps {
    busqueda: string;
    onBusquedaChange: (value: string) => void;
    onLimpiarFiltros: () => void;
    onActualizar: () => void;
}

const CheckoutFilters: React.FC<CheckoutFiltersProps> = ({
    busqueda,
    onBusquedaChange,
    onLimpiarFiltros,
    onActualizar
}) => {
    return (
        <Card className="mb-4">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Check-out de Reservas</h1>
                <p className="text-gray-600">
                    Realiza el check-out de huespedes que ya han completado su estancia
                </p>
            </div>

            {/* Información */}
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <div className="flex items-start">
                    <i className="pi pi-info-circle text-green-600 mr-3 mt-1"></i>
                    <div>
                        <p className="font-semibold text-green-800">Check-out de Habitaciones</p>
                        <p className="text-sm text-green-700 mt-1">
                            Al realizar el check-out, las habitaciones pasaran automaticamente a estado <strong>LIMPIEZA</strong>.
                            Solo se muestran reservas con estado CHECKIN (huespedes actuales).
                        </p>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Busqueda</label>
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

export default CheckoutFilters;
