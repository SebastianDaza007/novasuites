"use client";

import React, { useState } from "react";
import Header from "@/components/headers/header";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import CategoryDropdown from "@/components/lista desplegable/lista_desplegable";
import Button from "@/components/botones/button";
import TextInput from "@/components/inputs/textinput";
import NumericInput from "@/components/inputs/inputnumber";
import TextAreaInput from "@/components/inputs/textarea";
import DateInput from "@/components/inputs/inputfecha";
import ToggleInput from "@/components/inputs/toggleinput";

// Datos mock
const productosMock = [
  { id: 1, nombre: "Monitor 24''", categoria: "Electrónica", stock: 15 },
  { id: 2, nombre: "Teclado Mecánico", categoria: "Periféricos", stock: 8 },
  { id: 3, nombre: "Silla Ergonómica", categoria: "Muebles", stock: 5 },
  { id: 4, nombre: "Notebook Dell", categoria: "Informática", stock: 3 },
  { id: 5, nombre: "Mouse Gamer", categoria: "Periféricos", stock: 20 },
];

export default function InsumosPage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Estado del formulario
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [nombreIns, setNombre] = useState("");
  const [precio, setPrecio] = useState<number | null>(0);
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [activo, setActivo] = useState("Activo");
  const [critico, setCritico] = useState<number | null>(0);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header con título y botón */}
      <Header title="Gestión de Insumos">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2 sm:gap-0">
          <p className="m-0">
            Aquí podés visualizar todos los productos disponibles en el depósito.
          </p>
          <Button
            label="Nuevo Insumo"
            severity="secondary"
            className="ml-0 sm:ml-4 w-full sm:w-auto"
            onClick={() => setMostrarFormulario(true)}
          />
        </div>
      </Header>

      {/* DataTable */}
      <div className="card overflow-x-auto">
        <DataTable
          value={productosMock}
          paginator
          rows={5}
          stripedRows
          tableStyle={{ minWidth: "50rem" }}
          emptyMessage="No se encontraron productos."
        >
          <Column field="id" header="ID" />
          <Column field="nombre" header="Nombre del Insumo" />
          <Column field="categoria" header="Categoría" />
          <Column field="stock" header="Stock" />
        </DataTable>
      </div>

      {/* Formulario modal/pop-up */}
      {mostrarFormulario && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="w-full max-w-lg md:max-w-2xl h-[90vh] bg-white rounded shadow-md text-gray-900 flex flex-col overflow-hidden">
            {/* Scroll interno */}
            <div className="overflow-y-auto px-6 py-6 flex-1 flex flex-col gap-4">
              {/* Header del formulario */}
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-lg font-bold">Registrar Nuevo Insumo</h3>
                <Button
                  icon="pi pi-times"
                  rounded
                  text
                  raised
                  severity="danger"
                  aria-label="Cancelar"
                  onClick={() => setMostrarFormulario(false)}
                />
              </div>

              {/* Inputs */}
              <TextInput
                label="Nombre del insumo"
                value={nombreIns}
                onChange={setNombre}
                placeholder="Nombre del insumo"
                className="w-full"
              />

              <CategoryDropdown
                label="Categoria"
                value={selectedCategory}
                onChange={setSelectedCategory}
                className="w-full"
              />

              <NumericInput
                label="Precio Unitario"
                value={precio}
                onChange={setPrecio}
                min={0}
                maxFractionDigits={2}
                placeholder="Precio"
                className="w-full"
              />

              <DateInput
                label="Fecha de vencimiento"
                value={fecha}
                onChange={setFecha}
                placeholder="dd/mm/yyyy"
                className="w-full"
              />

              <TextAreaInput
                label="Descripción"
                value={descripcion}
                onChange={setDescripcion}
                placeholder="Ejemplo: Leche entera pasteurizada y UHT, en envase de 1 litro."
                className="w-full"
              />

              <ToggleInput
                label="Estado"
                value={activo}
                onChange={setActivo}
                options={["Inactivo", "Activo"]}
                className="w-full"
              />

              <NumericInput
                label="Stock crítico"
                value={critico}
                onChange={setCritico}
                min={0}
                minFractionDigits={0}
                maxFractionDigits={0}
                className="w-full"
              />
            </div>

            {/* Botón Agregar */}
            <div className="flex justify-end p-6 border-t flex-shrink-0">
              <Button
                label="Agregar"
                severity="success"
                onClick={() => console.log("Nuevo insumo agregado")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
