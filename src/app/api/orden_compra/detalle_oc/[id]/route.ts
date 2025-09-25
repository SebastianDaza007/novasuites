// app/api/orden_compra/detalle_oc/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Obtenemos la URL completa
    const url = new URL(request.url);
    // Extraemos el último segmento como id
    const idOrden = parseInt(url.pathname.split("/").pop() || "0");

    if (!idOrden) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const detalles = await prisma.detalle_orden_compra.findMany({
      where: { id_orden_compra: idOrden },
      include: { insumo: true },
    });

    const data = detalles.map((d) => ({
      id_detalle: d.id_detalle_orden,
      cantidad_solicitada: d.cantidad_solicitada,
      nombre_insumo: d.insumo.nombre_insumo,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al traer detalle:", error);
    return NextResponse.json({ error: "Error al obtener detalle" }, { status: 500 });
  }
}
