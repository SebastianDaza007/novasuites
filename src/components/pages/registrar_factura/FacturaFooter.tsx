"use client";

import { Button } from "primereact/button";

interface FacturaFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export default function FacturaFooter({ onCancel, onSubmit }: FacturaFooterProps) {
  return (
    <div className="flex justify-end gap-3 mt-6">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-danger"
        onClick={onCancel}
      />
      <Button
        label="Registrar"
        icon="pi pi-check"
        className="p-button-success"
        onClick={onSubmit}
      />
    </div>
  );
}
