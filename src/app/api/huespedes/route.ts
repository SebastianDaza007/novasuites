import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    if (!search) {
      return NextResponse.json(
        { success: false, message: "Parametro de busqueda requerido" },
        { status: 400 }
      );
    }

    // Buscar huespedes que coincidan con el documento (parcial)
    const huespedes = await prisma.huespedes.findMany({
      where: {
        documento: {
          contains: search,
        },
      },
      select: {
        id_huespedes: true,
        nombre: true,
        apellido: true,
        documento: true,
        telefono: true,
        email: true,
      },
      take: 10, // Limitar a 10 resultados
      orderBy: {
        documento: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: huespedes,
    });
  } catch (error) {
    console.error("Error buscando huespedes:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
