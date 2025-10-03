"use client";
import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import BotonCierre from "@/components/common/boton_cierre";

interface ProveedorFormProps {
  proveedor?: any;
  onClose: () => void;
  onSaved?: () => void;
}

export default function ProveedorForm({ proveedor, onClose, onSaved }: ProveedorFormProps) {
  const [formData, setFormData] = useState({
    nombre_proveedor: "",
    cuit_proveedor: "",
    correo_proveedor: "",
    telefono_proveedor: "",
    direccion_proveedor: "",
    contacto_responsable: "",
    condiciones_pago: "Efectivo",
    observaciones: "",
  });
  const [activo, setActivo] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string>("");

  const maxWords = 20; // límite de palabras en observaciones

  // Populate form when editing existing proveedor (supports multiple shapes)
  useEffect(() => {
    if (proveedor) {
      setFormData({
        nombre_proveedor:
          proveedor.nombre_proveedor ?? proveedor.nombre ?? "",
        cuit_proveedor:
          proveedor.cuit_proveedor ?? proveedor.cuit ?? "",
        correo_proveedor:
          proveedor.correo_proveedor ?? proveedor.email ?? "",
        telefono_proveedor:
          (proveedor.telefono_proveedor ?? proveedor.telefono ?? "").toString(),
        direccion_proveedor:
          proveedor.direccion_proveedor ?? proveedor.direccion ?? "",
        contacto_responsable:
          (proveedor.contacto_responsable ?? "").toString(),
        condiciones_pago: ["Efectivo", "Débito", "Transferencia"].includes(proveedor.condiciones_pago)
          ? proveedor.condiciones_pago
          : "Efectivo",
        observaciones: proveedor.observaciones ?? "",
      });
      setActivo(Boolean(proveedor.activo ?? true));
    }
  }, [proveedor]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "observaciones") {
      const words = value.trim().split(/\s+/);
      if (words.length > maxWords) return; // no permite más de maxWords
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setFormError("");

    try {
      // Normalizar y validar CUIT: 11 dígitos
      const cuitDigits = (formData.cuit_proveedor || "").replace(/\D/g, "");
      if (cuitDigits.length !== 11) {
        setFormError("El CUIT/CUIL debe tener 11 dígitos.");
        return;
      }

      const response = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, cuit_proveedor: cuitDigits, activo }),
      });

      if (!response.ok) {
        let msg = "Error al guardar el proveedor";
        try {
          const errorData = await response.json();
          msg = errorData.error || errorData.message || msg;
        } catch {
          // ignore parse error
        }
        // Mostrar inline si es CUIT duplicado o error validable
        if (/cuit/i.test(msg)) {
          setFormError(msg);
          return;
        }
        throw new Error(msg);
      }

      await response.json();

      setSuccess(true);
      // Notificar al padre que se guardó correctamente
      onSaved?.();
      setFormData({
        nombre_proveedor: "",
        cuit_proveedor: "",
        correo_proveedor: "",
        telefono_proveedor: "",
        direccion_proveedor: "",
        contacto_responsable: "",
        condiciones_pago: "Efectivo",
        observaciones: "",
      });

      // Close modal after successful save
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        if (/cuit/i.test(error.message)) {
          setFormError(error.message);
        } else {
          alert(error.message);
        }
      } else {
        alert("Error al procesar la solicitud");
      }
    } finally {
      setLoading(false);
    }
  };

  const observacionesWordCount = formData.observaciones.trim()
    ? formData.observaciones.trim().split(/\s+/).length
    : 0;

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4 relative">
      <div className="absolute top-3 right-3 z-10">
        <BotonCierre onClick={onClose} />
      </div>

      <h2 className="text-lg font-semibold text-gray-800">Registrar proveedor</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Nombre del proveedor</label>
          <InputText
            name="nombre_proveedor"
            value={formData.nombre_proveedor}
            onChange={handleChange}
            placeholder="Ej: Acme S.A."
            required
            disabled={loading}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">CUIT/CUIL</label>
          <InputText
            name="cuit_proveedor"
            value={formData.cuit_proveedor}
            onChange={handleChange}
            placeholder="XX-XXXXXXXX-X"
            pattern="[0-9]{2}-[0-9]{8}-[0-9]"
            required
            disabled={loading}
            className="w-full"
          />
          {formError && (
            <span className="text-xs text-red-600 mt-1">{formError}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Correo</label>
          <InputText
            name="correo_proveedor"
            value={formData.correo_proveedor}
            onChange={handleChange}
            type="email"
            placeholder="correo@ejemplo.com"
            disabled={loading}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Teléfono</label>
          <InputText
            name="telefono_proveedor"
            value={formData.telefono_proveedor}
            onChange={handleChange}
            type="tel"
            placeholder="(opcional)"
            disabled={loading}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Domicilio *</label>
          <InputText
            name="direccion_proveedor"
            value={formData.direccion_proveedor}
            onChange={handleChange}
            placeholder="Dirección del proveedor"
            required
            disabled={loading}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Teléfono responsable</label>
          <InputText
            name="contacto_responsable"
            value={formData.contacto_responsable}
            onChange={handleChange}
            placeholder="(opcional)"
            disabled={loading}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm text-gray-700">Condiciones de pago</label>
          <Dropdown
            value={formData.condiciones_pago}
            onChange={(e) => setFormData((prev) => ({ ...prev, condiciones_pago: e.value }))}
            options={[
              { label: "Efectivo", value: "Efectivo" },
              { label: "Débito", value: "Débito" },
              { label: "Transferencia", value: "Transferencia" },
            ]}
            placeholder="Seleccionar"
            disabled={loading}
            className="w-full"
          />
        </div>
      </div>



      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-700">Observaciones</label>
        <InputTextarea
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          placeholder="(opcional)"
          rows={5}
          disabled={loading}
          className="w-full"
        />
        <p
          className={`text-sm ${observacionesWordCount >= maxWords ? "text-red-500" : "text-gray-500"
            }`}
        >
          {observacionesWordCount}/{maxWords} palabras
        </p>
      </div>

      {/* Footer row: Estado (left) + Actions (right) */}
      <div className="flex items-center justify-between pt-6">
        {/* Estado - left */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-700">Estado</label>
          <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden divide-x divide-gray-300 bg-white">
            <Button
              type="button"
              label="Activo"
              className={`${activo ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-blue-50"} font-semibold rounded-none w-24 h-10 justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300`}
              outlined={!activo}
              onClick={() => setActivo(true)}
              aria-pressed={activo}
              disabled={loading}
            />
            <Button
              type="button"
              label="Inactivo"
              className={`${!activo ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-blue-50"} font-semibold rounded-none w-24 h-10 justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300`}
              outlined={activo}
              onClick={() => setActivo(false)}
              aria-pressed={!activo}
              disabled={loading}
            />
          </div>
        </div>
        {/* Actions - right */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            label="Cancelar"
            icon="pi pi-times"
            severity="danger"
            className="rounded-lg w-28 h-10 font-semibold text-white shadow-sm hover:shadow-md transition-shadow justify-center"
            onClick={() => {
              onClose?.();
            }}
            disabled={loading}
          />
          <Button
            label={success ? "¡Guardado!" : "Registrar"}
            icon={success ? "pi pi-check" : "pi pi-save"}
            loading={loading}
            type="submit"
            severity="success"
            className="rounded-lg w-28 h-10 font-semibold text-white shadow-sm hover:shadow-md transition-shadow justify-center"
            disabled={loading}
          />
        </div>
      </div>
    </form>
  );
}
