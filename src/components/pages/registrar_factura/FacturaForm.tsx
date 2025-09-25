"use client";

import { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import FacturaHeader from "./FacturaHeader";
import FacturaInsumos from "./FacturaInsumos";

type InsumoDetalle = {
  id_insumo: number;
  nombre: string;
  cantidad: number;
  precio: number;
  total: number;
};

interface FacturaFormProps {
  visible: boolean;
  onHide: () => void;
}

export default function FacturaForm({ visible, onHide }: FacturaFormProps) {
  const toast = useRef<Toast>(null);

  // 🔹 Estados del header
  const [proveedor, setProveedor] = useState<number | null>(null);
  const [numeroFactura, setNumeroFactura] = useState("");
  const [tipoFactura, setTipoFactura] = useState<"A" | "B" | "C">("A");
  const [ordenCompra, setOrdenCompra] = useState<number | null>(null);
  const [fechaVencimiento, setFechaVencimiento] = useState<Date | null>(null);
  const [estadoFactura, setEstadoFactura] = useState<
    "PENDIENTE" | "PAGADA" | "A_RECLAMAR"
  >("PENDIENTE");
  const [observaciones, setObservaciones] = useState("");

  // 🔹 Estados de insumos
  const [insumos, setInsumos] = useState<InsumoDetalle[]>([]);

  // 🔹 Total calculado
  const total = insumos.reduce((acc, i) => acc + i.total, 0);

  // 🔹 Estado de carga
  const [loading, setLoading] = useState(false);

  const showError = (message: string) => {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 4000,
    });
  };

  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: message,
      life: 3000,
    });
  };

  const handleSubmit = async () => {
    if (loading) return; // evitar doble click

    // 🔹 Validaciones locales
    if (!proveedor) return showError("Debe seleccionar un proveedor");
    if (!numeroFactura.trim()) return showError("Debe ingresar el número de factura");
    if (!tipoFactura) return showError("Debe seleccionar el tipo de factura");
    if (!fechaVencimiento) return showError("Debe seleccionar la fecha de vencimiento");
    if (!insumos.length) return showError("Debe agregar al menos un insumo");

    for (const i of insumos) {
      if (!i.id_insumo) return showError("Uno de los insumos no es válido");
      if (i.cantidad <= 0) return showError(`El insumo "${i.nombre}" tiene cantidad inválida`);
      if (i.precio <= 0) return showError(`El insumo "${i.nombre}" tiene precio inválido`);
    }

    const payload = {
      proveedor,
      numeroFactura,
      tipoFactura,
      ordenCompra,
      fechaVencimiento,
      estadoFactura,
      observaciones,
      insumos,
      total,
    };

    try {
      setLoading(true);

      const res = await fetch("/api/registrar_factura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // 🔹 Mostrar el mensaje exacto que vino del backend
        showError(data.error || "Error al registrar factura");
        return;
      }

      showSuccess("Factura registrada correctamente");
      console.log("✅ Factura registrada:", data);

      // 🔹 Reset form
      setProveedor(null);
      setNumeroFactura("");
      setTipoFactura("A");
      setOrdenCompra(null);
      setFechaVencimiento(null);
      setEstadoFactura("PENDIENTE");
      setObservaciones("");
      setInsumos([]);

      onHide();
    } catch (error) {
      console.error("❌ Error en handleSubmit:", error);
      showError("Error interno al registrar factura");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} position="top-right" />

      <Dialog
        header="Registrar factura"
        visible={visible}
        style={{ width: "70vw" }}
        modal
        onHide={onHide}
      >
        <div className="flex flex-col gap-6">
          {/* Bloque 1: Header */}
          <FacturaHeader
            proveedor={proveedor}
            setProveedor={setProveedor}
            numeroFactura={numeroFactura}
            setNumeroFactura={setNumeroFactura}
            tipoFactura={tipoFactura}
            setTipoFactura={setTipoFactura}
            ordenCompra={ordenCompra}
            setOrdenCompra={setOrdenCompra}
            fechaVencimiento={fechaVencimiento}
            setFechaVencimiento={setFechaVencimiento}
            estadoFactura={estadoFactura}
            setEstadoFactura={setEstadoFactura}
            observaciones={observaciones}
            setObservaciones={setObservaciones}
          />

          {/* Bloque 2: Insumos */}
          <FacturaInsumos insumos={insumos} setInsumos={setInsumos} />

          {/* Bloque 3: Footer */}
          <div className="flex justify-between items-center mt-4">
            {/* Total general */}
            <div className="text-right font-bold text-lg">
              Total: ${total.toLocaleString("es-AR")}
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <Button
                label="Cancelar"
                icon="pi pi-times"
                className="p-button-danger"
                onClick={onHide}
                disabled={loading}
              />

              <Button
                label="Registrar"
                icon="pi pi-check"
                className="p-button-success"
                onClick={handleSubmit}
                loading={loading} // 🔹 spinner automático
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
