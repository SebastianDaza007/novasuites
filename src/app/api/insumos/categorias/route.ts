// app/api/categorias/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Prisma client
const prisma = new PrismaClient();

// GET /api/categorias → lista todas las categorías activas
export async function GET() {
    try {
        const categorias = await prisma.categoria.findMany({
        where: { activo: true }, // solo categorías activas
        orderBy: { nombre_categoria: "asc" }, // orden alfabético
        });

        // Transformamos para simplificar en el front
        const data = categorias.map((c) => ({
        id: c.id_categoria,
        name: c.nombre_categoria,
        descripcion: c.descripcion_categoria,
        }));

        return NextResponse.json(data);
    } catch (error) {
        console.error("❌ Error al traer categorías:", error);
        return NextResponse.json(
        { error: "Error al traer categorías" },
        { status: 500 }
        );
    }
}
