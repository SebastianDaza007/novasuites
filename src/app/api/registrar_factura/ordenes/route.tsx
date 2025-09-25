import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const proveedorId = searchParams.get("proveedor");

  try {
    const ordenes = await prisma.orden_compra.findMany({
      where: {
        id_proveedor: proveedorId ? Number(proveedorId) : undefined,
      },
      select: {
        id_orden_compra: true,
        numero_orden: true,
      },
    });
    return NextResponse.json(ordenes);
  } catch (error) {
    console.error("❌ Error al obtener órdenes:", error);
    return NextResponse.json(
      { error: "Error al obtener órdenes" },
      { status: 500 }
    );
  }
}
