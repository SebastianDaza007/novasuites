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
    estado_movimiento: string;
    tipo_movimiento: {
      nombre_tipo: string;
      afecta_stock: string;
    };
    deposito_origen: {
      nom_deposito: string;
    } | null;
    deposito_destino: {
      nom_deposito: string;
    } | null;
  };
  insumo: {
    id_insumo: number;
    nombre_insumo: string;
    descripcion_insumo: string | null;
    costo_unitario: number;
  };
}

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
}

export interface TipoMovimiento {
  id_tipo_movimiento: number;
  nombre_tipo: string;
  afecta_stock: string;
}

export interface MovimientosFiltros {
  fechaDesde: Date | null;
  fechaHasta: Date | null;
  categoriaFiltro: number | null;
  tipoMovimientoFiltro: number | null;
  globalFilter: string;
}

export interface LazyState {
  first: number;
  rows: number;
  page: number;
  sortField: string | null;
  sortOrder: number | null;
  filters: Record<string, unknown>;
}