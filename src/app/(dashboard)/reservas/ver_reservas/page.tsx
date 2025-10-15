"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import ReservasFilters from '@/components/pages/ver_reservas/ReservasFilters';
import ReservasTable from '@/components/pages/ver_reservas/ReservasTable';

interface Huesped {
    nombre: string;
    apellido: string;
    documento: string;
    telefono?: string;
    email?: string;
}

interface Habitacion {
    numero: string;
    tipo: string;
    capacidad: number;
}

interface ReservaHabitacion {
    habitacion: Habitacion;
    cantidad_personas: number;
}

interface Reserva {
    id_reservas: number;
    huesped: Huesped;
    fecha_checkin: string;
    fecha_checkout: string;
    cantidad_adultos: number;
    cantidad_menores: number;
    estado: string;
    monto_total: number;
    fecha_creacion: string;
    reservas_habitaciones: ReservaHabitacion[];
}

const VerReservas = () => {
    const toast = useRef<Toast>(null);
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);

    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
    const [fechaFin, setFechaFin] = useState<Date | null>(null);
    const [estadoFiltro, setEstadoFiltro] = useState<string | null>(null);

    // Paginación
    const [lazyState, setLazyState] = useState({
        first: 0,
        rows: 10,
        page: 0,
        sortField: 'fecha_creacion',
        sortOrder: -1
    });

    const fetchReservas = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: lazyState.page.toString(),
                limit: lazyState.rows.toString(),
                sortField: lazyState.sortField || 'fecha_creacion',
                sortOrder: (lazyState.sortOrder === 1 ? 'asc' : 'desc'),
            });

            if (busqueda) params.append('busqueda', busqueda);
            if (fechaInicio) params.append('fechaInicio', fechaInicio.toISOString());
            if (fechaFin) params.append('fechaFin', fechaFin.toISOString());
            if (estadoFiltro) params.append('estado', estadoFiltro);

            const response = await fetch(`/api/ver_reservas?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setReservas(data.data);
                setTotalRecords(data.pagination.total);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: data.message || 'Error al cargar reservas',
                    life: 3000
                });
            }
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al conectar con el servidor',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservas();
    }, [lazyState, busqueda, fechaInicio, fechaFin, estadoFiltro]);

    const onPage = (event: DataTablePageEvent) => {
        setLazyState({
            ...lazyState,
            first: event.first,
            rows: event.rows,
            page: event.page || 0
        });
    };

    const onSort = (event: DataTableSortEvent) => {
        setLazyState({
            ...lazyState,
            sortField: event.sortField as string,
            sortOrder: event.sortOrder || 1
        });
    };

    const limpiarFiltros = () => {
        setBusqueda('');
        setFechaInicio(null);
        setFechaFin(null);
        setEstadoFiltro(null);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Toast ref={toast} />

            <div className="max-w-full mx-auto">
                <ReservasFilters
                    busqueda={busqueda}
                    fechaInicio={fechaInicio}
                    fechaFin={fechaFin}
                    estadoFiltro={estadoFiltro}
                    onBusquedaChange={setBusqueda}
                    onFechaInicioChange={setFechaInicio}
                    onFechaFinChange={setFechaFin}
                    onEstadoChange={setEstadoFiltro}
                    onLimpiarFiltros={limpiarFiltros}
                    onActualizar={fetchReservas}
                />

                <ReservasTable
                    reservas={reservas}
                    loading={loading}
                    totalRecords={totalRecords}
                    lazyState={lazyState}
                    onPage={onPage}
                    onSort={onSort}
                    toastRef={toast}
                />
            </div>
        </div>
    );
};

export default VerReservas;
