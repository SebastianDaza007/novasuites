"use client";

import React, { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { AutoComplete, AutoCompleteCompleteEvent } from "primereact/autocomplete";
import { InputMask } from "primereact/inputmask";

// 🧩 Importamos el tipo RoomRow desde el componente tabla
import type { RoomRow } from "./tabla";

// 🧩 Tipado de huésped
interface Huesped {
  id_huespedes: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono?: string | null;
  email?: string | null;
}

// 🧩 Tipado de las props: ahora recibe habitaciones completas
interface GuestFormProps {
  habitacionesSeleccionadas: RoomRow[];
  onTotalPersonasChange?: (total: number) => void;
}

// 💳 Métodos de pago
const paymentTypes = [
  { label: "Tarjeta", value: 2 },
  { label: "Efectivo", value: 3 },
  { label: "Transferencia", value: 4 },
];

const GuestForm: React.FC<GuestFormProps> = ({ habitacionesSeleccionadas, onTotalPersonasChange }) => {
  const toast = useRef<Toast>(null);

  // -----------------------------
  // 🧍 Datos del huésped
  // -----------------------------
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [mail, setMail] = useState("");
  const [telefono, setTelefono] = useState("");

  // Para el AutoComplete
  const [sugerenciasHuespedes, setSugerenciasHuespedes] = useState<Huesped[]>([]);
  const [huespedSeleccionado, setHuespedSeleccionado] = useState<Huesped | null>(null);

  // -----------------------------
  // 🏨 Datos de la reserva
  // -----------------------------
  const [adultos, setAdultos] = useState<number>(1);
  const [menores, setMenores] = useState<number>(0);

  const [desde, setDesde] = useState<Date | null>(null);
  const [hasta, setHasta] = useState<Date | null>(null);
  const [formaPago, setFormaPago] = useState<number | null>(null);
  const [monto, setMonto] = useState<number>(0);

  // 🧮 Calcular el monto total según las habitaciones seleccionadas
  useEffect(() => {
    const total = habitacionesSeleccionadas.reduce(
      (acc, hab) => acc + Number(hab.precio_base || 0),
      0
    );
    setMonto(total);
  }, [habitacionesSeleccionadas]);

  // 🔄 Notificar al padre cuando cambie el total de personas
  useEffect(() => {
    const total = adultos + menores;
    onTotalPersonasChange?.(total);
  }, [adultos, menores, onTotalPersonasChange]);

  // 🔍 Buscar huéspedes para AutoComplete
  const buscarHuespedes = async (event: AutoCompleteCompleteEvent): Promise<void> => {
    const query = event.query;

    if (!query || query.length < 2) {
      setSugerenciasHuespedes([]);
      return;
    }

    try {
      const res = await fetch(`/api/huespedes?search=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.success && data.data) {
        setSugerenciasHuespedes(data.data);
      } else {
        setSugerenciasHuespedes([]);
      }
    } catch (error) {
      console.error("Error buscando huespedes:", error);
      setSugerenciasHuespedes([]);
    }
  };

  // 🔄 Cuando se selecciona un huésped del AutoComplete
  const handleSeleccionarHuesped = (huesped: Huesped): void => {
    setHuespedSeleccionado(huesped);
    setDocumento(huesped.documento);
    setNombre(huesped.nombre);
    setApellido(huesped.apellido);
    setTelefono(huesped.telefono || "");
    setMail(huesped.email || "");

    toast.current?.show({
      severity: "success",
      summary: "Huesped seleccionado",
      detail: `${huesped.nombre} ${huesped.apellido}`,
      life: 2000,
    });
  };

  // -----------------------------
  // 💳 Datos de la tarjeta (opcional)
  // -----------------------------
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [titularTarjeta, setTitularTarjeta] = useState("");
  const [expiracion, setExpiracion] = useState<string>("");
  const [codigoSeguridad, setCodigoSeguridad] = useState<number | null>(null);

  // -----------------------------
  // 🧹 Limpiar formulario
  // -----------------------------
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
    setExpiracion("");
    setCodigoSeguridad(null);
  };

  // -----------------------------
  // 🚀 Enviar formulario
  // -----------------------------
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

      if (habitacionesSeleccionadas.length === 0) {
        toast.current?.show({
          severity: "warn",
          summary: "Sin habitaciones",
          detail: "Selecciona al menos una habitación disponible",
        });
        return;
      }

      // 🔍 Validar que la suma de personas asignadas coincida con el total
      const totalPersonasAsignadas = habitacionesSeleccionadas.reduce(
        (sum, hab) => sum + (hab.cantidad_personas || 0),
        0
      );
      const totalPersonasReserva = adultos + menores;

      if (totalPersonasAsignadas !== totalPersonasReserva) {
        toast.current?.show({
          severity: "warn",
          summary: "Distribución incorrecta",
          detail: `Has asignado ${totalPersonasAsignadas} persona(s) en las habitaciones, pero la reserva es para ${totalPersonasReserva} persona(s). Por favor ajusta la distribución.`,
          life: 5000,
        });
        return;
      }

      // 🔍 Validar que ninguna habitación exceda su capacidad
      const habitacionExcedida = habitacionesSeleccionadas.find(
        (hab) => (hab.cantidad_personas || 0) > hab.capacidad
      );

      if (habitacionExcedida) {
        toast.current?.show({
          severity: "error",
          summary: "Capacidad excedida",
          detail: `La habitación ${habitacionExcedida.numero} tiene capacidad para ${habitacionExcedida.capacidad} persona(s) pero has asignado ${habitacionExcedida.cantidad_personas}.`,
          life: 5000,
        });
        return;
      }

      // 🔧 Construcción del payload que espera la API
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
          estado: "RESERVADA",
          monto_total: monto,
        },
        tarjeta:
          numeroTarjeta && titularTarjeta
            ? {
                numero_tarjeta: numeroTarjeta,
                titular_tarjeta: titularTarjeta,
                fecha_expiracion: expiracion
                  ? (() => {
                      // Convertir MM/YY a fecha (primer día del mes)
                      const [mes, anio] = expiracion.split('/');
                      const anioCompleto = `20${anio}`;
                      return `${anioCompleto}-${mes}-01`;
                    })()
                  : null,
                codigo_seguridad: codigoSeguridad ?? 0,
              }
            : undefined,
        habitaciones: habitacionesSeleccionadas.map((h) => ({
          id_habitacion: h.id_habitaciones,
          cantidad_personas: h.cantidad_personas || 1,
        })),
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

  // -----------------------------
  // 🧱 Render del formulario
  // -----------------------------
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <Toast ref={toast} />
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Registrar reserva
      </h2>

      <div className="flex flex-col gap-3">
        {/* Huesped */}
        <div className="grid grid-cols-2 gap-2">
          <InputText
            value={nombre}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNombre(e.target.value)
            }
            placeholder="Nombre (Ej: Juan)"
          />
          <InputText
            value={apellido}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setApellido(e.target.value)
            }
            placeholder="Apellido (Ej: Pérez)"
          />
        </div>

        <AutoComplete
          value={documento}
          suggestions={sugerenciasHuespedes}
          completeMethod={buscarHuespedes}
          delay={200}
          minLength={2}
          onChange={(e) => {
            // Si es un string, actualizar documento
            if (typeof e.value === 'string') {
              setDocumento(e.value);
            } else if (e.value && typeof e.value === 'object') {
              // Si es un objeto Huesped, extraer el documento
              setDocumento(e.value.documento);
            }
          }}
          onSelect={(e) => handleSeleccionarHuesped(e.value as Huesped)}
          field="documento"
          placeholder="Documento / Pasaporte"
          inputClassName="w-full"
          className="w-full"
          itemTemplate={(huesped: Huesped) => (
            <div className="flex flex-col py-2">
              <span className="font-semibold">
                {huesped.nombre} {huesped.apellido}
              </span>
              <span className="text-sm text-gray-600">
                DNI: {huesped.documento}
              </span>
            </div>
          )}
        />
        <InputText
          value={mail}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMail(e.target.value)
          }
          placeholder="Correo electrónico"
        />
        <InputText
          value={telefono}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTelefono(e.target.value)
          }
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

        {/* Cantidades de personas */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Cantidad de adultos</label>
            <InputNumber
              value={adultos}
              onValueChange={(e: InputNumberValueChangeEvent) =>
                setAdultos(e.value ?? 1)
              }
              showButtons
              buttonLayout="stacked"
              inputClassName="w-full"
              className="w-full"
              min={1}
              max={10}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Cantidad de menores</label>
            <InputNumber
              value={menores}
              onValueChange={(e: InputNumberValueChangeEvent) =>
                setMenores(e.value ?? 0)
              }
              showButtons
              buttonLayout="stacked"
              inputClassName="w-full"
              className="w-full"
              min={0}
              max={10}
            />
          </div>
        </div>

        <Dropdown
          value={formaPago}
          onChange={(e: DropdownChangeEvent) => setFormaPago(e.value)}
          options={paymentTypes}
          placeholder="Método de pago"
        />

        <InputNumber
          value={monto}
          mode="currency"
          currency="ARS"
          locale="es-AR"
          placeholder="Monto total"
          disabled
        />

        {/* Tarjeta (opcional) */}
        <h3 className="text-base font-semibold text-gray-800 mt-3 mb-1">
          Tarjeta (opcional)
        </h3>
        <InputText
          value={numeroTarjeta}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNumeroTarjeta(e.target.value)
          }
          placeholder="Número de tarjeta (Ej: 4111111111111111)"
        />
        <InputText
          value={titularTarjeta}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTitularTarjeta(e.target.value)
          }
          placeholder="Titular de la tarjeta"
        />
        <div className="grid grid-cols-2 gap-2">
          <InputMask
            value={expiracion}
            onChange={(e) => {
              const valor = e.value ?? "";
              // Validar que el mes esté entre 01 y 12
              if (valor.length >= 2) {
                const mes = parseInt(valor.substring(0, 2));
                if (mes > 12) {
                  setExpiracion("12" + valor.substring(2));
                  return;
                } else if (mes === 0 && valor.length === 2) {
                  setExpiracion("01");
                  return;
                }
              }
              setExpiracion(valor);
            }}
            mask="99/99"
            placeholder="Vencimiento (MM/AA)"
          />
          <InputNumber
            value={codigoSeguridad}
            onValueChange={(e: InputNumberValueChangeEvent) =>
              setCodigoSeguridad(e.value ?? 0)
            }
            placeholder="Código CVV"
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            label="Limpiar"
            icon="pi pi-filter-slash"
            severity="secondary"
            onClick={clear}
          />
          <Button
            label="Registrar reserva"
            icon="pi pi-check"
            onClick={handleSubmit}
            style={{
              backgroundColor: "#22C55E",
              borderColor: "#22C55E",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GuestForm;
