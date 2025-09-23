"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import FacturaForm from "@/components/pages/registrar_factura/FacturaForm";

export default function FacturasPage() {
  const [visible, setVisible] = useState(false);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Registrar Factura</h1>

      <Button
        label="Nueva factura"
        icon="pi pi-plus"
        className="p-button-primary"
        onClick={() => setVisible(true)}
      />

      {/* Modal */}
      <FacturaForm visible={visible} onHide={() => setVisible(false)} />
    </div>
  );
}
