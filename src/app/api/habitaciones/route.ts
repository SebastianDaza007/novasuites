import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🏨 GET /api/habitaciones
// Devuelve habitaciones con estado DISPONIBLE
export async function GET() {
    try {
        const habitaciones = await prisma.habitaciones.findMany({
        where: {
            estado: "DISPONIBLE",
        },
        select: {
            id_habitaciones: true,
            numero: true,
            tipo: true,
            capacidad: true,
            precio_base: true,
            estado: true,
        },
        orderBy: { numero: "asc" },
        });

        // ✅ Forzamos precio_base a número (previene concatenaciones)
        const habitacionesNumericas = habitaciones.map((h) => ({
        ...h,
        precio_base: Number(h.precio_base),
        }));

        return NextResponse.json(habitacionesNumericas, { status: 200 });
    } catch (error) {
        console.error("❌ Error al obtener habitaciones:", error);
        return NextResponse.json(
        { error: "Error al obtener las habitaciones" },
        { status: 500 }
        );
    }
}
