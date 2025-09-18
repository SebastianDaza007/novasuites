"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

// 📌 Componentes custom
import CategoryDropdown from "@/components/pages/insumos/lista_desplegable";
import TextInput from "@/components/common/inputs/textinput";
import TextAreaInput from "@/components/common/inputs/textarea";
import ToggleInput from "@/components/common/inputs/toggleinput";
import DateInput from "@/components/common/inputs/inputfecha";
import DepositoDropdown from "@/components/pages/insumos/deposito_dropdown";

// 📌 Tipo que representa la forma en la que el backend nos devuelve los insumos (1 fila por depósito)
type Insumo = {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  stock: number;
  estado: boolean;
  deposito: string;
  fechaAlta: string | null;
  ultimaActualizacion: string | null;
};

export default function InsumosPage() {
  // ================================
  //  Estados principales
  // ================================
  const [productos, setProductos] = useState<Insumo[]>([]); // 🔄 Lista de insumos cargados desde la API
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // 🪟 Control del modal

  // ================================
  //  Estados del formulario de alta
  // ================================
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState<number | null>(null);
  const [estado, setEstado] = useState<boolean>(true);
  const [error, setError] = useState("");

  // ================================
  //  Estados para filtros (buscador)
  // ================================
  const [idFiltro, setIdFiltro] = useState<string>("");       // ID numérico
  const [nombreFiltro, setNombreFiltro] = useState<string>(""); // Insumo texto
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null); // Insumo categoria
  const [depositoFiltro, setDepositoFiltro] = useState<number | null>(null);
  const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Date | null>(null);
  // ================================
  //!!! funcion para limpiar filtros
  // ================================
  const limpiarFiltros = () => {
    setIdFiltro("");
    setNombreFiltro("");
    setCategoriaFiltro(null);
    setDepositoFiltro(null);
    setFechaDesde(null);
    setFechaHasta(null);
  };
  // ================================
  //  GET → Traer insumos del backend (montaje)
  // ================================
  useEffect(() => {
    const fetchInsumos = async () => {
      try {
        // Construcción dinámica de query params
        const params = new URLSearchParams();
        if (idFiltro.trim()) params.append("id", idFiltro);
        if (nombreFiltro.trim()) params.append("insumo", nombreFiltro);
        if (categoriaFiltro) params.append("categoriaId", String(categoriaFiltro)); //traemos el id
        if (depositoFiltro) params.append("depositoId", String(depositoFiltro)); //traemos el id
        if (fechaDesde) params.append("fechaDesde", fechaDesde.toISOString().split("T")[0]);
        if (fechaHasta) params.append("fechaHasta", fechaHasta.toISOString().split("T")[0]);
        
        const res = await fetch(`/api/insumos?${params.toString()}`);
        if (!res.ok) throw new Error("Error en la petición");
        const data: Insumo[] = await res.json();
        setProductos(data);
      } catch (error) {
        console.error("❌ Error cargando insumos:", error);
      }
    };

    fetchInsumos();
  }, [idFiltro, nombreFiltro, categoriaFiltro, depositoFiltro, fechaDesde, fechaHasta]); // 🔄 vuelve a pedir datos cuando cambia filtro

  // ================================
  //  POST → Registrar Insumo (desde el modal)
  // ================================
  const agregarInsumo = async () => {
    // 1) Validación mínima en el front
    if (!nombre.trim() || !categoria) {
      setError("Los campos Nombre y Categoría son obligatorios.");
      return;
    }
    setError("");

    try {
      // 2) Armamos el payload que espera el backend
      const payload = {
        nombre_insumo: nombre.trim(),
        descripcion_insumo: descripcion.trim() || null,
        id_categoria: Number(categoria), // ⚠️ Debe existir en BD
        activo: estado,
      };

      // 3) POST al backend
      const res = await fetch("/api/insumos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "No se pudo crear el insumo");
      }

      // 4) El backend devuelve 1 fila lista para tu DataTable
      const creado: Insumo = await res.json();

      // 5) Actualizamos la tabla en memoria (sin refetch)
      setProductos((prev) => [creado, ...prev]);

      // 6) Reseteamos formulario y cerramos modal
      setNombre("");
      setDescripcion("");
      setCategoria(null);
      setEstado(true);
      setMostrarFormulario(false);
    } catch (e: unknown) {
      if (e instanceof Error){
      console.error("❌ Error registrando insumo:", e.message);
      setError(e?.message || "Error inesperado al registrar.");
      } else{
                console.error("❌ Error desconocido registrando insumo:", e);
        setError("Error inesperado al registrar.");
      }
    }
  };

  // ================================
  //  Footer del modal de alta
  // ================================
  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setCategoria(null);
    setEstado(true);
    setError("");
  };
  const footer = (
    <div className="flex justify-end gap-2">
      <Button label="Cancelar" severity="danger" onClick={() => {resetForm(); setMostrarFormulario(false)}} />
      <Button label="Registrar" severity="success" onClick={agregarInsumo} />
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      {/* ================================
          Barra superior de acciones
         ================================ */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <Button
          label="Registrar nuevo insumo"
          icon="pi pi-plus"
          severity="success"
          onClick={() => setMostrarFormulario(true)}
        />
        <div className="flex flex-wrap gap-2">
          <Button label="Registrar Movimientos" severity="info" icon="pi pi-arrow-circle-left" />
          <Button label="Exportar a PDF/CSV" severity="info" icon="pi pi-file" />
          <Button label="Stock Crítico" severity="warning" icon="pi pi-exclamation-triangle" />
        </div>
      </div>

      {/* ================================
          Filtros de búsqueda
         ================================ */}
      <div className="flex flex-wrap items-end gap-4 bg-white p-3 rounded shadow">
        {/* Filtro ID → solo números */}
        <div className="flex-shrink-0 w-40">
          <TextInput
            label="ID"
            value={idFiltro}
            onChange={(val) => {
              if (/^\d*$/.test(val)) setIdFiltro(val); // solo números
            }}
            placeholder="Buscar por ID"
            className="w-full"
            icon="pi pi-search"
          />
        </div>
        {/*Filtro Insumo*/}
        <div className="flex-shrink-0 w-48">
          <TextInput
            label="Insumo"
            value={nombreFiltro}
            onChange={setNombreFiltro}
            placeholder="Buscar insumo"
            className="w-full"
            icon="pi pi-search"
          />
        </div>
        {/* Otros filtros (sin lógica aún) */}
        <div className="flex-shrink-0 w-45">
          <DepositoDropdown label="Depósito" value={depositoFiltro} onChange={setDepositoFiltro} className="w-full" />
        </div>
        <div className="flex-shrink-0 w-45">
          <CategoryDropdown label="Categoría" value={categoriaFiltro} onChange={setCategoriaFiltro} className="w-full" />
        </div>
        <div className="flex-shrink-0 w-40">
          <DateInput label="Desde" value={fechaDesde} onChange={setFechaDesde} className="w-full" />
        </div>
        <div className="flex-shrink-0 w-40">
          <DateInput label="Hasta" value={fechaHasta} onChange={setFechaHasta} className="w-full" />
        </div>
        <div className="flex-shrink-0">
          <Button
            label="Limpiar Filtros"
            icon="pi pi-filter-slash"
            outlined
            className="border"
            style={{ borderColor: "#EFC87A", color: "#C88419" }}
            onClick={limpiarFiltros}
          />
        </div>
        <div className="flex-shrink-0">
          <Button icon="pi pi-refresh"
            className="border" 
            outlined 
            onClick={() => window.location.reload()} // 👈 recarga toda la página
          />
        </div>
      </div>

      {/* ================================
          Tabla de insumos
         ================================ */}
      <DataTable value={productos} paginator rows={5} stripedRows>
        <Column field="id" header="ID" sortable />
        <Column field="nombre" header="Insumo" sortable />
        <Column field="stock" header="Stock" sortable />
        <Column field="descripcion" header="Descripción" />
        <Column field="fechaAlta" header="Fecha de alta" sortable />
        <Column field="deposito" header="Depósito" />
        <Column field="categoria" header="Categoría" />
        <Column
          field="estado"
          header="Estado"
          body={(row) => (
            <span
              className={`px-2 py-1 rounded text-sm font-medium ${
                row.estado ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
              }`}
            >
              {row.estado ? "Activo" : "Inactivo"}
            </span>
          )}
        />
        <Column field="ultimaActualizacion" header="Última actualización" sortable />
        <Column header="Acciones" body={() => <Button icon="pi pi-pencil" severity="secondary" rounded text />} />
      </DataTable>

      {/* ================================
          Modal de registro de insumo
         ================================ */}
      <Dialog
        header="Registro de insumos"
        visible={mostrarFormulario}
        style={{ width: "500px" }}
        modal
        footer={footer}
        onHide={() =>{resetForm(); setMostrarFormulario(false)}}
      >
        <div className="flex flex-col gap-4">
          {/* Mensaje de error de validación */}
          {error && (
            <div className="p-2 text-red-600 border border-red-400 bg-red-100 rounded">
              {error}
            </div>
          )}

          {/* Formulario de alta */}
          <TextInput
            label="Nombre de insumo *"
            value={nombre}
            onChange={setNombre}
            placeholder="Nombre del insumo"
            className="w-full"
          />
          <TextAreaInput
            label="Descripción"
            value={descripcion}
            onChange={setDescripcion}
            placeholder="Descripción del insumo"
            className="w-full"
          />
          {/* ⚠️ Importante: el id seleccionado debe existir en la tabla categoria */}
          <CategoryDropdown
            label="Categoría *"
            value={categoria}
            onChange={setCategoria}
            className="w-full"
          />
          <ToggleInput
            label="Estado"
            value={estado}
            onChange={setEstado}
            options={[
              { label: "Activo", value: true },
              { label: "Inactivo", value: false },
            ]}
            className="w-full"
          />
        </div>
      </Dialog>
    </div>
  );
}