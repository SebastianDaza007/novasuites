"use client";

import { useState } from "react";
import OCDialog from "@/components/orden_compra/modal_registrar_oc";
import Button from "@/components/common/button";

export default function OC_page() {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Button label="Mostrar" icon="pi pi-external-link" onClick={() => setVisible(true)} />
      <OCDialog visible={visible} onHide={() => setVisible(false)} />
    </div>
  );
}
