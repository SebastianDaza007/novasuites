"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import { useSearchParams } from 'next/navigation';
import CheckinFilters from '@/components/pages/checkin/CheckinFilters';
import CheckinTable from '@/components/pages/checkin/CheckinTable';

interface Huesped {
    id_huespedes: number;
    nombre: string;
    apellido: string;
    documento: string;
    telefono?: string;
    email?: string;
}

interface MetodoPago {
    id_metodo: number;
    nombre_metodo: string;
    activo: boolean;
}

interface Tarjeta {
    id_tarjeta: number;
    numero_tarjeta: string;
    titular_tarjeta: string;
}

interface Habitacion {
    numero: string;
    tipo: string;
    capacidad: number;
    estado?: string;
}

interface ReservaHabitacion {
    habitacion: Habitacion;
    cantidad_personas: number;
}

interface Validaciones {
    excede_capacidad: boolean;
    habitaciones_disponibles: boolean;
    tiene_metodo_pago: boolean;
    capacidad_total: number;
    personas_total: number;
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
    metodo_pago?: MetodoPago | null;
    tarjeta?: Tarjeta | null;
    reservas_habitaciones: ReservaHabitacion[];
    validaciones?: Validaciones;
}

const CheckinPage = () => {
    const searchParams = useSearchParams();
    const toast = useRef<Toast>(null);
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [reservaIdPreseleccionada, setReservaIdPreseleccionada] = useState<number | null>(null);

    // Filtros
    const [busqueda, setBusqueda] = useState('');

    // Paginacion
    const [lazyState, setLazyState] = useState({
        first: 0,
        rows: 10,
        page: 0,
        sortField: 'fecha_checkin',
        sortOrder: 1
    });

    const fetchReservas = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: lazyState.page.toString(),
                limit: lazyState.rows.toString(),
                sortField: lazyState.sortField || 'fecha_checkin',
                sortOrder: (lazyState.sortOrder === 1 ? 'asc' : 'desc'),
            });

            if (busqueda) params.append('busqueda', busqueda);

            const response = await fetch(`/api/checkin?${params.toString()}`);
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

    // Detectar si hay un ID de reserva en la URL
    useEffect(() => {
        const reservaId = searchParams.get('reserva');
        if (reservaId) {
            setReservaIdPreseleccionada(parseInt(reservaId));
        }
    }, [searchParams]);

    useEffect(() => {
        fetchReservas();
    }, [lazyState, busqueda]);

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
    };

    const handleCheckinSuccess = () => {
        // Recargar la lista de reservas despues de un check-in exitoso
        fetchReservas();
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Toast ref={toast} />

            <div className="max-w-full mx-auto">
                <CheckinFilters
                    busqueda={busqueda}
                    onBusquedaChange={setBusqueda}
                    onLimpiarFiltros={limpiarFiltros}
                    onActualizar={fetchReservas}
                />

                <CheckinTable
                    reservas={reservas}
                    loading={loading}
                    totalRecords={totalRecords}
                    lazyState={lazyState}
                    onPage={onPage}
                    onSort={onSort}
                    toastRef={toast}
                    onCheckinSuccess={handleCheckinSuccess}
                    reservaIdPreseleccionada={reservaIdPreseleccionada}
                    onReservaPreseleccionadaProcesada={() => setReservaIdPreseleccionada(null)}
                />
            </div>
        </div>
    );
};

export default CheckinPage;
