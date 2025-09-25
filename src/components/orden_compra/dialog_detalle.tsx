import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

type Detalle = {
  id_detalle: number;
  cantidad_solicitada: number;
  nombre_insumo: string;
};

interface Props {
  visible: boolean;
  onHide: () => void;
  idOrden: number; // ✅ id de la orden seleccionada
}

export default function OCDetailDialog({ visible, onHide, idOrden }: Props) {
  const [detalles, setDetalles] = useState<Detalle[]>([]);

  useEffect(() => {
    if (!visible) return;

    const fetchDetalles = async () => {
      try {
        const res = await fetch(`/api/orden_compra/detalle_oc/${idOrden}`);
        if (!res.ok) throw new Error("Error al traer detalles");
        const data = await res.json();
        setDetalles(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDetalles();
  }, [visible, idOrden]);

  return (
    <Dialog header="Detalle de Orden" visible={visible} onHide={onHide} style={{ width: "50vw" }}>
      <DataTable value={detalles} paginator rows={10}>
        <Column field="nombre_insumo" header="Insumo" />
        <Column field="cantidad_solicitada" header="Cantidad solicitada" />
      </DataTable>
    </Dialog>
  );
}
