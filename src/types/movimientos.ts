export interface MovimientoDetalle {
  id_detalle: number;
  cantidad: number;
  costo_unitario: number | null;
  lote: string | null;
  fecha_vencimiento: string | null;
  movimiento: {
    id_movimiento: number;
    fecha_movimiento: string;
    numero_comprobante: string | null;
    observaciones: string | null;
    deposito: {
      id_deposito: number;
      nombre_deposito: string;
    } | null;
    razon_movimiento: {
      id_razon: number;
      nombre_razon: string;
      tipo_movimiento: 'ALTA' | 'BAJA' | 'TRANSFERENCIA_SALIDA' | 'TRANSFERENCIA_ENTRADA' | 'AJUSTE';
    } | null;
    usuario: {
      id: number;
      email: string;
    };
  };
  insumo: {
    id_insumo: number;
    nombre_insumo: string;
    descripcion_insumo: string | null;
    categoria: {
      id_categoria: number;
      nombre_categoria: string;
    };
  };
}

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
}

export interface TipoMovimiento {
  value: 'ALTA' | 'BAJA' | 'TRANSFERENCIA_SALIDA' | 'TRANSFERENCIA_ENTRADA' | 'AJUSTE';
  label: string;
  afecta_stock: 'POSITIVO' | 'NEGATIVO' | 'NEUTRO';
}

export interface RazonMovimiento {
  id_razon: number;
  nombre_razon: string;
  descripcion: string | null;
  tipo_movimiento: 'ALTA' | 'BAJA' | 'TRANSFERENCIA_SALIDA' | 'TRANSFERENCIA_ENTRADA' | 'AJUSTE';
}

export interface Deposito {
  id_deposito: number;
  nombre_deposito: string;
  direccion_deposito: string | null;
  telefono_deposito: number | null;
  usuario: {
    id: number;
    email: string;
  } | null;
}

export interface MovimientosFiltros {
  fechaDesde: Date | null;
  fechaHasta: Date | null;
  categoriaFiltro: number | null;
  tipoMovimientoFiltro: string | null;
  depositoFiltro: number | null;
  globalFilter: string;
  numeroMovimiento?: string;
  insumoFilter?: string;
  loteFilter?: string;
}

export interface LazyState {
  first: number;
  rows: number;
  page: number;
  sortField: string | null;
  sortOrder: number | null;
  filters: Record<string, unknown>;
}