import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id_insumo: string; id_deposito: string }> }
) {
  try {
    const { id_insumo, id_deposito } = await params;

    const stock = await prisma.stock_deposito.findUnique({
      where: {
        id_deposito_id_insumo: {
          id_deposito: parseInt(id_deposito),
          id_insumo: parseInt(id_insumo),
        },
      },
      select: {
        cantidad_actual: true,
        stock_minimo: true,
        stock_critico: true,
        stock_maximo: true,
      },
    });

    return NextResponse.json(stock || {});
  } catch (error) {
    console.error("❌ Error al obtener stock:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
