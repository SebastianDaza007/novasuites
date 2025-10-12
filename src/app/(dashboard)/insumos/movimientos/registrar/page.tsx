"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MovimientoForm from "@/components/pages/registrar_movimiento/MovimientoForm";
import MovimientosTable from "@/components/pages/registrar_movimiento/MovimientosTable";
import MovimientosFooter from "@/components/pages/registrar_movimiento/MovimientosFooter";

type MovimientoDetalle = {
  id: number;
  id_insumo: number;
  insumo: string;
  cantidad: number;
  lote?: string;
  vencimiento?: string;
  stockMinimo?: number;
  stockCritico?: number;
};

export default function Page() {
  const [detalles, setDetalles] = useState<MovimientoDetalle[]>([]);
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);

  const [idDeposito, setIdDeposito] = useState<number | null>(null);
  const [idRazon, setIdRazon] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState(""); 
  const [ordenCompra, setOrdenCompra] = useState("");   // 👈 nuevo estado

  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    router.push("/insumos/movimientos/movimientos-insumos");
  };

  const handleRegistrar = async () => {
    try {
      setLoading(true);

      const payload = {
        id_usuario: 1, // 👈 después podrías tomarlo del contexto de sesión
        id_deposito: idDeposito,
        id_razon_movimiento: idRazon,
        numero_comprobante: "ABC123", // 👈 aún hardcodeado
        observaciones,
        orden_compra: ordenCompra || null,   // 👈 nuevo
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

      location.reload();
    } catch (err) {
      console.error("❌ Error registrando movimiento:", err);
      alert("Error al registrar movimiento ❌");
      setLoading(false);
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
        observaciones={observaciones}
        setObservaciones={setObservaciones}
        ordenCompra={ordenCompra}             // 👈 nuevo
        setOrdenCompra={setOrdenCompra}       // 👈 nuevo
      />
      <MovimientosTable
        data={detalles}
        first={first}
        rows={rows}
        onDelete={handleDelete}
      />
      <MovimientosFooter
        totalRecords={detalles.length}
        rows={rows}
        onPageChange={handlePageChange}
        onVerMovimientos={handleVerMovimientos}
        onRegistrar={handleRegistrar}
        loading={loading}
      />
    </div>
  );
}
