"use client";

import { Button } from "primereact/button";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";
import { useState } from "react";

type MovimientosFooterProps = {
  totalRecords: number;
  rows: number;
  onPageChange: (e: PaginatorPageChangeEvent) => void;
  onVerMovimientos: () => void;
  onRegistrar: () => void;
};

export default function MovimientosFooter({
  totalRecords,
  rows,
  onPageChange,
  onVerMovimientos,
  onRegistrar,
}: MovimientosFooterProps) {
  const [first, setFirst] = useState(0);

  const handlePageChange = (e: PaginatorPageChangeEvent) => {
    setFirst(e.first);
    onPageChange(e);
  };

  return (
    <div className="flex items-center justify-between mt-4">
      {/* Botón izquierda */}
      <Button
        label="Ver movimientos"
        icon="pi pi-replay"
        severity="info"
        onClick={onVerMovimientos}
      />

      {/* Paginador centro */}
      <Paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPageChange={handlePageChange}
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      />

      {/* Botón derecha */}
      <Button
        label="Registrar"
        icon="pi pi-check"
        severity="success"
        onClick={onRegistrar}
      />
    </div>
  );
}
