"use client";

import React from "react";
import { DataTable, DataTableProps } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

type Insumo = {
  id_insumo:string;
  nombre_insumo: string;
  cantidad: number;
};

type TableInsumosProps = DataTableProps<Insumo[]> & {
  data: Insumo[];
  onDelete?: (row: Insumo) => void;
};

export default function TableInsumos({ data, onDelete, ...props }: TableInsumosProps) {
  const actionBodyTemplate = (rowData: Insumo) => (
    <Button
      icon="pi pi-trash"
      className="p-button-sm p-button-danger"
      onClick={() => onDelete && onDelete(rowData)}
    />
  );

  return (
    <div className="card">
      <DataTable value={data} tableStyle={{ minWidth: "50rem" }} {...props}>
        <Column field="nombre_insumo" header="Insumo"  style={{ width: "60%" }}/>
        <Column field="cantidad" header="Cantidad" style={{ width: "20%" }} />
        <Column header="Acciones" body={actionBodyTemplate} style={{ width: "20%" }} />
      </DataTable>
    </div>
  );
}
