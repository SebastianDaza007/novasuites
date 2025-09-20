import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
