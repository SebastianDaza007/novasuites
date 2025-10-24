"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import { useSearchParams } from 'next/navigation';
import CheckoutFilters from '@/components/pages/checkout/CheckoutFilters';
import CheckoutTable from '@/components/pages/checkout/CheckoutTable';

interface LazyState {
    first: number;
    rows: number;
    page: number;
    sortField: string;
    sortOrder: number;
}

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const toast = useRef<Toast>(null);
    const [reservaIdPreseleccionada, setReservaIdPreseleccionada] = useState<number | null>(null);

    // Estado de paginacion y ordenamiento
    const [lazyState, setLazyState] = useState<LazyState>({
        first: 0,
        rows: 10,
        page: 0,
        sortField: 'fecha_checkout',
        sortOrder: 1
    });

    // Estado de filtros
    const [busqueda, setBusqueda] = useState('');

    // Estado de datos
    const [reservas, setReservas] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);

    // Cargar reservas
    const cargarReservas = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams({
                page: lazyState.page.toString(),
                limit: lazyState.rows.toString(),
                sortField: lazyState.sortField,
                sortOrder: lazyState.sortOrder.toString(),
                ...(busqueda && { busqueda })
            });

            const response = await fetch(`/api/checkout?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setReservas(data.data);
                setTotalRecords(data.pagination.total);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: data.message || 'Error al cargar reservas',
                    life: 5000
                });
            }
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al conectar con el servidor',
                life: 5000
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

    // Cargar datos al montar y cuando cambien los filtros
    useEffect(() => {
        cargarReservas();
    }, [lazyState, busqueda]);

    // Manejadores de eventos
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

    const handleLimpiarFiltros = () => {
        setBusqueda('');
        setLazyState({
            first: 0,
            rows: 10,
            page: 0,
            sortField: 'fecha_checkout',
            sortOrder: 1
        });
    };

    const handleActualizar = () => {
        cargarReservas();
    };

    return (
        <div className="p-4">
            <Toast ref={toast} />

            <CheckoutFilters
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
                onLimpiarFiltros={handleLimpiarFiltros}
                onActualizar={handleActualizar}
            />

            <CheckoutTable
                reservas={reservas}
                loading={loading}
                totalRecords={totalRecords}
                lazyState={lazyState}
                onPage={onPage}
                onSort={onSort}
                toastRef={toast}
                onCheckoutSuccess={cargarReservas}
                reservaIdPreseleccionada={reservaIdPreseleccionada}
                onReservaPreseleccionadaProcesada={() => setReservaIdPreseleccionada(null)}
            />
        </div>
    );
}
