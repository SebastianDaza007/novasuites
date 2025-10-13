"use client";

import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const paymentTypes = [
  { label: "Tarjeta", value: 1 },
  { label: "Efectivo", value: 2 },
  { label: "Transferencia", value: 3 },
];

const GuestForm: React.FC = () => {
  const toast = useRef<Toast>(null);

  // Datos del huésped
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [mail, setMail] = useState("");
  const [telefono, setTelefono] = useState("");

  // Datos de la reserva
  const [adultos, setAdultos] = useState<number>(1);
  const [menores, setMenores] = useState<number>(0);
  const [desde, setDesde] = useState<Date | null>(null);
  const [hasta, setHasta] = useState<Date | null>(null);
  const [formaPago, setFormaPago] = useState<number | null>(null);
  const [monto, setMonto] = useState<number>(0);

  // Tarjeta (opcional)
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [titularTarjeta, setTitularTarjeta] = useState("");
  const [expiracion, setExpiracion] = useState<Date | null>(null);
  const [codigoSeguridad, setCodigoSeguridad] = useState<number | null>(null);

  // Limpiar formulario
  const clear = (): void => {
    setNombre("");
    setApellido("");
    setDocumento("");
    setMail("");
    setTelefono("");
    setDesde(null);
    setHasta(null);
    setMonto(0);
    setFormaPago(null);
    setNumeroTarjeta("");
    setTitularTarjeta("");
    setExpiracion(null);
    setCodigoSeguridad(null);
  };

  // Enviar formulario
  const handleSubmit = async (): Promise<void> => {
    try {
      if (!desde || !hasta) {
        toast.current?.show({
          severity: "warn",
          summary: "Fechas inválidas",
          detail: "Debes seleccionar check-in y check-out",
        });
        return;
      }

      if (!nombre || !apellido || !documento) {
        toast.current?.show({
          severity: "warn",
          summary: "Campos obligatorios",
          detail: "Completa los datos del huésped antes de continuar",
        });
        return;
      }

      const payload = {
        huesped: {
          nombre,
          apellido,
          documento,
          telefono,
          email: mail,
        },
        reserva: {
          id_metodo_pago: formaPago,
          fecha_checkin: desde.toISOString().split("T")[0],
          fecha_checkout: hasta.toISOString().split("T")[0],
          cantidad_adultos: adultos,
          cantidad_menores: menores,
          estado: "RESERVADA", // 🔹 Fijo por ahora
          monto_total: monto,
        },
        tarjeta:
          numeroTarjeta && titularTarjeta
            ? {
                numero_tarjeta: numeroTarjeta,
                titular_tarjeta: titularTarjeta,
                fecha_expiracion: expiracion ? expiracion.toISOString().split("T")[0] : null,
                codigo_seguridad: codigoSeguridad ?? 0,
              }
            : undefined,
        habitaciones: [
          { id_habitacion: 1, cantidad_personas: adultos + menores },
        ],
      };

      console.log("📤 Enviando reserva:", payload);

      const res = await fetch("/api/registrar_reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: { error?: string } = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al registrar la reserva");
      }

      toast.current?.show({
        severity: "success",
        summary: "Reserva registrada",
        detail: "Se guardó correctamente",
      });

      clear();
    } catch (error) {
      if (error instanceof Error) {
        console.error("❌ Error al enviar reserva:", error);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: error.message || "Ocurrió un problema al registrar la reserva",
        });
      }
    }
  };

  // Render
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <Toast ref={toast} />
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Registrar reserva</h2>

      <div className="flex flex-col gap-3">
        {/* Huesped */}
        <div className="grid grid-cols-2 gap-2">
          <InputText
            value={nombre}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
            placeholder="Nombre (Ej: Juan)"
          />
          <InputText
            value={apellido}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApellido(e.target.value)}
            placeholder="Apellido (Ej: Pérez)"
          />
        </div>

        <InputText
          value={documento}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocumento(e.target.value)}
          placeholder="Documento / Pasaporte"
        />
        <InputText
          value={mail}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMail(e.target.value)}
          placeholder="Correo electrónico"
        />
        <InputText
          value={telefono}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTelefono(e.target.value)}
          placeholder="Teléfono (Ej: 3875555555)"
        />

        {/* Reserva */}
        <div className="grid grid-cols-2 gap-2">
          <Calendar
            value={desde}
            onChange={(e) => setDesde(e.value ?? null)}
            placeholder="Fecha check-in"
            showIcon
          />
          <Calendar
            value={hasta}
            onChange={(e) => setHasta(e.value ?? null)}
            placeholder="Fecha check-out"
            showIcon
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <InputNumber
            value={adultos}
            onValueChange={(e: InputNumberValueChangeEvent) => setAdultos(e.value ?? 1)}
            placeholder="Cantidad de adultos"
          />
          <InputNumber
            value={menores}
            onValueChange={(e: InputNumberValueChangeEvent) => setMenores(e.value ?? 0)}
            placeholder="Cantidad de menores"
          />
        </div>

        <Dropdown
          value={formaPago}
          onChange={(e: DropdownChangeEvent) => setFormaPago(e.value)}
          options={paymentTypes}
          placeholder="Método de pago"
        />

        <InputNumber
          value={monto}
          onValueChange={(e: InputNumberValueChangeEvent) => setMonto(e.value ?? 0)}
          mode="currency"
          currency="ARS"
          locale="es-AR"
          placeholder="Monto total"
        />

        {/* Tarjeta (opcional) */}
        <h3 className="text-lg font-semibold mt-3">Tarjeta (opcional)</h3>
        <InputText
          value={numeroTarjeta}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNumeroTarjeta(e.target.value)}
          placeholder="Número de tarjeta (Ej: 4111111111111111)"
        />
        <InputText
          value={titularTarjeta}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitularTarjeta(e.target.value)}
          placeholder="Titular de la tarjeta"
        />
        <div className="grid grid-cols-2 gap-2">
          <Calendar
            value={expiracion}
            onChange={(e) => setExpiracion(e.value ?? null)}
            placeholder="Vencimiento"
            showIcon
          />
          <InputNumber
            value={codigoSeguridad}
            onValueChange={(e: InputNumberValueChangeEvent) => setCodigoSeguridad(e.value ?? 0)}
            placeholder="Código CVV"
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-4">
          <Button label="Limpiar" icon="pi pi-filter-slash" severity="secondary" onClick={clear} />
          <Button
            label="Registrar reserva"
            icon="pi pi-check"
            onClick={handleSubmit}
            style={{ backgroundColor: "#22C55E", borderColor: "#22C55E" }}
          />
        </div>
      </div>
    </div>
  );
};

export default GuestForm;
