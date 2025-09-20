"use client";

import { useState, useEffect } from "react";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

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

type MovimientoFormProps = {
  onAdd: (detalle: MovimientoDetalle) => void;
  idDeposito: number | null;
  setIdDeposito: (id: number | null) => void;
  idRazon: number | null;
  setIdRazon: (id: number | null) => void;
  observaciones: string;
  setObservaciones: (v: string) => void;
};

export default function MovimientoForm({
  onAdd,
  idDeposito,
  setIdDeposito,
  idRazon,
  setIdRazon,
  observaciones,
  setObservaciones,
}: MovimientoFormProps) {
  const [idInsumo, setIdInsumo] = useState<number | null>(null);

  const [insumos, setInsumos] = useState<{ label: string; value: number }[]>([]);
  const [depositos, setDepositos] = useState<{ label: string; value: number }[]>([]);
  const [razones, setRazones] = useState<{ label: string; value: number; tipo: string }[]>([]);

  const [cantidad, setCantidad] = useState<number | null>(null);
  const [lote, setLote] = useState("");
  const [vencimiento, setVencimiento] = useState<Date | null>(null);
  const [stockMinimo, setStockMinimo] = useState<number | null>(null);
  const [stockCritico, setStockCritico] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resInsumos = await fetch("/api/registrar_movimiento/insumos");
        const dataInsumos = await resInsumos.json();
        setInsumos(dataInsumos.map((i: any) => ({ label: i.nombre_insumo, value: i.id_insumo })));

        const resDepositos = await fetch("/api/registrar_movimiento/depositos");
        const dataDepositos = await resDepositos.json();
        setDepositos(dataDepositos.map((d: any) => ({ label: d.nombre_deposito, value: d.id_deposito })));

        const resRazones = await fetch("/api/registrar_movimiento/razones");
        const dataRazones = await resRazones.json();
        setRazones(dataRazones.map((r: any) => ({ label: r.nombre_razon, value: r.id_razon, tipo: r.tipo_movimiento })));
      } catch (error) {
        console.error("❌ Error cargando datos del form:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (idInsumo && idDeposito) {
      const fetchStock = async () => {
        try {
          const res = await fetch(`/api/registrar_movimiento/stock/${idInsumo}/${idDeposito}`);
          const data = await res.json();
          if (data) {
            setStockMinimo(data.stock_minimo ?? null);
            setStockCritico(data.stock_critico ?? null);
          }
        } catch (error) {
          console.error("❌ Error obteniendo stock:", error);
        }
      };
      fetchStock();
    }
  }, [idInsumo, idDeposito]);

  const handleAdd = () => {
    if (!idDeposito || !idRazon) {
      alert("Debe seleccionar depósito y razón antes de agregar un insumo.");
      return;
    }
    if (!idInsumo || !cantidad) {
      alert("Debe seleccionar un insumo y cantidad.");
      return;
    }

    const insumoLabel = insumos.find((i) => i.value === idInsumo)?.label || "";

    const nuevoDetalle: MovimientoDetalle = {
      id: Date.now(),
      id_insumo: idInsumo,
      insumo: insumoLabel,
      cantidad,
      lote: lote || undefined,
      vencimiento: vencimiento ? vencimiento.toISOString().split("T")[0] : undefined,
      stockMinimo: stockMinimo || undefined,
      stockCritico: stockCritico || undefined,
    };

    onAdd(nuevoDetalle);
    handleClear();
  };

  const handleClear = () => {
    setIdInsumo(null);
    setCantidad(null);
    setLote("");
    setVencimiento(null);
    setStockMinimo(null);
    setStockCritico(null);
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm space-y-6">
      {/* Globales: Depósito + Razón + Observaciones */}
      <div className="space-y-4 pb-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dropdown
            id="deposito"
            value={idDeposito}
            options={depositos}
            onChange={(e) => setIdDeposito(e.value)}
            className="w-full"
            placeholder="Depósito"
          />
          <Dropdown
            id="razon"
            value={idRazon}
            options={razones}
            onChange={(e) => setIdRazon(e.value)}
            className="w-full"
            placeholder="Razón de movimiento"
          />
        </div>
        <InputTextarea
          id="observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={4}
          className="w-full min-h-[120px]"
          placeholder="Observaciones"
        />
      </div>

      {/* Detalle de insumo + botones */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="md:col-span-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dropdown
              id="insumo"
              value={idInsumo}
              options={insumos}
              onChange={(e) => setIdInsumo(e.value)}
              className="w-full"
              placeholder="ID/Nombre insumo"
              filter
              showClear
            />
            <InputNumber
              id="cantidad"
              value={cantidad}
              onValueChange={(e) => setCantidad(e.value ?? null)}
              className="w-full"
              placeholder="Cantidad"
            />
            <InputNumber
              id="stockMinimo"
              value={stockMinimo}
              onValueChange={(e) => setStockMinimo(e.value ?? null)}
              className="w-full"
              placeholder="Stock mínimo en depósito"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputNumber
              id="stockCritico"
              value={stockCritico}
              onValueChange={(e) => setStockCritico(e.value ?? null)}
              className="w-full"
              placeholder="Stock crítico en depósito"
            />
            <InputText
              id="lote"
              value={lote}
              onChange={(e) => setLote(e.target.value)}
              className="w-full"
              placeholder="Lote (opcional)"
            />
            <Calendar
              id="vencimiento"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.value as Date)}
              className="w-full"
              dateFormat="yy-mm-dd"
              placeholder="Vencimiento (opcional)"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col justify-center items-stretch gap-4">
          <Button
            label="Agregar"
            severity="info"
            icon="pi pi-plus"
            onClick={handleAdd}
            className="w-full py-3"
          />
          <Button
            label="Limpiar"
            severity="secondary"
            icon="pi pi-trash"
            onClick={handleClear}
            className="w-full py-3"
          />
        </div>
      </div>
    </div>
  );
}
