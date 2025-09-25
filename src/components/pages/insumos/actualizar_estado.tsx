"use client";
import React, { useState } from "react";

// 📌 Componentes reutilizables
import TextInput from "@/components/common/inputs/textinput";
import TextAreaInput from "@/components/common/inputs/textarea";
import ToggleInput from "@/components/common/inputs/toggleinput";
import CategoryDropdown from "@/components/pages/insumos/lista_desplegable";
import Button from "@/components/common/button";

// 👇 Definimos el shape del form
type FormData = {
  nombre: string;
  descripcion: string;
  categoria: number | null; // id_categoria
  estado: boolean; // true = activo, false = inactivo
};

type ActualizarEstadoProps = {
  insumo?: {
    id?: number;
    nombre?: string;
    descripcion?: string;
    id_categoria?: number | null;
    estado?: string | boolean;
  };
  onClose?: () => void;
  onSave?: (data: FormData) => void; // 👈 ahora ya no es any
};

const ActualizarEstado: React.FC<ActualizarEstadoProps> = ({
  insumo,
  onClose,
  onSave,
}) => {
  // Estado local del formulario con valores iniciales
  const [formData, setFormData] = useState<FormData>({
    nombre: insumo?.nombre || "",
    descripcion: insumo?.descripcion || "",
    categoria: insumo?.id_categoria || null,
    estado:
      typeof insumo?.estado === "boolean"
        ? insumo.estado
        : insumo?.estado === "Activo",
  });

  // 🔄 Actualizar campo genérico
  const handleInputChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Guardar cambios
  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      <div className="space-y-4">
        {/* Nombre de insumo */}
        <TextInput
          label="Nombre de insumo"
          value={formData.nombre}
          onChange={(value) => handleInputChange("nombre", value)}
          placeholder="Ingrese el nombre del insumo"
          className="w-full"
          labelClassName="font-medium text-gray-900"
        />

        {/* Descripción */}
        <TextAreaInput
          label="Descripción"
          value={formData.descripcion}
          onChange={(value) => handleInputChange("descripcion", value)}
          placeholder="Descripción del insumo"
          rows={3}
          className="w-full"
          labelClassName="font-medium text-gray-900"
        />

        {/* Categoría */}
        <CategoryDropdown
          label="Categoría *"
          value={formData.categoria}
          onChange={(value) => handleInputChange("categoria", value)}
          className="w-full"
        />

        {/* Estado */}
        <ToggleInput
          label="Estado"
          value={formData.estado}
          onChange={(value) => handleInputChange("estado", value)}
          options={[
            { label: "Activo", value: true },
            { label: "Inactivo", value: false },
          ]}
          className="w-auto"
          labelClassName="font-medium text-gray-900"
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          label="Cancelar"
          icon="pi pi-ban"
          onClick={handleCancel}
          severity="danger"
          size="small"
          aria-label="Cancelar edición"
        />
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
