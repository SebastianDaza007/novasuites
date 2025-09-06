"use client";
import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";

interface ProveedorFormProps {
  proveedor?: any;
  onClose?: () => void;
}

export default function ProveedorForm({ proveedor, onClose }: ProveedorFormProps) {
  const [formData, setFormData] = useState({
    nombre_proveedor: "",
    cuit_proveedor: "",
    correo_proveedor: "",
    telefono_proveedor: "",
    direccion_proveedor: "",
    contacto_responsable: "",
    condiciones_pago: "",
    observaciones: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const maxWords = 20; // límite de palabras en observaciones

  // Populate form when editing existing proveedor
  useEffect(() => {
    if (proveedor) {
      setFormData({
        nombre_proveedor: proveedor.nombre || "",
        cuit_proveedor: proveedor.cuit || "",
        correo_proveedor: proveedor.email || "",
        telefono_proveedor: proveedor.telefono || "",
        direccion_proveedor: proveedor.direccion || "",
        contacto_responsable: "",
        condiciones_pago: "",
        observaciones: "",
      });
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

    try {
      const response = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar el proveedor");
      }

      await response.json();

      setSuccess(true);
      alert("Proveedor guardado exitosamente!");
      setFormData({
        nombre_proveedor: "",
        cuit_proveedor: "",
        correo_proveedor: "",
        telefono_proveedor: "",
        direccion_proveedor: "",
        contacto_responsable: "",
        condiciones_pago: "",
        observaciones: "",
      });
      
      // Close modal after successful save
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al procesar la solicitud"
      );
    } finally {
      setLoading(false);
    }
  };

  const observacionesWordCount = formData.observaciones.trim()
    ? formData.observaciones.trim().split(/\s+/).length
    : 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-lg shadow-md flex flex-col gap-4"
    >
      <input
        name="nombre_proveedor"
        value={formData.nombre_proveedor}
        onChange={handleChange}
        type="text"
        placeholder="Nombre de proveedor"
        required
        className="appearance-none border border-gray-300 py-3 px-4 rounded-lg focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
      />
      <input
        name="cuit_proveedor"
        value={formData.cuit_proveedor}
        onChange={handleChange}
        type="text"
        placeholder="CUIT (XX-XXXXXXXX-X)"
        pattern="[0-9]{2}-[0-9]{8}-[0-9]"
        required
        className="appearance-none border border-gray-300 py-3 px-4 rounded-lg focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500  text-gray-800"
      />
      <input
        name="correo_proveedor"
        value={formData.correo_proveedor}
        onChange={handleChange}
        type="email"
        placeholder="Email (opcional)"
        className="appearance-none border border-gray-300 py-3 px-4 rounded-lg focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
      />
      <input
        name="telefono_proveedor"
        value={formData.telefono_proveedor}
        onChange={handleChange}
        type="tel"
        placeholder="Teléfono (opcional)"
        className="appearance-none border border-gray-300 py-3 px-4 rounded-lg focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
      />
      <input
        name="direccion_proveedor"
        value={formData.direccion_proveedor}
        onChange={handleChange}
        type="text"
        placeholder="Dirección (opcional)"
        className="appearance-none border border-gray-300 py-3 px-4 rounded-lg focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
      />
      <input
        name="contacto_responsable"
        value={formData.contacto_responsable}
        onChange={handleChange}
        type="text"
        placeholder="Contacto Responsable (opcional)"
        className="appearance-none border border-gray-300 py-3 px-4 rounded-lg focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
      />
      <input
        name="condiciones_pago"
        value={formData.condiciones_pago}
        onChange={handleChange}
        type="text"
        placeholder="Condiciones de Pago (opcional)"
        className="appearance-none border border-gray-300 py-3 px-4 rounded-lg focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
      />
    
      {/* ✅ Observaciones como textarea con contador de palabras */}
      <div className="flex flex-col">
        <textarea
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          placeholder="Observaciones (opcional)"
          rows={5}
          className="w-full appearance-none border border-gray-300 py-3 px-4 rounded-lg focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
        />
        <p
          className={`text-sm mt-1 ${
            observacionesWordCount >= maxWords ? "text-red-500" : "text-gray-500"
          }`}
        >
          {observacionesWordCount}/{maxWords} palabras
        </p>
      </div>

      <div className="flex gap-4 mt-4">
        <Button
          label={success ? "¡Guardado!" : "Guardar"}
          icon={success ? "pi pi-check" : undefined}
          loading={loading}
          type="submit"
          className={`px-6 py-2 ${
            success ? "bg-green-600" : "bg-green-500 hover:bg-green-600"
          } text-white rounded`}
          severity="success"
          disabled={loading}
        />
        <Button
          label="Cancelar"
          icon="pi pi-times"
          type="button"
          className="px-10 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          severity="danger"
          onClick={() => {
            setFormData({
              nombre_proveedor: "",
              cuit_proveedor: "",
              correo_proveedor: "",
              telefono_proveedor: "",
              direccion_proveedor: "",
              contacto_responsable: "",
              condiciones_pago: "",
              observaciones: "",
            });
            if (onClose) {
              onClose();
            }
          }}
        />
      </div>
    </form>
  );
}
