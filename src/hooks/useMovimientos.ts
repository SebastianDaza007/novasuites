import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MovimientoDetalle, 
  Categoria, 
  TipoMovimiento, 
  MovimientosFiltros, 
  LazyState 
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
  fetchMovimientos: () => Promise<void>;
}

const initialFiltros: MovimientosFiltros = {
  fechaDesde: null,
  fechaHasta: null,
  categoriaFiltro: null,
  tipoMovimientoFiltro: null,
  globalFilter: ''
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

  // Función para obtener movimientos
  const fetchMovimientos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: lazyState.page.toString(),
        limit: lazyState.rows.toString(),
      });

      if (filtros.fechaDesde) {
        params.append('fechaDesde', filtros.fechaDesde.toISOString().split('T')[0]);
      }
      if (filtros.fechaHasta) {
        params.append('fechaHasta', filtros.fechaHasta.toISOString().split('T')[0]);
      }
      if (filtros.tipoMovimientoFiltro) {
        params.append('tipoMovimiento', filtros.tipoMovimientoFiltro.toString());
      }
      if (filtros.categoriaFiltro) {
        params.append('categoria', filtros.categoriaFiltro.toString());
      }
      if (debouncedGlobalFilter && debouncedGlobalFilter.trim()) {
        params.append('search', debouncedGlobalFilter.trim());
      }

      const response = await fetch(`/api/detalles-movimiento?${params}`);
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
  }, [lazyState.page, lazyState.rows, filtros.fechaDesde, filtros.fechaHasta, filtros.tipoMovimientoFiltro, filtros.categoriaFiltro, debouncedGlobalFilter]);

  // Función para obtener categorías
  const fetchCategorias = useCallback(async () => {
    try {
      const response = await fetch('/api/categorias?estado=true');
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
      const response = await fetch('/api/tipos-movimiento?estado=true');
      const data = await response.json();
      if (data.success) {
        setTiposMovimiento(data.data);
      }
    } catch (error) {
      console.error('Error fetching tipos movimiento:', error);
    }
  }, []);

  // Efectos para cargar datos iniciales
  useEffect(() => {
    fetchCategorias();
    fetchTiposMovimiento();
  }, [fetchCategorias, fetchTiposMovimiento]);

  // Efecto para cargar movimientos cuando cambian los filtros o paginación
  useEffect(() => {
    fetchMovimientos();
  }, [fetchMovimientos]);

  return {
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
  };
};