"use client";
import React, { useState, useEffect } from 'react';
import Dropdown from '@/components/orden_compra/dropdown';
import Calendar from '@/components/common/Calendario';
import Button from "@/components/common/button";
import InputNumberOC from '@/components/orden_compra/inputnumber';
import TableInsumos from '@/components/orden_compra/datatableoc';
import DialogOC from '@/components/orden_compra/dialogOC';

type Insumo = {
  nombre_insumo: string;
  id_insumo: string;
  cantidad:number;
};

type Proveedor = {
  name: string;
  id_proveedor: string;
};

type OCDialogWrapperProps = {
  visible: boolean;
  onHide: () => void;
};

export default function OCDialogWrapper({ visible, onHide }: OCDialogWrapperProps) {
  const [proveedorSelec, setProveedorSelec] = useState<Proveedor | null>(null);
  const [proveedores, setProveedores] = useState<{ name: string; code: string }[]>([]);
  const [fecha, setFecha] = useState<Date | null>(null);
  const [value, setValue] = useState(0);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [insumoSelec, setInsumoSelec] = useState<Insumo | null>(null);
  const [insumosAgregados, setInsumosAgregados] = useState<{ id_insumo: string; nombre_insumo: string; cantidad: number }[]>([]);

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const res = await fetch(`/api/orden_compra/proveedores`);
        if (!res.ok) throw new Error("Error al obtener proveedores");
        const data: { name: string; code: string }[] = await res.json();
        setProveedores(data);
      } catch (error) {
        console.error("Error al obtener proveedores", error);
      }
    };
    fetchProveedores();
  }, []);

  useEffect(() => {
    const fetchInsumos = async () => {
      try {
        const res = await fetch("/api/orden_compra/insumos");
        if (!res.ok) throw new Error("Error al obtener insumos");
        const data: Insumo[] = await res.json();
        setInsumos(data);
      } catch (error) {
        console.error("Error al obtener insumos:", error);
      }
    };
    fetchInsumos();
  }, []);

  const handleAgregar = () => {
    if (!insumoSelec) {
      alert("Por favor selecciona un insumo.");
      return;
    }
    if (value <= 0) {
      alert("La cantidad debe ser mayor a cero.");
      return;
    }
    const existe = insumosAgregados.some(i => i.id_insumo === insumoSelec.id_insumo);
    if (existe) {
      alert("El insumo ya fue agregado.");
      return;
    }
    const nuevoInsumo = {
      id_insumo: insumoSelec.id_insumo,
      nombre_insumo: insumoSelec.nombre_insumo,
      cantidad: value,
    };
    setInsumosAgregados([...insumosAgregados, nuevoInsumo]);
    setInsumoSelec(null);
    setValue(0);
  };

  const handleGenerarOrden = async () => {
    if (!proveedorSelec) { alert("Selecciona un proveedor"); return; }
    if (!fecha) { alert("Selecciona una fecha de entrega estimada"); return; }
    if (insumosAgregados.length === 0) { alert("Debes agregar al menos un insumo"); return; }
    const hoy = new Date();
    if (fecha <= hoy) { alert("La fecha de entrega estimada debe ser posterior a hoy"); return; }

    try {
      const res = await fetch("/api/orden_compra/post_oc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_proveedor: proveedorSelec.id_proveedor,
          id_usuario_solicita: 1,
          fecha_entrega_estimada: fecha.toISOString(),
          observaciones: null,
          insumos: insumosAgregados.map((i) => ({ id_insumo: Number(i.id_insumo), cantidad: i.cantidad })),
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        alert("Error: " + error.error);
        return;
      }
      const data = await res.json();
      alert(`Orden de compra creada con éxito: ${data.numero_orden}`);
      // limpiar todo
      setProveedorSelec(null);
      setFecha(null);
      setInsumoSelec(null);
      setValue(0);
      setInsumosAgregados([]);
      onHide();
    } catch (error) {
      console.error("Error al generar la orden:", error);
      alert("Error al generar la orden");
    }
  };

  return (
    <DialogOC header="Nueva Orden de Compra" visible={visible} onHide={onHide} width="45vw">
      <div className="flex flex-wrap gap-4">
        <Dropdown className="flex-1 w-full md:w-1/2" value={proveedorSelec} onChange={(e) => setProveedorSelec(e.value)} options={proveedores} optionLabel="nombre_proveedor" placeholder="Proveedor" />
        <div className="flex-1 w-full md:w-1/2">
          <Calendar dateFormat="dd/mm/yy" value={fecha} onChange={(e) => setFecha(e.value ?? null)} showIcon />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mt-4">
        <div className="flex-1 w-full md:w-3/4">
          <Dropdown value={insumoSelec} onChange={(e) => setInsumoSelec(e.value)} options={insumos} optionLabel="nombre_insumo" placeholder="Selecciona un insumo" filter />
        </div>
        <Button icon="pi pi-plus" label="Agregar" severity="info" onClick={handleAgregar} />
      </div>
      <div className="flex flex-wrap gap-4 mt-4">
        <div className='flex-1 w-full md:w-3/4'>
          <InputNumberOC placeholder="Cantidad*" value={value} onValueChange={(e) => setValue(e.value ?? 0)} showButtons inputClassName="text-right w-full" />
        </div>
        <Button className='w-full md:w-1/4' icon="pi pi-trash" label="Limpiar" severity='secondary' onClick={() => { setProveedorSelec(null); setFecha(null); setInsumoSelec(null); setValue(0); }} />
      </div>
      <div className='mt-4'>
        <TableInsumos data={insumosAgregados} scrollable scrollHeight="300px" onDelete={(row) => setInsumosAgregados(insumosAgregados.filter(i => i.nombre_insumo !== row.nombre_insumo))} />
      </div>
      <div className="flex flex-wrap gap-4 mt-4">
        <Button className='flex-1 w-full md:w-1/2' icon="pi pi-ban" label='Cancelar' severity='danger' onClick={onHide} />
        <Button className='w-full md:w-1/2' icon='pi pi-check' label='Generar' severity='success' onClick={handleGenerarOrden} />
      </div>
    </DialogOC>
  );
}
