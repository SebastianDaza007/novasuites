"use client";

import React, { useState } from "react";
import TextInput from "@/components/common/inputs/textinput";
import TextAreaInput from "@/components/common/inputs/textarea";
import ToggleInput from "@/components/common/inputs/toggleinput";
import DropdownInput from "@/components/common/inputs/dropdown";
import Button from "@/components/common/button";
import BotonCierre from "@/components/common/boton_cierre";

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

const ActualizarEstado: React.FC<ActualizarEstadoProps> = ({
  insumo,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    nombre: insumo?.nombre || "",
    descripcion: insumo?.descripcion || "",
    categoria: insumo?.categoria || "Limpieza",
    estado: insumo?.estado || "Activo",
  });

  const categoriaOptions = [
    { label: "Limpieza", value: "Limpieza" },
    { label: "Dormitorio", value: "Dormitorio" },
    { label: "Cocina", value: "Cocina" },
    { label: "Baño", value: "Baño" },
  ];

  const estadoOptions = [
    { label: "Activo", value: "Activo" },
    { label: "Inactivo", value: "Inactivo" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

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
        <TextInput
          label="Nombre de insumo"
          value={formData.nombre}
          onChange={(value) => handleInputChange("nombre", value)}
          placeholder="Ingrese el nombre del insumo"
          className="w-full"
        />

        <TextAreaInput
          label="Descripción"
          value={formData.descripcion}
          onChange={(value) => handleInputChange("descripcion", value)}
          placeholder="Descripción del insumo"
          rows={3}
          className="w-full"
        />

        <DropdownInput
          label="Categoría"
          value={formData.categoria}
          onChange={(value) => handleInputChange("categoria", value)}
          options={categoriaOptions}
          className="w-full"
        />

        <ToggleInput
          label="Estado"
          value={formData.estado}
          onChange={(value) => handleInputChange("estado", value)}
          options={estadoOptions}
          className="w-auto"
        />
      </div>

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