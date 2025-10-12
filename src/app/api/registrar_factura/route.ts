import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // 👈 para detectar errores de Prisma

interface InsumoInput {
  id_insumo: number;
  cantidad: number;
  precio: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      proveedor,
      numeroFactura,
      tipoFactura,
      ordenCompra,
      fechaVencimiento,
      estadoFactura,
      observaciones,
      insumos,
    } = body;

    if (!proveedor || !numeroFactura || !tipoFactura || !fechaVencimiento || !insumos?.length) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const factura = await prisma.factura_proveedor.create({
      data: {
        numero_factura: numeroFactura,
        tipo: tipoFactura,
        fecha_emision: new Date(),
        fecha_vencimiento: new Date(fechaVencimiento),
        estado_factura: estadoFactura || "PENDIENTE",
        observaciones: observaciones || null,
        id_proveedor: proveedor,
        id_orden_compra: ordenCompra || null,
        detalle_factura_proveedor: {
          create: (insumos as InsumoInput[]).map((i) => ({
            id_insumo: i.id_insumo,
            cantidad: i.cantidad,
            precio: i.precio,
          })),
        },
      },
      include: { detalle_factura_proveedor: true },
    });

    return NextResponse.json(factura, { status: 201 });
  } catch (error) {
    // 👇 Manejo específico para facturas duplicadas
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "El número de factura ya existe" },
        { status: 400 }
      );
    }

    console.error("❌ Error al registrar factura:", error);
    return NextResponse.json(
      { error: "Error interno al registrar factura" },
      { status: 500 }
    );
  }
}
