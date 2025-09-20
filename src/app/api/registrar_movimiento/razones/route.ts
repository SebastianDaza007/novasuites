import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const razones = await prisma.razon_movimiento.findMany({
      select: {
        id_razon: true,
        nombre_razon: true,
        tipo_movimiento: true,
      },
    });

    return NextResponse.json(razones);
  } catch (error) {
    console.error("❌ Error al obtener razones:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
