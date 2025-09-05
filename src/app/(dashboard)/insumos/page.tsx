"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import CategoryDropdown from "@/components/lista desplegable/lista_desplegable";
import Button from "@/components/botones/button";
import TextInput from "@/components/inputs/textinput";
import NumericInput from "@/components/inputs/inputnumber";
import TextAreaInput from "@/components/inputs/textarea";
import DateInput from "@/components/inputs/inputfecha";
import ToggleInput from "@/components/inputs/toggleinput";

export default function FormularioNuevoInsumo() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  
  // Estados del formulario
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [nombreIns, setNombre] = useState("");
  const [precio, setPrecio] = useState<number | null>(0);
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [activo, setActivo] = useState("Activo");
  const [critico, setCritico] = useState<number | null>(0);
  
  // Estados de control
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Función de validación
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!nombreIns.trim()) {
      newErrors.nombreIns = "El nombre del insumo es requerido";
    }
    
    if (!selectedCategory) {
      newErrors.categoria = "La categoría es requerida";
    }
    
    if (!precio || precio <= 0) {
      newErrors.precio = "El precio debe ser mayor a 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para limpiar formulario
  const limpiarFormulario = () => {
    setNombre("");
    setSelectedCategory(null);
    setPrecio(0);
    setDescripcion("");
    setFecha("");
    setActivo("Activo");
    setCritico(0);
    setErrors({});
  };

  // Función para convertir fecha DD/MM/YYYY a formato ISO datetime
  const convertirFecha = (fechaString: string): string | undefined => {
    if (!fechaString || fechaString.length !== 10) return undefined;
    
    const [day, month, year] = fechaString.split('/');
    if (!day || !month || !year) return undefined;
    
    // Crear fecha en formato YYYY-MM-DD y agregar hora 00:00:00
    const fechaISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`;
    
    // Verificar que la fecha sea válida
    const date = new Date(fechaISO);
    if (isNaN(date.getTime())) return undefined;
    
    return fechaISO;
  };

  // Función de envío
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'Por favor, corrige los campos marcados',
        life: 3000
      });
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        nombre_insumo: nombreIns.trim(),
        descripcion_insumo: descripcion.trim() || undefined,
        costo_unitario: precio,
        fecha_expiracion: convertirFecha(fecha),
        id_categoria: selectedCategory,
        // id_proveedor se podría agregar más tarde si es necesario
      };

      // Debug: mostrar lo que se está enviando
      console.log('Payload enviado:', payload);

      const response = await fetch('/api/insumos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log('Respuesta del servidor:', data);

      if (data.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Insumo creado exitosamente',
          life: 3000
        });
        
        limpiarFormulario();
        
        // Opcional: redirigir después de un tiempo
        setTimeout(() => {
          router.push('/movimientos-insumos');
        }, 2000);
        
      } else {
        // Mostrar errores de validación si existen
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => err.message).join(', ');
          throw new Error(`Errores de validación: ${errorMessages}`);
        }
        throw new Error(data.message || 'Error al crear insumo');
      }
      
    } catch (error) {
      console.error('Error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Error inesperado al crear insumo',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 mt-4">
      <Toast ref={toast} />

      {/* Botones externos a la derecha */}
      <div className="w-full flex justify-end gap-3 mb-4">
        <Button
          label="Ver Movimientos"
          icon="pi pi-history"
          severity="info"
          className="w-40 h-10 text-sm"
          onClick={() => router.push('/movimientos-insumos')}
        />
        <Button
          label="Nuevo Insumo"
          icon="pi pi-plus"
          severity="secondary"
          className="w-32 h-10 text-sm"
          onClick={() => console.log("Botón externo presionado")}
        />
      </div>

      {/* Formulario centrado */}
      <div className="flex justify-center">
        <div className="w-full md:w-2/5 p-6 bg-white rounded shadow-md text-gray-900 scale-95">

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
              minFractionDigits={0} // solo enteros
              maxFractionDigits={0}
              className="w-full"
            />
          </div>

          {/* Botones Limpiar y Agregar separados hacia la derecha */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              label="Limpiar"
              severity="secondary"
              onClick={limpiarFormulario}
              disabled={loading}
            />
            <Button
              label={loading ? "Guardando..." : "Agregar"}
              severity="success"
              loading={loading}
              onClick={handleSubmit}
              disabled={loading}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
