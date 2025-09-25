"use client"; 
import React, { useState } from "react";

// Importes de tus componentes reutilizables (inputs/botones con tu propio estilo)
import TextInput from "@/components/common/inputs/textinput";      // Input de texto de una sola línea
import TextAreaInput from "@/components/common/inputs/textarea";   // Input multilinea
import ToggleInput from "@/components/common/inputs/toggleinput";  // Selector tipo toggle/segmented
import DropdownInput from "@/components/common/inputs/dropdown";   // Selector desplegable
import Button from "@/components/common/button";                   // Botón estilizado propio
import BotonCierre from "@/components/boton_cierre";               //  Import no usado en el JSX (puedes quitarlo si no lo vas a renderizar)

/**
 * Props del componente:
 * - insumo: datos iniciales para precargar el formulario (opcionales).
 * - onClose: callback para cerrar el modal/dialog contenedor.
 * - onSave: callback que recibe los datos validados del formulario al confirmar.
 */
type ActualizarEstadoProps = {
  insumo?: {
    id?: number;
    nombre?: string;
    descripcion?: string;
    categoria?: string;
    estado?: string;
  };
  onClose?: () => void;
  onSave?: (data: any) => void;
};

/**
 * Componente de formulario para crear/editar un insumo.
 * Mantiene un estado local (formData) y emite los cambios con onSave al confirmar.
 */
const ActualizarEstado: React.FC<ActualizarEstadoProps> = ({
  insumo,
  onClose,
  onSave,
}) => {
  //  Estado local del formulario con valores iniciales:
  // - Si viene `insumo`, precarga; si no, usa defaults.
  const [formData, setFormData] = useState({
    nombre: insumo?.nombre || "",              // Texto libre
    descripcion: insumo?.descripcion || "",    // Texto libre (multilínea)
    categoria: insumo?.categoria || "Limpieza",// Opción por defecto
    estado: insumo?.estado || "Activo",        // Opción por defecto
  });

  // Opciones disponibles para "Categoría" (se muestran con label, se guardan con value)
  const categoriaOptions = [
    { label: "Limpieza", value: "Limpieza" },
    { label: "Dormitorio", value: "Dormitorio" },
    { label: "Cocina", value: "Cocina" },
    { label: "Baño", value: "Baño" },
  ];

  // Opciones disponibles para "Estado"
  const estadoOptions = [
    { label: "Activo", value: "Activo" },
    { label: "Inactivo", value: "Inactivo" },
  ];

  /**
   *  Actualiza un campo del formulario de manera genérica.
   * `field` es la clave dentro de `formData` y `value` el nuevo valor.
   * Se usa la forma funcional de `setFormData` para evitar estados obsoletos.
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,       // Clona el estado anterior
      [field]: value // Sobrescribe solo el campo actualizado
    }));
  };

  /**
   *  Guardar:
   * - Si existe `onSave`, envía los datos actuales del formulario al padre.
   * - Luego, si existe `onClose`, cierra el modal/dialog.
   */
  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    if (onClose) {
      onClose();
    }
  };

  /**
   * Cancelar:
   * - No persiste cambios; simplemente cierra el modal/dialog si `onClose` está definido.
   */
  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    // Contenedor principal: padding, separación vertical entre secciones y posicionamiento relativo
    <div className="p-6 space-y-6 relative">
      {/* Bloque de campos del formulario (stack vertical con separación) */}
      <div className="space-y-4">
        {/* Campo: Nombre de insumo (input de una línea) */}
        <TextInput
          label="Nombre de insumo"                          // Etiqueta visible
          value={formData.nombre}                            // Estado controlado
          onChange={(value) => handleInputChange("nombre", value)} // Callback al cambiar
          placeholder="Ingrese el nombre del insumo"         // Ayuda visual
          className="w-full"                                 // Estilo: ocupa todo el ancho
          labelClassName="font-medium text-gray-900"         // Estilo de etiqueta
        />

        {/* Campo: Descripción (multilínea) */}
        <TextAreaInput
          label="Descripción"
          value={formData.descripcion}
          onChange={(value) => handleInputChange("descripcion", value)}
          placeholder="Descripción del insumo"
          rows={3}                                           // Alto del textarea (en filas)
          className="w-full"
          labelClassName="font-medium text-gray-900"
        />

        {/* Campo: Categoría (selector desplegable) */}
        <DropdownInput
          label="Categoría"
          value={formData.categoria}                         // Valor actual seleccionado
          onChange={(value) => handleInputChange("categoria", value)}
          options={categoriaOptions}                         // Lista de opciones
          className="w-full"
        />

        {/* Campo: Estado (toggle/segmented con opciones fijas) */}
        <ToggleInput
          label="Estado"
          value={formData.estado}
          onChange={(value) => handleInputChange("estado", value)}
          options={estadoOptions}
          className="w-auto"                                  // Ancho ajustado al contenido
          labelClassName="font-medium text-gray-900"
        />
      </div>

      {/*Footer de acciones (alineado a la derecha) */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        {/* Botón de cancelar: no guarda, sólo cierra */}
        <Button
          label="Cancelar"
          icon="pi pi-ban"                 
          onClick={handleCancel}
          severity="danger"                
          size="small"
          aria-label="Cancelar edición"    
        />

        {/* Botón de confirmar: guarda y cierra */}
        <Button
          label="Confirmar edición"
          icon="pi pi-check"               
          onClick={handleSave}
          severity="success"               
          size="small"
          aria-label="Confirmar edición del insumo"
        />
      </div>
    </div>
  );
};

export default ActualizarEstado; 