"use client";

import { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

interface InsumoApi {
  id_insumo: number;
  nombre_insumo: string;
}

type InsumoDetalle = {
  id_insumo: number;
  nombre: string;
  cantidad: number;
  precio: number;
  total: number;
};

interface FacturaInsumosProps {
  insumos: InsumoDetalle[];
  setInsumos: (insumos: InsumoDetalle[]) => void;
}

export default function FacturaInsumos({ insumos, setInsumos }: FacturaInsumosProps) {
  const [insumosOptions, setInsumosOptions] = useState<{ label: string; value: number }[]>([]);
  const [selectedInsumo, setSelectedInsumo] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(0);
  const [precio, setPrecio] = useState<number>(0);

  // 🔹 Cargar insumos desde la DB
  useEffect(() => {
    fetch("/api/registrar_factura/insumos")
      .then((res) => res.json())
      .then((data: InsumoApi[]) =>
        setInsumosOptions(data.map((i) => ({ label: i.nombre_insumo, value: i.id_insumo })))
      )
      .catch((err) => console.error("Error al cargar insumos:", err));
  }, []);

  const handleAgregar = () => {
    if (!selectedInsumo || cantidad <= 0 || precio <= 0) return;

    const insumoData = insumosOptions.find((i) => i.value === selectedInsumo);
    if (!insumoData) return;

    const nuevo: InsumoDetalle = {
      id_insumo: selectedInsumo,
      nombre: insumoData.label,
      cantidad,
      precio,
      total: cantidad * precio,
    };

    setInsumos([...insumos, nuevo]);

    // Reset inputs
    setSelectedInsumo(null);
    setCantidad(0);
    setPrecio(0);
  };

  const handleEliminar = (id: number) => {
    setInsumos(insumos.filter((i) => i.id_insumo !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Fila de inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Dropdown
          value={selectedInsumo}
          options={insumosOptions}
          onChange={(e) => setSelectedInsumo(e.value)}
          placeholder="Insumo"
          className="w-full"
        />

        <InputNumber
          value={cantidad}
          onValueChange={(e) => setCantidad(e.value || 0)}
          placeholder="Cantidad"
          className="w-full"
        />

        <InputNumber
          value={precio}
          onValueChange={(e) => setPrecio(e.value || 0)}
          mode="currency"
          currency="ARS"
          locale="es-AR"
          placeholder="Precio"
          className="w-full"
        />

        <Button label="Agregar" icon="pi pi-plus" className="p-button-success w-full" onClick={handleAgregar} />
      </div>

      {/* Tabla de insumos */}
      <DataTable value={insumos} className="mt-4" responsiveLayout="scroll">
        <Column field="nombre" header="Insumo"></Column>
        <Column field="cantidad" header="Cantidad"></Column>
        <Column field="precio" header="Precio"></Column>
        <Column field="total" header="Total"></Column>
        <Column
          body={(rowData: InsumoDetalle) => (
            <Button
              icon="pi pi-trash"
              className="p-button-danger p-button-sm"
              onClick={() => handleEliminar(rowData.id_insumo)}
            />
          )}
          header="Acciones"
        />
      </DataTable>
    </div>
  );
}
