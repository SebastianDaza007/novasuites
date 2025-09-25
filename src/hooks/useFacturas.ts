import { useState, useEffect, useCallback } from 'react';
import { DataTableStateEvent } from 'primereact/datatable';
import {
  FacturaDetalle,
  FacturasFiltros,
  LazyState,
  Proveedor,
  EstadoFactura,
  TipoFactura,
  NumeroFactura,
  OrdenCompraOption,
  ApiResponse
} from '@/types/facturas';

const initialFiltros: FacturasFiltros = {
  fechaDesde: null,
  fechaHasta: null,
  estadoFactura: null,
  tipoFactura: null,
  proveedorFiltro: null,
  numeroFactura: null,
  ordenCompra: null,
  busquedaGeneral: ''
};

const initialLazyState: LazyState = {
  first: 0,
  rows: 10,
  page: 0,
  sortField: 'fecha_creacion',
  sortOrder: -1
};

export const useFacturas = () => {
  // Estado de datos
  const [facturas, setFacturas] = useState<FacturaDetalle[]>([]);
  const [todasLasFacturas, setTodasLasFacturas] = useState<FacturaDetalle[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [estadosFactura, setEstadosFactura] = useState<EstadoFactura[]>([]);
  const [tiposFactura, setTiposFactura] = useState<TipoFactura[]>([]);
  const [numerosFactura, setNumerosFactura] = useState<NumeroFactura[]>([]);
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompraOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  // Estado de filtros y paginación
  const [filtros, setFiltrosState] = useState<FacturasFiltros>(initialFiltros);
  const [lazyState, setLazyState] = useState<LazyState>(initialLazyState);

  // Funciones helper
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    // Paginación
    params.set('page', (lazyState.page + 1).toString());
    params.set('limit', lazyState.rows.toString());

    // Ordenamiento
    if (lazyState.sortField) {
      params.set('sortField', lazyState.sortField);
      params.set('sortOrder', lazyState.sortOrder === 1 ? 'asc' : 'desc');
    }

    // Filtros
    if (filtros.fechaDesde) {
      params.set('fechaDesde', filtros.fechaDesde.toISOString().split('T')[0]);
    }
    if (filtros.fechaHasta) {
      params.set('fechaHasta', filtros.fechaHasta.toISOString().split('T')[0]);
    }
    if (filtros.estadoFactura) {
      params.set('estadoFactura', filtros.estadoFactura);
    }
    if (filtros.tipoFactura) {
      params.set('tipoFactura', filtros.tipoFactura);
    }
    if (filtros.proveedorFiltro) {
      params.set('proveedor', filtros.proveedorFiltro.toString());
    }
    if (filtros.numeroFactura) {
      params.set('numeroFactura', filtros.numeroFactura.toString());
    }
    if (filtros.ordenCompra) {
      params.set('ordenCompra', filtros.ordenCompra.toString());
    }
    if (filtros.busquedaGeneral.trim()) {
      params.set('search', filtros.busquedaGeneral.trim());
    }

    return params.toString();
  }, [filtros, lazyState]);

  // Función para cargar facturas
  const fetchFacturas = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = buildQueryParams();
      const response = await fetch(`/api/facturas?${queryParams}`);
      const result: ApiResponse<FacturaDetalle[]> = await response.json();

      if (result.success) {
        setFacturas(result.data);
        setTotalRecords(result.pagination?.total || 0);
      } else {
        console.error('Error fetching facturas:', result.message);
        setFacturas([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error('Error fetching facturas:', error);
      setFacturas([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  // Función para cargar todas las facturas sin filtros (para cálculos de totales)
  const fetchTodasLasFacturas = useCallback(async () => {
    try {
      const response = await fetch('/api/facturas?page=1&limit=999999');
      const result: ApiResponse<FacturaDetalle[]> = await response.json();

      if (result.success) {
        setTodasLasFacturas(result.data);
      } else {
        console.error('Error fetching todas las facturas:', result.message);
        setTodasLasFacturas([]);
      }
    } catch (error) {
      console.error('Error fetching todas las facturas:', error);
      setTodasLasFacturas([]);
    }
  }, []);

  // Función para cargar datos de filtros
  const fetchFilterData = useCallback(async () => {
    try {
      const [
        proveedoresRes,
        estadosRes,
        tiposRes,
        numerosRes,
        ordenesRes
      ] = await Promise.all([
        fetch('/api/facturas/proveedores'),
        fetch('/api/facturas/estados'),
        fetch('/api/facturas/tipos'),
        fetch('/api/facturas/numeros-factura'),
        fetch('/api/facturas/ordenes-compra')
      ]);

      const [
        proveedoresData,
        estadosData,
        tiposData,
        numerosData,
        ordenesData
      ] = await Promise.all([
        proveedoresRes.json(),
        estadosRes.json(),
        tiposRes.json(),
        numerosRes.json(),
        ordenesRes.json()
      ]);

      if (proveedoresData.success) setProveedores(proveedoresData.data);
      if (estadosData.success) setEstadosFactura(estadosData.data);
      if (tiposData.success) setTiposFactura(tiposData.data);
      if (numerosData.success) setNumerosFactura(numerosData.data);
      if (ordenesData.success) setOrdenesCompra(ordenesData.data);

    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  }, []);

  // Función para actualizar filtros
  const setFiltro = useCallback(<K extends keyof FacturasFiltros>(
    campo: K,
    valor: FacturasFiltros[K]
  ) => {
    setFiltrosState(prev => ({
      ...prev,
      [campo]: valor
    }));
    // Reset pagination when filters change
    setLazyState(prev => ({
      ...prev,
      first: 0,
      page: 0
    }));
  }, []);

  // Función para limpiar filtros
  const limpiarFiltros = useCallback(() => {
    setFiltrosState(initialFiltros);
    setLazyState(initialLazyState);
  }, []);

  // Función para manejar paginación
  const onPage = useCallback((event: { first: number; rows: number }) => {
    setLazyState(prev => ({
      ...prev,
      first: event.first,
      rows: event.rows,
      page: Math.floor(event.first / event.rows)
    }));
  }, []);

  // Función para manejar ordenamiento
  const onSort = useCallback((event: DataTableStateEvent) => {
    setLazyState(prev => ({
      ...prev,
      sortField: event.sortField || undefined,
      sortOrder: event.sortOrder || undefined,
      first: 0,
      page: 0
    }));
  }, []);

  // Efectos
  useEffect(() => {
    fetchFilterData();
    fetchTodasLasFacturas();
  }, [fetchFilterData, fetchTodasLasFacturas]);

  useEffect(() => {
    fetchFacturas();
  }, [fetchFacturas]);

  return {
    // Estado de datos
    facturas,
    todasLasFacturas,
    proveedores,
    estadosFactura,
    tiposFactura,
    numerosFactura,
    ordenesCompra,
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
    fetchFacturas
  };
};