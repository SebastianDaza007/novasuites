import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // tu instancia de Prisma

export async function GET() {
  try {
    // Traemos todas las órdenes con relaciones a proveedor y usuario
    const ordenes = await prisma.orden_compra.findMany({
      include: {
        proveedor: true,
        usuario_solicita: true,
        detalles: {
          include: {
            insumo: true, // trae info de cada insumo de la orden
          },
        },
      },
      orderBy: { fecha_orden: "desc" },
    });

    // Formateamos para enviar al front
    const data = ordenes.map((o) => ({
      id_orden_compra: o.id_orden_compra,
      numero_orden: o.numero_orden,
      fecha_orden: o.fecha_orden.toISOString(),
      fecha_entrega_estimada: o.fecha_entrega_estimada.toISOString(),
      estado_orden: o.estado_orden,
      proveedor: {
        id: o.proveedor.id_proveedor,
        nombre: o.proveedor.nombre_proveedor,
        cuit: o.proveedor.cuit_proveedor,
      },
      usuario_solicita: {
        id: o.usuario_solicita.id,
        nombre: o.usuario_solicita.email, // ajusta si querés mostrar otro campo
      },
      detalles: o.detalles.map((d) => ({
        id_detalle: d.id_detalle_orden,
        cantidad_solicitada: d.cantidad_solicitada,
        insumo: {
          id: d.insumo.id_insumo,
          nombre: d.insumo.nombre_insumo,
        },
      })),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching ordenes:", error);
    return NextResponse.json(
      { error: "Error al obtener órdenes de compra" },
      { status: 500 }
    );
  }
}
