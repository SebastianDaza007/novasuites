import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

type Order = {
  id_orden_compra: number;
  numero_orden: string;
  fecha_orden: string; // ISO string
  fecha_entrega_estimada: string; // ISO string
  proveedor: {
    id: number;
    nombre: string;
    cuit: string;
  };
  usuario_solicita: {
    id: number;
    nombre: string;
  };
  condicionPago?: string;
  estado_orden: string;
};

type Detalle = {
  id_detalle: number;
  nombre_insumo: string;
  cantidad_solicitada: number;
};

type Props = {
  data: Order[];
};

export default function CustomOrdersTable({ data }: Props) {
  // Colores de estado
  const estadoColors: Record<string, "info" | "success" | "warning" | "danger"> = {
    PENDIENTE: "info",
    APROBADA: "success",
    RECIBIDA: "warning",
    CANCELADA: "danger",
  };

  const estadoTemplate = (row: Order) => {
    const severity = estadoColors[row.estado_orden] || "info";
    return <Tag value={row.estado_orden} severity={severity} />;
  };

  const proveedorTemplate = (row: Order) => row.proveedor?.nombre || "—";
  const usuarioTemplate = (row: Order) => row.usuario_solicita?.nombre || "—";

  const dateTemplate = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Estado para el modal y detalle de orden
  const [visibleModal, setVisibleModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detalles, setDetalles] = useState<Detalle[]>([]);

  // Cuando se abre el modal, traemos los detalles
  useEffect(() => {
    if (!visibleModal || !selectedOrder) return;

    const fetchDetalles = async () => {
      try {
        const res = await fetch(`/api/orden_compra/detalle_oc/${selectedOrder.id_orden_compra}`);
        if (!res.ok) throw new Error("Error al traer detalles");
        const data = await res.json();
        setDetalles(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDetalles();
  }, [visibleModal, selectedOrder]);

  const accionesTemplate = (row: Order) => (
    <Button
      icon="pi pi-eye"
      className="p-button-text p-button-rounded"
      onClick={() => {
        setSelectedOrder(row);
        setVisibleModal(true);
      }}
    />
  );

  return (
    <div className="card">
      <DataTable
        value={data}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10]}
        tableStyle={{ minWidth: "70rem" }}
      >
        <Column field="numero_orden" header="Nro Orden de Compra" sortable />
        <Column
          field="fecha_orden"
          header="Fecha de emisión"
          body={(row) => dateTemplate(row.fecha_orden)}
          sortable
        />
        <Column
          field="fecha_entrega_estimada"
          header="Entrega estimada"
          body={(row) => dateTemplate(row.fecha_entrega_estimada)}
          sortable
        />
        <Column header="Proveedor" body={proveedorTemplate} />
        <Column header="Responsable de emisión" body={usuarioTemplate} />
        <Column
          field="estado_orden"
          header="Estado"
          body={estadoTemplate}
          style={{ textAlign: "center", width: "10rem" }}
        />
        <Column
          header="Detalles"
          body={accionesTemplate}
          style={{ textAlign: "center", width: "6rem" }}
        />
      </DataTable>

      {/* Modal con detalle de la orden */}
      <Dialog
        header={`Detalles de la Orden ${selectedOrder?.numero_orden || ""}`}
        visible={visibleModal}
        style={{ width: "50vw" }}
        onHide={() => setVisibleModal(false)}
      >
        <DataTable value={detalles} paginator rows={10}>
          <Column field="nombre_insumo" header="Insumo" />
          <Column field="cantidad_solicitada" header="Cantidad solicitada" />
        </DataTable>
      </Dialog>
    </div>
  );
}
