"use client";

import { useState } from "react";
import MovimientoForm from "@/components/pages/registrar_movimiento/MovimientoForm";
import MovimientosTable from "@/components/pages/registrar_movimiento/MovimientosTable";
import MovimientosFooter from "@/components/pages/registrar_movimiento/MovimientosFooter";

type MovimientoDetalle = {
  id: number; // temporal
  id_insumo: number; // real para BD
  insumo: string;
  cantidad: number;
  lote?: string;
  vencimiento?: string;
  stockMinimo?: number;
  stockCritico?: number;
  observaciones?: string;
};

export default function Page() {
  const [detalles, setDetalles] = useState<MovimientoDetalle[]>([]);
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);

  // globales del movimiento
  const [idDeposito, setIdDeposito] = useState<number | null>(null);
  const [idRazon, setIdRazon] = useState<number | null>(null);

  const handleAdd = (detalle: MovimientoDetalle) => {
    setDetalles((prev) => [...prev, detalle]);
  };

  const handleDelete = (id: number) => {
    setDetalles((prev) => prev.filter((d) => d.id !== id));
  };

  const handlePageChange = (e: any) => {
    setRows(e.rows);
    setFirst(e.first);
  };

  const handleVerMovimientos = () => {
    console.log("👉 Redirigir a HU-05 (ver movimientos)");
  };

  const handleRegistrar = async () => {
    try {
      const payload = {
        id_usuario: 1, // luego dinámico
        id_deposito: idDeposito, // 👈 global del form
        id_razon_movimiento: idRazon, // 👈 global del form
        numero_comprobante: "ABC123",
        observaciones: "Movimiento de prueba desde el front",
        detalles: detalles.map((d) => ({
          id_insumo: d.id_insumo,
          cantidad: d.cantidad,
          lote: d.lote,
          vencimiento: d.vencimiento,
          stockMinimo: d.stockMinimo,
          stockCritico: d.stockCritico,
        })),
      };

      console.log("📦 Payload enviado:", payload);

      const res = await fetch("/api/registrar_movimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");

      console.log("✅ Movimiento registrado:", data);
      alert("Movimiento registrado con éxito 🚀");
    } catch (err) {
      console.error("❌ Error registrando movimiento:", err);
      alert("Error al registrar movimiento ❌");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <MovimientoForm
        onAdd={handleAdd}
        idDeposito={idDeposito}
        setIdDeposito={setIdDeposito}
        idRazon={idRazon}
        setIdRazon={setIdRazon}
      />
      <MovimientosTable
        data={detalles}
        first={first}
        rows={rows}
        onDelete={handleDelete} // 👈 ahora sí
      />
      <MovimientosFooter
        totalRecords={detalles.length}
        rows={rows}
        onPageChange={handlePageChange}
        onVerMovimientos={handleVerMovimientos}
        onRegistrar={handleRegistrar}
      />
    </div>
  );
}
