import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const proveedores = await prisma.proveedor.findMany({
      where: { activo: true },
      select: {
        id_proveedor: true,
        nombre_proveedor: true,
      },
    });
    return NextResponse.json(proveedores);
  } catch (error) {
    console.error("❌ Error al obtener proveedores:", error);
    return NextResponse.json(
      { error: "Error al obtener proveedores" },
      { status: 500 }
    );
  }
}
