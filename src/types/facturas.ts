export interface FacturaDetalle {
  id_factura: number;
  numero_factura: string;
  tipo: 'A' | 'B' | 'C';
  fecha_emision: string;
  fecha_vencimiento: string;
  fecha_carga?: string;
  estado_factura: 'PENDIENTE' | 'PAGADA' | 'VENCIDA' | 'ANULADA';
  observaciones?: string;
  costo_total: number;
  proveedor: {
    id_proveedor: number;
    nombre_proveedor: string;
    cuit_proveedor: number;
  };
  orden_compra?: {
    id_orden_compra: number;
    numero_orden: string;
  } | null;
  detalles: {
    id_detalle_factura: number;
    cantidad: number;
    precio: number;
    insumo: {
      id_insumo: number;
      nombre_insumo: string;
      categoria?: {
        nombre_categoria: string;
      } | null;
    };
  }[];
}

export interface Proveedor {
  id_proveedor: number;
  nombre_proveedor: string;
  cuit_proveedor: number;
}

export interface EstadoFactura {
  value: 'PENDIENTE' | 'PAGADA' | 'VENCIDA' | 'ANULADA';
  label: string;
}

export interface TipoFactura {
  value: 'A' | 'B' | 'C';
  label: string;
}

export interface NumeroFactura {
  value: number;
  label: string;
}

export interface OrdenCompraOption {
  value: number;
  label: string;
}

export interface FacturasFiltros {
  fechaDesde: Date | null;
  fechaHasta: Date | null;
  estadoFactura: string | null;
  tipoFactura: string | null;
  proveedorFiltro: number | null;
  numeroFactura: number | null;
  ordenCompra: number | null;
  busquedaGeneral: string;
}

export interface LazyState {
  first: number;
  rows: number;
  page: number;
  sortField?: string;
  sortOrder?: 1 | -1 | null;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationInfo;
  message?: string;
  error?: string;
}