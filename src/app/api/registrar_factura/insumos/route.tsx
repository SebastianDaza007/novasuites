import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const insumos = await prisma.insumo.findMany({
      where: { activo: true },
      select: {
        id_insumo: true,
        nombre_insumo: true,
      },
    });
    return NextResponse.json(insumos);
  } catch (error) {
    console.error("❌ Error al obtener insumos:", error);
    return NextResponse.json(
      { error: "Error al obtener insumos" },
      { status: 500 }
    );
  }
}
