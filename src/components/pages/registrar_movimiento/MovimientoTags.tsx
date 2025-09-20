"use client";

import { Tag } from "primereact/tag";

type MovimientoTagsProps = {
  tipo: "ALTA" | "BAJA" | "TRANSFERENCIA_SALIDA" | "TRANSFERENCIA_ENTRADA" | "AJUSTE";
};

export default function MovimientoTags({ tipo }: MovimientoTagsProps) {
  const getSeverity = () => {
    switch (tipo) {
      case "ALTA":
        return "success"; // verde
      case "BAJA":
        return "danger"; // rojo
      case "TRANSFERENCIA_SALIDA":
      case "TRANSFERENCIA_ENTRADA":
        return "info"; // celeste
      case "AJUSTE":
        return "warning"; // naranja
      default:
        return "secondary"; // gris
    }
  };

  const getSigno = () => {
    switch (tipo) {
      case "ALTA":
      case "TRANSFERENCIA_ENTRADA":
        return "+ ";
      case "BAJA":
      case "TRANSFERENCIA_SALIDA":
        return "- ";
      case "AJUSTE":
      default:
        return ""; // neutro
    }
  };

  return (
    <Tag
      value={`${getSigno()}${tipo}`}
      severity={getSeverity()}
      className="px-3 py-1 text-sm font-medium rounded-md"
    />
  );
}
