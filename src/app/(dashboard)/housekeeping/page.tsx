"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import HousekeepingStats from '@/components/pages/housekeeping/HousekeepingStats';
import HousekeepingFilters from '@/components/pages/housekeeping/HousekeepingFilters';
import HousekeepingTable from '@/components/pages/housekeeping/HousekeepingTable';
import TareasPendientes from '@/components/pages/housekeeping/TareasPendientes';
import CalendarioLimpieza from '@/components/pages/housekeeping/CalendarioLimpieza';
import PersonalAsignado from '@/components/pages/housekeeping/PersonalAsignado';
import InventarioSuministros from '@/components/pages/housekeeping/InventarioSuministros';

interface LazyState {
    first: number;
    rows: number;
    page: number;
    sortField: string;
    sortOrder: number;
}

export default function HousekeepingPage() {
    const toast = useRef<Toast>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Estado de paginación y ordenamiento
    const [lazyState, setLazyState] = useState<LazyState>({
        first: 0,
        rows: 20,
        page: 0,
        sortField: 'numero',
        sortOrder: 1
    });

    // Estado de filtros
    const [estadoFiltro, setEstadoFiltro] = useState<string>('');
    const [tipoFiltro, setTipoFiltro] = useState<string>('');
    const [busqueda, setBusqueda] = useState('');

    // Estado de datos
    const [habitaciones, setHabitaciones] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        disponibles: 0,
        ocupadas: 0,
        limpieza: 0,
        mantenimiento: 0
    });
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);

    // Cargar habitaciones
    const cargarHabitaciones = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams({
                page: lazyState.page.toString(),
                limit: lazyState.rows.toString(),
                sortField: lazyState.sortField,
                sortOrder: lazyState.sortOrder.toString(),
                ...(estadoFiltro && { estado: estadoFiltro }),
                ...(tipoFiltro && { tipo: tipoFiltro }),
                ...(busqueda && { busqueda })
            });

            const response = await fetch(`/api/housekeeping?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setHabitaciones(data.data);
                setEstadisticas(data.estadisticas);
                setTotalRecords(data.pagination.total);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: data.message || 'Error al cargar habitaciones',
                    life: 5000
                });
            }
        } catch (error) {
            console.error('Error al cargar habitaciones:', error);
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

    // Cargar datos al montar y cuando cambien los filtros
    useEffect(() => {
        cargarHabitaciones();
    }, [lazyState, estadoFiltro, tipoFiltro, busqueda]);

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
        setEstadoFiltro('');
        setTipoFiltro('');
        setBusqueda('');
        setLazyState({
            first: 0,
            rows: 20,
            page: 0,
            sortField: 'numero',
            sortOrder: 1
        });
    };

    const handleActualizar = () => {
        cargarHabitaciones();
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Toast ref={toast} />

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Housekeeping</h1>
                <p className="text-gray-600">Gestión y control del estado de las habitaciones</p>
            </div>

            {/* Estadísticas */}
            <HousekeepingStats estadisticas={estadisticas} />

            {/* Tabs */}
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Habitaciones" leftIcon="pi pi-home mr-2">
                    {/* Filtros */}
                    <HousekeepingFilters
                        estadoFiltro={estadoFiltro}
                        tipoFiltro={tipoFiltro}
                        busqueda={busqueda}
                        onEstadoChange={setEstadoFiltro}
                        onTipoChange={setTipoFiltro}
                        onBusquedaChange={setBusqueda}
                        onLimpiarFiltros={handleLimpiarFiltros}
                        onActualizar={handleActualizar}
                    />

                    {/* Tabla */}
                    <HousekeepingTable
                        habitaciones={habitaciones}
                        loading={loading}
                        totalRecords={totalRecords}
                        lazyState={lazyState}
                        onPage={onPage}
                        onSort={onSort}
                        toastRef={toast}
                        onEstadoActualizado={cargarHabitaciones}
                    />
                </TabPanel>

                <TabPanel header="Tareas Pendientes" leftIcon="pi pi-list mr-2">
                    <TareasPendientes />
                </TabPanel>

                <TabPanel header="Calendario" leftIcon="pi pi-calendar mr-2">
                    <CalendarioLimpieza />
                </TabPanel>

                <TabPanel header="Personal" leftIcon="pi pi-users mr-2">
                    <PersonalAsignado />
                </TabPanel>

                <TabPanel header="Suministros" leftIcon="pi pi-box mr-2">
                    <InventarioSuministros />
                </TabPanel>
            </TabView>
        </div>
    );
}
