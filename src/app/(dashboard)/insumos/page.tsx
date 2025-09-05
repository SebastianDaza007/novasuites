"use client";

import React, { useState } from "react";
import CategoryDropdown from "@/components/lista desplegable/lista_desplegable";
import Button from "@/components/botones/button";
import TextInput from "@/components/inputs/textinput";
import NumericInput from "@/components/inputs/inputnumber";
import TextAreaInput from "@/components/inputs/textarea";
import DateInput from "@/components/inputs/inputfecha";
import ToggleInput from "@/components/inputs/toggleinput";

export default function FormularioNuevoInsumo() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [nombreIns, setNombre] = useState("");
  const [precio, setPrecio] = useState<number | null>(0);
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [activo, setActivo] = useState("Activo");
  const [critico, setCritico] = useState<number | null>(0);

  // Estado para controlar la visibilidad del formulario
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  return (
    <div className="w-full px-4 mt-4">

      {/* Botón externo a la derecha */}
      <div className="w-full flex justify-end mb-4">
        <Button
          label="Nuevo Insumo"
          severity="secondary"
          className="w-32 h-10 text-sm"
          onClick={() => setMostrarFormulario(true)} // Mostrar formulario al hacer click
        />
      </div>

      {/* Renderizar formulario solo si mostrarFormulario es true */}
      {mostrarFormulario && (
        <div className="flex justify-center">
          <div className="w-full md:w-2/5 p-6 bg-white rounded shadow-md text-gray-900 scale-95 mt-0">

            {/* Header: Título y botón de salir */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Registrar Nuevo Insumo</h3>
              <Button
                icon="pi pi-times"
                rounded
                text
                raised
                severity="danger"
                aria-label="Cancelar"
                onClick={() => setMostrarFormulario(false)} // Ocultar formulario al presionar X
              />
            </div>

            {/* Contenedor de Inputs */}
            <div className="flex flex-col gap-4">
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

            {/* Botón Agregar separado hacia la derecha */}
            <div className="mt-6 flex justify-end">
              <Button
                label="Agregar"
                severity="success"
                onClick={() => console.log("Botón presionado")}
              />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
