import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_proveedor, id_usuario_solicita, fecha_entrega_estimada, observaciones, insumos } = body;

    // 1️⃣ Generar número de orden único (ejemplo simple con timestamp)
    const numeroOrden = `OC-${Date.now()}`;

    // 2️⃣ Crear la orden con detalles
    const orden = await prisma.orden_compra.create({
      data: {
        numero_orden: numeroOrden,
        id_proveedor,
        id_usuario_solicita,
        fecha_entrega_estimada: new Date(fecha_entrega_estimada) ,
        observaciones: observaciones || null,
        detalles: {
          create: insumos.map((i: any) => ({
            id_insumo: i.id_insumo,
            cantidad_solicitada: i.cantidad,
          })),
        },
      },
      include: {
        proveedor: true,
        detalles: {
          include: { insumo: true },
        },
      },
    });

    return NextResponse.json(orden);
  } catch (error) {
    console.error("❌ Error al crear orden:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
