import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const depositos = await prisma.deposito.findMany({
      where: { activo: true },
      select: {
        id_deposito: true,
        nombre_deposito: true,
      },
    });

    return NextResponse.json(depositos);
  } catch (error) {
    console.error("❌ Error al obtener depósitos:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
