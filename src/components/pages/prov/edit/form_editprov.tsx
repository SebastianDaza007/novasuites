"use client";

import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import BotonCierre from "@/components/common/boton_cierre";

type EditProveedorFormProps = {
  onClose?: () => void;
  onSaved?: () => void;
  proveedorData?: any;
};

const EditProveedorForm: React.FC<EditProveedorFormProps> = ({ onClose, onSaved, proveedorData }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    cuit: "",
    nombre: "",
    correo: "",
    telefono: "",
    telefono_responsable: "",
    domicilio: "",
    condiciones_pago: "Efectivo",
    estado: "Activo",
    observaciones: "",
  });
  const [originalCuit, setOriginalCuit] = useState("");
  const maxWords = 20;

  useEffect(() => {
    if (!proveedorData) return;
    setFormData({
      cuit: proveedorData.cuit_proveedor || "",
      nombre: proveedorData.nombre_proveedor || "",
      correo: proveedorData.correo_proveedor || "",
      telefono: proveedorData.telefono_proveedor?.toString() || "",
      telefono_responsable: proveedorData.contacto_responsable?.toString() || "",
      domicilio: proveedorData.direccion_proveedor || "",
      condiciones_pago: ["Efectivo", "Débito", "Transferencia"].includes(proveedorData.condiciones_pago)
        ? proveedorData.condiciones_pago
        : "Efectivo",
      estado: proveedorData.activo ? "Activo" : "Inactivo",
      observaciones: proveedorData.observaciones || "",
    });
    setOriginalCuit(String(proveedorData.cuit_proveedor || "").replace(/\D/g, ""));
  }, [proveedorData]);

  const onlyDigits = (v: unknown) => String(v ?? "").replace(/\D/g, "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'observaciones') {
      const words = value.trim().split(/\s+/);
      if (words.length > maxWords) return; // limita a 20 palabras
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDropdown = (value: string) => {
    setFormData(prev => ({ ...prev, condiciones_pago: value }));
  };

  const saveNonCuitFields = async () => {
    const payload = {
      nombre_proveedor: formData.nombre,
      correo_proveedor: formData.correo,
      direccion_proveedor: formData.domicilio,
      contacto_responsable: formData.telefono_responsable,
      telefono_proveedor: formData.telefono,
      condiciones_pago: formData.condiciones_pago,
      activo: formData.estado === "Activo",
      observaciones: formData.observaciones,
    };
    const res = await fetch(`/api/proveedores/${proveedorData.id_proveedor}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || 'No se pudo actualizar el proveedor');
    }
  };

  const saveCuitIfChanged = async () => {
    const cuitDigits = onlyDigits(formData.cuit);
    if (!cuitDigits || cuitDigits === originalCuit) return; // no cambió
    if (cuitDigits.length !== 11) {
      setErrorMsg('CUIT debe tener 11 dígitos. Se mantendrá el CUIT anterior.');
      return;
    }
    const res = await fetch(`/api/proveedores/${proveedorData.id_proveedor}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cuit_proveedor: cuitDigits }),
    });
    if (!res.ok) {
      if (res.status === 409) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error || 'CUIT ya existe';
        setErrorMsg(`${msg}. Se mantuvo el CUIT anterior. Los demás cambios ya fueron guardados.`);
        return;
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || 'No se pudo actualizar el CUIT');
    }
  };

  const handleSave = async () => {
    if (!proveedorData?.id_proveedor) {
      alert('Error: No se pudo identificar el proveedor a editar');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg("");
      await saveNonCuitFields();
      if (onSaved) onSaved();
      await saveCuitIfChanged();
      if (!errorMsg && onClose) onClose();
    } catch (e) {
      console.error(e);
      setErrorMsg('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const observacionesWordCount = formData.observaciones.trim()
    ? formData.observaciones.trim().split(/\s+/).length
    : 0;

  return (
    <div className="card p-6 space-y-4 relative max-h-[70vh] overflow-y-auto">
      <div className="absolute top-3 right-3 z-10">
        <BotonCierre onClick={onClose} />
      </div>
      <h2 className="text-lg font-semibold text-gray-800">Editar proveedor</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Nombre del proveedor</label>
          <InputText name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Acme S.A." className="w-full" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">CUIT/CUIL</label>
          <InputText name="cuit" value={formData.cuit} onChange={handleChange} placeholder="XX-XXXXXXXX-X" pattern="[0-9]{2}-[0-9]{8}-[0-9]" className="w-full" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Correo</label>
          <InputText name="correo" value={formData.correo} onChange={handleChange} placeholder="correo@proveedor.com" className="w-full" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Teléfono</label>
          <InputText name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ej: 011-1234-5678" className="w-full" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Domicilio *</label>
          <InputText name="domicilio" value={formData.domicilio} onChange={handleChange} placeholder="Dirección del proveedor" className="w-full" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Teléfono responsable</label>
          <InputText name="telefono_responsable" value={formData.telefono_responsable} onChange={handleChange} placeholder="(opcional)" className="w-full" />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm text-gray-700">Condiciones de pago</label>
          <Dropdown value={formData.condiciones_pago} onChange={(e) => handleDropdown(e.value)} options={[{ label: 'Efectivo', value: 'Efectivo' }, { label: 'Débito', value: 'Débito' }, { label: 'Transferencia', value: 'Transferencia' }]} className="w-full" placeholder="Seleccionar" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-700">Observaciones</label>
        <InputTextarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows={3} className="w-full" placeholder="(opcional)" />
        <p className={`text-sm ${observacionesWordCount >= maxWords ? 'text-red-500' : 'text-gray-500'}`}>
          {observacionesWordCount}/{maxWords} palabras
        </p>
      </div>

      {errorMsg && <div className="text-red-600 text-sm">{errorMsg}</div>}

      {/* Footer row: Estado (left) + Actions (right) */}
      <div className="flex items-center justify-between pt-6">
        {/* Estado - left */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-700">Estado</label>
          <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden divide-x divide-gray-300 bg-white">
            <Button type="button" label="Activo" className={`${formData.estado === 'Activo' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'} font-semibold rounded-none w-24 h-10 justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300`} outlined={formData.estado !== 'Activo'} onClick={() => setFormData(prev => ({ ...prev, estado: 'Activo' }))} />
            <Button type="button" label="Inactivo" className={`${formData.estado === 'Inactivo' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'} font-semibold rounded-none w-24 h-10 justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300`} outlined={formData.estado !== 'Inactivo'} onClick={() => setFormData(prev => ({ ...prev, estado: 'Inactivo' }))} />
          </div>
        </div>

        {/* Actions - right */}
        <div className="flex items-center gap-3">
          <Button label="Cancelar" icon="pi pi-times" severity="danger" className="rounded-lg w-28 h-10 font-semibold text-white shadow-sm hover:shadow-md transition-shadow justify-center" onClick={onClose} disabled={loading} />
          <Button label={loading ? 'Guardando...' : 'Guardar Cambios'} icon="pi pi-check" severity="success" className="rounded-lg w-28 h-10 font-semibold text-white shadow-sm hover:shadow-md transition-shadow justify-center" onClick={handleSave} disabled={loading} />
        </div>
      </div>
    </div>
  );
};

export default EditProveedorForm;
