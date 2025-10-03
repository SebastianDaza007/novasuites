"use client";

import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

interface GuestFormProps {
  onSubmit?: (payload: any) => void;
  onClear?: () => void;
}

const roomTypes = [
  { label: "Suite", value: "suite" },
  { label: "Doble", value: "doble" },
  { label: "Triple", value: "triple" },
];

const paymentTypes = [
  { label: "Tarjeta", value: "tarjeta" },
  { label: "Efectivo", value: "efectivo" },
  { label: "Transferencia", value: "transferencia" },
];

const GuestForm: React.FC<GuestFormProps> = ({ onSubmit, onClear }) => {
  const [titular, setTitular] = useState("Ramon Valdez");
  const [documento, setDocumento] = useState("44444449 / LA080402");
  const [mail, setMail] = useState("user@domain.com");
  const [telefono, setTelefono] = useState("3875555555");
  const [tipoHabitacion, setTipoHabitacion] = useState<string | null>("suite");
  const [adultos, setAdultos] = useState<number>(1);
  const [menores, setMenores] = useState<number>(0);
  const [desde, setDesde] = useState<Date | null>(null);
  const [hasta, setHasta] = useState<Date | null>(null);
  const [estado, setEstado] = useState<"pendiente" | "confirmado" | "cancelado">("pendiente");
  const [formaPago, setFormaPago] = useState<string | null>("tarjeta");
  
  // Posición del deslizador para el control de "Estado"
  const sliderPosition =
    estado === "pendiente"
      ? "translate-x-0"
      : estado === "confirmado"
      ? "translate-x-[100%]"
      : "translate-x-[200%]";
  // Color del deslizador según estado
  const sliderBg =
    estado === "pendiente"
      ? "bg-blue-600"
      : estado === "confirmado"
      ? "bg-emerald-600"
      : "bg-rose-600";
  const sliderRing =
    estado === "pendiente"
      ? "ring-blue-500/30"
      : estado === "confirmado"
      ? "ring-emerald-500/30"
      : "ring-rose-500/30";

  const clear = () => {
    setTitular("");
    setDocumento("");
    setMail("");
    setTelefono("");
    setTipoHabitacion(null);
    setAdultos(0);
    setMenores(0);
    setDesde(null);
    setHasta(null);
    setFormaPago(null);
    setEstado("pendiente");
    onClear?.();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Datos del huesped titular</h2>

      <div className="flex flex-col gap-3">
        {/* Titular */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Titular</label>
          <span className="p-input-icon-left w-full">
            <i className="pi pi-user" />
            <InputText value={titular} onChange={(e) => setTitular(e.target.value)} className="w-full" placeholder="Nombre y apellido" />
          </span>
        </div>

        {/* Documento */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Documento/Pasaporte</label>
          <InputText value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="Documento o Pasaporte" className="w-full" />
        </div>

        {/* Mail */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Mail</label>
          <span className="p-input-icon-left w-full">
            <i className="pi pi-envelope" />
            <InputText value={mail} onChange={(e) => setMail(e.target.value)} placeholder="user@domain.com" className="w-full" />
          </span>
        </div>

        {/* Telefono */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Telefono</label>
          <div className="flex gap-2">
            <span className="p-input-icon-left w-28">
              <i className="pi pi-flag" />
              <InputText value={"+54 9"} readOnly className="w-full" />
            </span>
            <InputText value={telefono} onChange={(e) => setTelefono(e.target.value)} className="flex-1" placeholder="3875555555" />
          </div>
        </div>

        {/* Tipo de habitación */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Tipo de habitacion</label>
          <Dropdown value={tipoHabitacion} onChange={(e) => setTipoHabitacion(e.value)} options={roomTypes} placeholder="Seleccionar" className="w-full" />
        </div>

        {/* Huespedes */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Huespedes</label>
          <div className="grid grid-cols-2 gap-2">
            <span className="p-inputgroup w-full">
              <span className="p-inputgroup-addon">Adultos</span>
              <InputNumber value={adultos} onValueChange={(e) => setAdultos(e.value ?? 0)} showButtons buttonLayout="stacked" inputClassName="w-full" className="w-full" min={0} max={10} />
            </span>
            <span className="p-inputgroup w-full">
              <span className="p-inputgroup-addon">Menores</span>
              <InputNumber value={menores} onValueChange={(e) => setMenores(e.value ?? 0)} showButtons buttonLayout="stacked" inputClassName="w-full" className="w-full" min={0} max={10} />
            </span>
          </div>
        </div>

        {/* Fechas */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Fecha check-in / check-out</label>
          <div className="grid grid-cols-2 gap-2">
            <span className="p-input-icon-right w-full">
              <Calendar value={desde} onChange={(e) => setDesde(e.value as Date)} placeholder="Desde" dateFormat="dd/mm/yy" className="w-full" showIcon iconPos="right" />
            </span>
            <span className="p-input-icon-right w-full">
              <Calendar value={hasta} onChange={(e) => setHasta(e.value as Date)} placeholder="Hasta" dateFormat="dd/mm/yy" className="w-full" showIcon iconPos="right" />
            </span>
          </div>
        </div>

        {/* Forma de pago */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Forma de pago</label>
          <Dropdown value={formaPago} onChange={(e) => setFormaPago(e.value)} options={paymentTypes} placeholder="Seleccionar" className="w-full" />
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 mb-1">Estado</label>
          <div className="relative w-full" role="tablist" aria-label="Estado de la reserva">
            <div className="relative grid grid-cols-3 border border-gray-200 bg-white w-full shadow-sm divide-x divide-gray-200">
              <span
                aria-hidden
                className={`absolute top-0 left-0 h-full w-1/3 shadow ring-1 transition-transform duration-300 ease-out will-change-transform ${sliderPosition} ${sliderBg} ${sliderRing}`}
              />
              <button
                type="button"
                role="tab"
                aria-selected={estado === "pendiente"}
                onClick={() => setEstado("pendiente")}
                className={`relative z-10 px-4 py-2.5 text-sm font-semibold text-center transition-colors ${estado === "pendiente" ? "text-white" : "text-slate-700 hover:text-slate-900"}`}
              >
                Pendiente
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={estado === "confirmado"}
                onClick={() => setEstado("confirmado")}
                className={`relative z-10 px-4 py-2.5 text-sm font-semibold text-center transition-colors ${estado === "confirmado" ? "text-white" : "text-slate-700 hover:text-slate-900"}`}
              >
                Confirmado
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={estado === "cancelado"}
                onClick={() => setEstado("cancelado")}
                className={`relative z-10 px-4 py-2.5 text-sm font-semibold text-center transition-colors ${estado === "cancelado" ? "text-white" : "text-slate-700 hover:text-slate-900"}`}
              >
                Cancelado
              </button>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-2">
          <Button label="Limpiar formulario" icon="pi pi-filter-slash" severity="secondary" className="p-button-secondary" onClick={clear} />
          <Button label="Agendar turno" icon="pi pi-check" className="text-white rounded-md px-4" style={{ backgroundColor: '#22C55E', borderColor: '#22C55E' }} onClick={() => onSubmit?.({ titular, documento, mail, telefono, tipoHabitacion, adultos, menores, desde, hasta, formaPago, estado })} />
        </div>
      </div>
    </div>
  );
};

export default GuestForm;

