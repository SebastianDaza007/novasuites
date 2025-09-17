"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

type MovimientoDetalle = {
  id: number;
  insumo: string;
  cantidad: number;
  lote?: string;
  vencimiento?: string;
  stockMinimo?: number;
  stockCritico?: number;
};

type MovimientosTableProps = {
  data: MovimientoDetalle[];
  onDelete?: (id: number) => void;
  first: number;
  rows: number;
};

export default function MovimientosTable({
  data,
  onDelete,
  first,
  rows,
}: MovimientosTableProps) {
  const actionTemplate = (rowData: MovimientoDetalle) => (
    <Button
      icon="pi pi-trash"
      severity="danger"
      rounded
      text
      onClick={() => onDelete?.(rowData.id)}
      className="hover:scale-110 transition-transform"
    />
  );

  const paginatedData = data.slice(first, first + rows);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Detalle de Insumos</h2>
      <DataTable
        value={paginatedData}
        tableStyle={{ minWidth: "80rem" }}
        stripedRows
        emptyMessage="No se han agregado insumos al movimiento."
      >
        <Column field="insumo" header="Insumo" />
        <Column field="cantidad" header="Cantidad" />
        <Column field="lote" header="Lote" />
        <Column field="vencimiento" header="Vencimiento" />
        <Column field="stockMinimo" header="Stock Mínimo" />
        <Column field="stockCritico" header="Stock Crítico" />
        <Column
          header="Acciones"
          body={actionTemplate}
          style={{ textAlign: "center" }}
        />
      </DataTable>
    </div>
  );
}
