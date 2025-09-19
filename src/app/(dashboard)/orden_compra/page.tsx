"use client";
import React, { use, useState, useEffect } from 'react';
import Dropdown from '@/components/orden_compra/dropdown';
import Calendar from '@/components/common/Calendario';
import Button from "@/components/common/button";
import InputIconField from '@/components/orden_compra/buscar_insumo';
import InputNumberOC from '@/components/orden_compra/inputnumber';
import TableInsumos from '@/components/orden_compra/datatableoc';
import DialogOC from '@/components/orden_compra/dialogOC';
import { insumo } from '@prisma/client';



type Insumo = {
  nombre_insumo: string;
  id_insumo: string;
  cantidad:number;
};
type Proveedor = {
  name: string;
  code: string;
  condiciones_pago: string; // Por ejemplo: "Efectivo", "Debito", "Transferencia"
};
export default function OC_page (){
    const [proveedorSelec, setProveedorSelec] = useState<Proveedor | null>(null);
    const [proveedores, setProveedores] = useState<{ name: string, code: string }[]>([]);
    const [condicionSelec, setCondicionSelec] = useState<string | null>(null);
    const [fecha, setFecha] = useState<Date | null>(null);
    
    const [value, setValue] = useState(0);
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [insumoSelec, setInsumoSelec] = useState<Insumo | null>(null);
    const [insumosAgregados, setInsumosAgregados] = useState<
  { id_insumo: string; nombre_insumo: string; cantidad: number }[]
>([]);

    
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


    const [visible, setVisible] = useState(false);

    
 
useEffect(() => {
  const fetchInsumos = async () => {
    try {
      const res = await fetch("/api/orden_compra/insumos");
      if (!res.ok) throw new Error("Error al obtener insumos");

      const data: Insumo[] = await res.json();
      setInsumos(data); // <- asignamos array completo
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

  const existe = insumosAgregados.some(
    (i) => i.id_insumo === insumoSelec.id_insumo
  );

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

  // Limpiar campos
  setInsumoSelec(null);
  setValue(0);
};

    return (
        <div>
            <Button label="Mostrar" icon="pi pi-external-link" onClick={() => setVisible(true)} />

            <DialogOC
                header="Nueva Orden de Compra"
                visible={visible}
                onHide={() => setVisible(false)}
                width="45vw">
                
                <div className="flex flex-wrap gap-4">
                    <Dropdown className="flex-1 w-full md:w-1/3"
                        value={proveedorSelec}
                        onChange={(e) => setProveedorSelec(e.value)}
                        options={proveedores}
                        optionLabel="nombre_proveedor"
                        
                        placeholder="Proveedor"
                    />
                    <Dropdown
                        className="flex-1 w-full md:w-1/3"
                        value={condicionSelec}
                        onChange={(e) => setCondicionSelec(e.value)}
                        options={proveedorSelec ? [proveedorSelec.condiciones_pago] : []} // solo la condición del proveedor
                        placeholder="Condición de pago"
                    />
                    <div className="flex-1 w-full md:w-1/3">
                        <Calendar 
                            dateFormat="dd/mm/yy"
                            value={fecha}
                            onChange={(e) => setFecha(e.value ?? null)}
                            showIcon
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex-1 w-full md:w-3/4">
                        <Dropdown
                            value={insumoSelec}
                            onChange={(e) => setInsumoSelec(e.value)}
                            options={insumos}            // <- array completo
                            optionLabel="nombre_insumo"   // <- campo que se muestra
                            placeholder="Selecciona un insumo"
                            filter
                        />
                    </div>
                    
                    <Button
                        icon="pi pi-plus"
                        label="Agregar"
                        severity="info"
                        onClick={handleAgregar}
                        />

                
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                    <div className='flex-1 w-full md:w-3/4'>
                        <InputNumberOC
                            placeholder="Cantidad*"
                            value={value}
                            onValueChange={(e) => setValue(e.value ?? 0)}
                            showButtons                        
                            inputClassName="text-right w-full"
                        />
                    </div>
                    <Button className='w-full md:w-1/4'
                        icon="pi pi-trash"
                        label="Limpiar"
                        severity='secondary'
                          onClick={() => {
                            setProveedorSelec(null);
                            setCondicionSelec(null);
                            setFecha(null);
                            setInsumoSelec(null);
                            setValue(0); // cantidad
                            }}
                    />
                </div>
                <div className='mt-4'>
                    <TableInsumos
                        data={insumosAgregados}
                        scrollable
                        scrollHeight="300px"
                        onDelete={(row) =>
                            setInsumosAgregados(insumosAgregados.filter(i => i.nombre_insumo !== row.nombre_insumo))
                        }
                    />
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                    <Button className='flex-1 w-full md:w-1/2'
                    icon="pi pi-ban"
                    
                    label='Cancelar'
                    severity='danger'
                    />
                    <Button className='w-full md:w-1/2'
                    icon="pi pi-check"
                    label='Generar'
                    severity='success'
                    />
                </div>
            </DialogOC>


        </div>
    )

}