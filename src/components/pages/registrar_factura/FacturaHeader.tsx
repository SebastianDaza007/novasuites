"use client";

import { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

interface Proveedor {
  nombre_proveedor: string;
  id_proveedor: number;
}

interface OrdenCompra {
  numero_orden: string;
  id_orden_compra: number;
}

interface FacturaHeaderProps {
  proveedor: number | null;
  setProveedor: (val: number | null) => void;
  numeroFactura: string;
  setNumeroFactura: (val: string) => void;
  tipoFactura: "A" | "B" | "C";
  setTipoFactura: (val: "A" | "B" | "C") => void;
  ordenCompra: number | null;
  setOrdenCompra: (val: number | null) => void;
  fechaVencimiento: Date | null;
  setFechaVencimiento: (val: Date | null) => void;
  estadoFactura: "PENDIENTE" | "PAGADA" | "A_RECLAMAR";
  setEstadoFactura: (val: "PENDIENTE" | "PAGADA" | "A_RECLAMAR") => void;
  observaciones: string;
  setObservaciones: (val: string) => void;
}

export default function FacturaHeader({
  proveedor,
  setProveedor,
  numeroFactura,
  setNumeroFactura,
  tipoFactura,
  setTipoFactura,
  ordenCompra,
  setOrdenCompra,
  fechaVencimiento,
  setFechaVencimiento,
  estadoFactura,
  setEstadoFactura,
  observaciones,
  setObservaciones,
}: FacturaHeaderProps) {
  const [proveedores, setProveedores] = useState<{ label: string; value: number }[]>([]);
  const [ordenes, setOrdenes] = useState<{ label: string; value: number }[]>([]);

  // 🔹 Cargar proveedores
  useEffect(() => {
    fetch("/api/registrar_factura/proveedores")
      .then((res) => res.json())
      .then((data: Proveedor[]) =>
        setProveedores(
          data.map((p) => ({ label: p.nombre_proveedor, value: p.id_proveedor }))
        )
      )
      .catch((err) => console.error("Error al cargar proveedores:", err));
  }, []);

  // 🔹 Cargar órdenes cuando cambia proveedor
  useEffect(() => {
    if (proveedor) {
      fetch(`/api/registrar_factura/ordenes?proveedor=${proveedor}`)
        .then((res) => res.json())
        .then((data: OrdenCompra[]) =>
          setOrdenes(
            data.map((o) => ({ label: o.numero_orden, value: o.id_orden_compra }))
          )
        )
        .catch((err) => console.error("Error al cargar órdenes:", err));
    } else {
      setOrdenes([]);
    }
  }, [proveedor]);

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Primera fila: Proveedor / Orden de compra / N° Factura */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Dropdown
            value={proveedor}
            options={proveedores}
            onChange={(e) => setProveedor(e.value)}
            placeholder="Proveedor"
            className="w-full"
          />
        </div>

        <div>
          <Dropdown
            value={ordenCompra}
            options={ordenes}
            onChange={(e) => setOrdenCompra(e.value)}
            placeholder="Orden de compra"
            className="w-full"
            disabled={!proveedor}
          />
        </div>

        <div>
          <InputText
            value={numeroFactura}
            onChange={(e) => setNumeroFactura(e.target.value)}
            placeholder="Número de factura"
            className="w-full"
          />
        </div>
      </div>

      {/* Segunda fila: Vencimiento / Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Calendar
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.value as Date)}
            placeholder="Vencimiento"
            dateFormat="dd/mm/yy"
            className="w-full"
          />
        </div>

        <div>
          <Dropdown
            value={tipoFactura}
            options={[
              { label: "Factura A", value: "A" },
              { label: "Factura B", value: "B" },
              { label: "Factura C", value: "C" },
            ]}
            onChange={(e) => setTipoFactura(e.value)}
            placeholder="Tipo de factura"
            className="w-full"
          />
        </div>
      </div>

      {/* Estado de factura como Tabs */}
      <div className="flex gap-2">
        <Button
          label="Pendiente"
          className={estadoFactura === "PENDIENTE" ? "p-button-primary" : "p-button-outlined"}
          onClick={() => setEstadoFactura("PENDIENTE")}
        />
        <Button
          label="Pagada"
          className={estadoFactura === "PAGADA" ? "p-button-success" : "p-button-outlined"}
          onClick={() => setEstadoFactura("PAGADA")}
        />
        <Button
          label="A reclamar"
          className={estadoFactura === "A_RECLAMAR" ? "p-button-warning" : "p-button-outlined"}
          onClick={() => setEstadoFactura("A_RECLAMAR")}
        />
      </div>

      {/* Observaciones */}
      <InputText
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        placeholder="Observaciones"
        className="w-full"
      />
    </div>
  );
}
