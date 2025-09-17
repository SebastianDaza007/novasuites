// app/api/insumos/deposito/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 🔎 GET /api/insumos/deposito
 * Devuelve todos los depósitos activos.
 */
export async function GET() {
    try {
        const depositos = await prisma.deposito.findMany({
        where: { activo: true }, // solo depósitos activos
        orderBy: { nombre_deposito: "asc" },
        });

        // Simplificamos formato para el front
        const data = depositos.map((d) => ({
        id: d.id_deposito,
        name: d.nombre_deposito,
        }));

        return NextResponse.json(data);
    } catch (error) {
        console.error("❌ Error al traer depósitos:", error);
        return NextResponse.json(
        { error: "Error al traer depósitos" },
        { status: 500 }
        );
    }
}
