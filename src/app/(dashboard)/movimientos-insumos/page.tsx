"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import MovimientosFilters from '@/components/formulario/MovimientosFilters';
import MovimientosTable from '@/components/tablas/MovimientosTable';
import { useMovimientos } from '@/hooks/useMovimientos';

const MovimientosInsumos = () => {
    const router = useRouter();
    const {
        // Estado de datos
        movimientos,
        categorias,
        tiposMovimiento,
        loading,
        totalRecords,
        
        // Estado de filtros y paginación
        filtros,
        lazyState,
        
        // Funciones de control
        setFiltro,
        limpiarFiltros,
        onPage,
        fetchMovimientos
    } = useMovimientos();

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            {/* Botón de regreso */}
            <div className="mb-4">
                <Button
                    label="Volver a Insumos"
                    icon="pi pi-arrow-left"
                    className="p-button-outlined p-button-sm"
                    onClick={() => router.push('/insumos')}
                />
            </div>
            
            <MovimientosFilters
                filtros={filtros}
                categorias={categorias}
                tiposMovimiento={tiposMovimiento}
                onFiltroChange={setFiltro}
                onLimpiarFiltros={limpiarFiltros}
                onActualizar={fetchMovimientos}
            />
            
            <div className="mt-6">
                <MovimientosTable
                    movimientos={movimientos}
                    loading={loading}
                    totalRecords={totalRecords}
                    lazyState={lazyState}
                    globalFilter={filtros.globalFilter}
                    onPage={onPage}
                />
            </div>
        </div>
    );
};

export default MovimientosInsumos;