"use client";

import { useState, useEffect } from "react";
import OCDialog from "@/components/orden_compra/modal_registrar_oc";
import Button from "@/components/common/button";
import Dropdown from "@/components/orden_compra/dropdown";
import Calendar from "@/components/common/Calendario";
import CustomOrdersTable from "@/components/orden_compra/data_table_mostrar";
import { estados_orden } from "@prisma/client";

export default function OC_page() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<any[]>([]); // 👈 tipado simple, podés poner tu tipo Order

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const res = await fetch("/api/orden_compra/mostrar_oc");
        if (!res.ok) throw new Error("Error al obtener órdenes");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOrdenes();
  }, []);
  const [selectedOrden, setSelectedOrden] = useState<number | null>(null);

  // Para las opciones del dropdown
  const ordenesOptions = data.map((o) => ({
    label: o.numero_orden, // lo que se muestra
    value: o.id_orden_compra // lo que se guarda
  }));
  const [selectedProveedor, setSelectedProveedor] = useState<number | null>(null);

// Mapear proveedores desde tus datos (asumiendo que vienen en `data`)
const proveedoresOptions = data
  .map((o) => o.proveedor)
  // opcional: eliminar duplicados por id
  .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
  .map((p) => ({
    label: p.nombre, // se muestra en la lista
    value: p.id      // se guarda en el estado
  }));
  const estadosOrden = [
    { label: "PENDIENTE", value: "PENDIENTE" },
    { label: "APROBADA", value: "APROBADA" },
    { label: "RECIBIDA", value: "RECIBIDA" },
    { label: "CANCELADA", value: "CANCELADA" },
  ];

  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [fechaEmisionDesde, setFechaEmisionDesde] = useState<Date | null>(null);
  const [fechaEmisionHasta, setFechaEmisionHasta] = useState<Date | null>(null);
  const [fechaEntregaDesde, setFechaEntregaDesde] = useState<Date | null>(null);
  const [fechaEntregaHasta, setFechaEntregaHasta] = useState<Date | null>(null);

  useEffect(() => {
    let temp = data;

    // Filtrar por nro orden
    if (selectedOrden) {
      temp = temp.filter((o) => o.id_orden_compra === selectedOrden);
    }

    // Filtrar por proveedor
    if (selectedProveedor) {
      temp = temp.filter((o) => o.proveedor.id === selectedProveedor);
    }

    // Filtrar por estado
    if (selectedEstado) {
      temp = temp.filter((o) => o.estado_orden === selectedEstado);
    }

    // Filtrar por fecha de emisión
    if (fechaEmisionDesde) {
      temp = temp.filter(
        (o) => new Date(o.fecha_orden) >= fechaEmisionDesde
      );
    }
    if (fechaEmisionHasta) {
      temp = temp.filter(
        (o) => new Date(o.fecha_orden) <= fechaEmisionHasta
      );
    }

    // Filtrar por fecha de entrega estimada
    if (fechaEntregaDesde) {
      temp = temp.filter(
        (o) => new Date(o.fecha_entrega_estimada) >= fechaEntregaDesde
      );
    }
    if (fechaEntregaHasta) {
      temp = temp.filter(
        (o) => new Date(o.fecha_entrega_estimada) <= fechaEntregaHasta
      );
    }

    setFilteredData(temp);
  }, [
    selectedOrden,
    selectedProveedor,
    selectedEstado,
    fechaEmisionDesde,
    fechaEmisionHasta,
    fechaEntregaDesde,
    fechaEntregaHasta,
    data,
  ]);



  return (
    <div className="p-4 ">
      <div className="pb-4">
        <Button
          label="Nueva orden de compra"
          onClick={() => setVisible(true)}
          severity="success"
        />
      </div>
      <div >
        <div className="flex items-center justify-between space-x-4 pt-4 bg-gray-50 pl-4">
          <div className="flex space-x-4">
            <Dropdown 
              placeholder="Nro Orden de Compra" 
              className="w-32"
              value={selectedOrden} 
              options={ordenesOptions}
              onChange={(e)=>setSelectedOrden(e.value)}
              filter/>
            <Dropdown 
              placeholder="Nombre Proveedor" 
              className="w-32" 
              filter
              value={selectedProveedor}
              options={proveedoresOptions}
              onChange={(e)=>setSelectedProveedor(e.value)}
              />
            <Dropdown 
              placeholder="Estado" 
              className="w-32" 
              value={selectedEstado}
              options={estadosOrden}
              onChange={(e)=>setSelectedEstado(e.value)}
              />
          </div>

          <Button
            label="Limpiar filtros"
            icon="pi pi-filter-slash"
            outlined
            size="small"
            className="!border-2 !rounded-lg !text-[#C88419] !border-[#EFC87A] hover:bg-[#EFC87A]/20 focus:ring-2 focus:ring-[#EFC87A] transition"
            onClick={() => {
            setSelectedOrden(null);
            setSelectedProveedor(null);
            setSelectedEstado(null);
            setFechaEmisionDesde(null);
            setFechaEmisionHasta(null);
            setFechaEntregaDesde(null);
            setFechaEntregaHasta(null);
  }}
          />
        </div>


        <div className="flex items-center justify-between space-x-4 bg-gray-50 pl-4">
          <div className="flex space-x-4 pt-4">
            <h3 className="text-black text-lg font-semibold pt-2">Emisión:</h3>
            <Calendar 
              showIcon 
              placeholder="Desde" 
              className="w-52"
              value={fechaEmisionDesde}
              onChange={(e)=>setFechaEmisionDesde(e.value ?? null)}/>
            <Calendar 
              showIcon 
              placeholder="Hasta" 
              className="w-52"
              value={fechaEmisionHasta}
              onChange={(e)=>setFechaEmisionHasta(e.value ?? null)} />
        

          
            <h3 className="text-black text-lg font-semibold pt-2">Entrega Estimada:</h3>
            <Calendar 
              showIcon 
              placeholder="Desde" 
              className="w-52"
              value={fechaEntregaDesde}
              onChange={(e)=>setFechaEntregaDesde(e.value ?? null)}/>
              
            <Calendar 
              showIcon 
              placeholder="Hasta" 
              className="w-52" 
              value={fechaEntregaHasta}
              onChange={(e)=>setFechaEntregaHasta(e.value ?? null)}/>
          </div>
        </div>
        <div className="wt-4"><CustomOrdersTable data={filteredData}  /></div>
      </div>

      <OCDialog 
      onCreated={(nuevaOrden) => setData((prev) => [...prev, nuevaOrden])}
      visible={visible} 
      onHide={() => setVisible(false)} />
    </div>
  );
}
