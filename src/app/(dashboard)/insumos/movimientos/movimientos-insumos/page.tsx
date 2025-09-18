"use client";

import React, { useCallback, useRef } from 'react';
import { Toast } from 'primereact/toast';
import MovimientosFilters from '@/components/pages/movimientos_insumos/MovimientosFilters';
import MovimientosTable from '@/components/pages/movimientos_insumos/MovimientosTable';
import { useMovimientos } from '@/hooks/useMovimientos';

const MovimientosInsumos = () => {
    const toast = useRef<Toast>(null);
    
    const {
        // Estado de datos
        movimientos,
        categorias,
        tiposMovimiento,
        depositos,
        numerosMovimiento,
        insumosOptions,
        lotesOptions,
        loading,
        totalRecords,

        // Estado de filtros y paginación
        filtros,
        lazyState,

        // Funciones de control
        setFiltro,
        limpiarFiltros,
        onPage,
        onSort,
        fetchMovimientos
    } = useMovimientos();

    const handleExportar = useCallback(() => {
        // TODO: Implementar exportación a Excel/CSV
        toast.current?.show({
            severity: 'info',
            summary: 'Función en desarrollo',
            detail: 'La exportación estará disponible próximamente',
            life: 3000
        });
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Toast ref={toast} />
            
            <div className="max-w-full mx-auto max-y-full">
                <MovimientosFilters
                    filtros={filtros}
                    categorias={categorias}
                    tiposMovimiento={tiposMovimiento}
                    depositos={depositos}
                    numerosMovimiento={numerosMovimiento}
                    insumosOptions={insumosOptions}
                    lotesOptions={lotesOptions}
                    onFiltroChange={setFiltro}
                    onLimpiarFiltros={limpiarFiltros}
                    onActualizar={fetchMovimientos}
                    onExportar={handleExportar}
                />
                
                <MovimientosTable
                    movimientos={movimientos}
                    loading={loading}
                    totalRecords={totalRecords}
                    lazyState={lazyState}
                    onPage={onPage}
                    onSort={onSort}
                />
            </div>
        </div>
    );
};

export default MovimientosInsumos;