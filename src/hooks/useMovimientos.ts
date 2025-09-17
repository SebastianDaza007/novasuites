import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MovimientoDetalle,
  Categoria,
  TipoMovimiento,
  RazonMovimiento,
  Deposito,
  MovimientosFiltros,
  LazyState,
  NumeroMovimiento,
  InsumoOption,
  LoteOption
} from '@/types/movimientos';

// Custom hook para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface UseMovimientosReturn {
  // Estado de datos
  movimientos: MovimientoDetalle[];
  categorias: Categoria[];
  tiposMovimiento: TipoMovimiento[];
  razonesMovimiento: RazonMovimiento[];
  depositos: Deposito[];
  numerosMovimiento: NumeroMovimiento[];
  insumosOptions: InsumoOption[];
  lotesOptions: LoteOption[];
  loading: boolean;
  totalRecords: number;

  // Estado de filtros y paginación
  filtros: MovimientosFiltros;
  lazyState: LazyState;

  // Funciones de control
  setFiltro: <K extends keyof MovimientosFiltros>(
    campo: K,
    valor: MovimientosFiltros[K]
  ) => void;
  limpiarFiltros: () => void;
  onPage: (event: { first: number; rows: number }) => void;
  onSort: (event: { sortField: string; sortOrder: number | null }) => void;
  fetchMovimientos: () => Promise<void>;
}

const initialFiltros: MovimientosFiltros = {
  fechaDesde: null,
  fechaHasta: null,
  categoriaFiltro: null,
  tipoMovimientoFiltro: null,
  depositoFiltro: null,
  globalFilter: '',
  numeroMovimiento: undefined,
  insumoFilter: undefined,
  loteFilter: undefined
};

const initialLazyState: LazyState = {
  first: 0,
  rows: 10,
  page: 1,
  sortField: null,
  sortOrder: null,
  filters: {}
};

export const useMovimientos = (): UseMovimientosReturn => {
  // Estados principales
  const [movimientos, setMovimientos] = useState<MovimientoDetalle[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tiposMovimiento, setTiposMovimiento] = useState<TipoMovimiento[]>([]);
  const [razonesMovimiento, setRazonesMovimiento] = useState<RazonMovimiento[]>([]);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [numerosMovimiento, setNumerosMovimiento] = useState<NumeroMovimiento[]>([]);
  const [insumosOptions, setInsumosOptions] = useState<InsumoOption[]>([]);
  const [lotesOptions, setLotesOptions] = useState<LoteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Estados de filtros y paginación
  const [filtros, setFiltros] = useState<MovimientosFiltros>(initialFiltros);
  const [lazyState, setLazyState] = useState<LazyState>(initialLazyState);
  
  // Debounce para la búsqueda global (evita demasiadas consultas)
  const debouncedGlobalFilter = useDebounce(filtros.globalFilter, 500);

  // Función para actualizar filtros
  const setFiltro = useCallback(<K extends keyof MovimientosFiltros>(
    campo: K, 
    valor: MovimientosFiltros[K]
  ) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  }, []);

  // Función para limpiar filtros
  const limpiarFiltros = useCallback(() => {
    setFiltros(initialFiltros);
    setLazyState(initialLazyState);
  }, []);

  // Función para manejar paginación
  const onPage = useCallback((event: { first: number; rows: number }) => {
    setLazyState(prev => ({
      ...prev,
      first: event.first,
      rows: event.rows,
      page: Math.floor(event.first / event.rows) + 1
    }));
  }, []);

  // Función para manejar ordenamiento
  const onSort = useCallback((event: { sortField: string; sortOrder: number | null }) => {
    setLazyState(prev => ({
      ...prev,
      sortField: event.sortField || null,
      sortOrder: event.sortOrder,
      first: 0, // Reset to first page when sorting
      page: 1
    }));
  }, []);

  // Función para obtener movimientos
  const fetchMovimientos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: lazyState.page.toString(),
        limit: lazyState.rows.toString(),
      });

      // Parámetros de ordenamiento
      if (lazyState.sortField && lazyState.sortOrder !== null) {
        params.append('sortField', lazyState.sortField);
        params.append('sortOrder', lazyState.sortOrder === 1 ? 'asc' : 'desc');
      }

      if (filtros.fechaDesde) {
        params.append('fechaDesde', filtros.fechaDesde.toISOString().split('T')[0]);
      }
      if (filtros.fechaHasta) {
        params.append('fechaHasta', filtros.fechaHasta.toISOString().split('T')[0]);
      }
      if (filtros.tipoMovimientoFiltro) {
        params.append('tipoMovimiento', filtros.tipoMovimientoFiltro);
      }
      if (filtros.categoriaFiltro) {
        params.append('categoria', filtros.categoriaFiltro.toString());
      }
      if (filtros.depositoFiltro) {
        params.append('deposito', filtros.depositoFiltro.toString());
      }
      if (debouncedGlobalFilter && debouncedGlobalFilter.trim()) {
        params.append('search', debouncedGlobalFilter.trim());
      }
      if (filtros.numeroMovimiento) {
        params.append('numeroMovimiento', filtros.numeroMovimiento.toString());
      }
      if (filtros.insumoFilter) {
        params.append('insumo', filtros.insumoFilter.toString());
      }
      if (filtros.loteFilter && filtros.loteFilter.trim()) {
        params.append('lote', filtros.loteFilter.trim());
      }

      const response = await fetch(`/api/movimientos-insumos?${params}`);
      const data = await response.json();

      if (data.success) {
        setMovimientos(data.data);
        setTotalRecords(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching movimientos:', error);
    } finally {
      setLoading(false);
    }
  }, [lazyState.page, lazyState.rows, lazyState.sortField, lazyState.sortOrder, filtros.fechaDesde, filtros.fechaHasta, filtros.tipoMovimientoFiltro, filtros.categoriaFiltro, filtros.depositoFiltro, debouncedGlobalFilter, filtros.numeroMovimiento, filtros.insumoFilter, filtros.loteFilter]);

  // Función para obtener categorías
  const fetchCategorias = useCallback(async () => {
    try {
      const response = await fetch('/api/movimientos-insumos/categorias');
      const data = await response.json();
      if (data.success) {
        setCategorias(data.data);
      }
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  }, []);

  // Función para obtener tipos de movimiento
  const fetchTiposMovimiento = useCallback(async () => {
    try {
      const response = await fetch('/api/movimientos-insumos/tipos-movimiento');
      const data = await response.json();
      if (data.success) {
        setTiposMovimiento(data.data.tipos_movimiento);
        setRazonesMovimiento(data.data.razones_movimiento);
      }
    } catch (error) {
      console.error('Error fetching tipos movimiento:', error);
    }
  }, []);

  // Función para obtener depósitos
  const fetchDepositos = useCallback(async () => {
    try {
      const response = await fetch('/api/movimientos-insumos/depositos');
      const data = await response.json();
      if (data.success) {
        setDepositos(data.data);
      }
    } catch (error) {
      console.error('Error fetching depositos:', error);
    }
  }, []);

  // Función para obtener números de movimiento
  const fetchNumerosMovimiento = useCallback(async () => {
    try {
      const response = await fetch('/api/movimientos-insumos/numeros-movimiento');
      const data = await response.json();
      if (data.success) {
        setNumerosMovimiento(data.data);
      }
    } catch (error) {
      console.error('Error fetching numeros movimiento:', error);
    }
  }, []);

  // Función para obtener insumos
  const fetchInsumos = useCallback(async () => {
    try {
      const response = await fetch('/api/movimientos-insumos/insumos');
      const data = await response.json();
      if (data.success) {
        setInsumosOptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching insumos:', error);
    }
  }, []);

  // Función para obtener lotes
  const fetchLotes = useCallback(async () => {
    try {
      const response = await fetch('/api/movimientos-insumos/lotes');
      const data = await response.json();
      if (data.success) {
        setLotesOptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching lotes:', error);
    }
  }, []);

  // Efectos para cargar datos iniciales
  useEffect(() => {
    fetchCategorias();
    fetchTiposMovimiento();
    fetchDepositos();
    fetchNumerosMovimiento();
    fetchInsumos();
    fetchLotes();
  }, [fetchCategorias, fetchTiposMovimiento, fetchDepositos, fetchNumerosMovimiento, fetchInsumos, fetchLotes]);

  // Efecto para cargar movimientos cuando cambian los filtros o paginación
  useEffect(() => {
    fetchMovimientos();
  }, [fetchMovimientos]);

  return {
    // Estado de datos
    movimientos,
    categorias,
    tiposMovimiento,
    razonesMovimiento,
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
  };
};