import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
    ) {
    try {
        // 👇 ahora esperamos los params
        const { id } = await context.params;
        const insumoId = Number(id);

        if (isNaN(insumoId)) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        const body = await req.json();
        const nombre = (body?.nombre_insumo ?? "").trim();
        const idCategoria = Number(body?.id_categoria);
        const activo = Boolean(body?.activo);
        const descripcion = body?.descripcion_insumo ?? null;

        if (!nombre) {
        return NextResponse.json(
            { error: "El nombre es obligatorio." },
            { status: 400 }
        );
        }
        if (!idCategoria || Number.isNaN(idCategoria)) {
        return NextResponse.json(
            { error: "id_categoria inválido." },
            { status: 400 }
        );
        }

        const actualizado = await prisma.insumo.update({
        where: { id_insumo: insumoId },
        data: {
            nombre_insumo: nombre,
            descripcion_insumo: descripcion,
            id_categoria: idCategoria,
            activo,
        },
        include: {
            categoria: true,
            stock_depositos: { include: { deposito: true } },
        },
        });

        return NextResponse.json({
        id: actualizado.id_insumo,
        nombre: actualizado.nombre_insumo,
        descripcion: actualizado.descripcion_insumo,
        categoria: actualizado.categoria?.nombre_categoria || "Sin categoría",
        id_categoria: actualizado.id_categoria, // 👈 importante: devolvemos también el id real
        stock: actualizado.stock_depositos?.[0]?.cantidad_actual ?? 0,
        deposito:
            actualizado.stock_depositos?.[0]?.deposito?.nombre_deposito ??
            "Sin depósito",
        estado: actualizado.activo,
        fechaAlta:
            actualizado.fecha_creacion?.toISOString().split("T")[0] || null,
        ultimaActualizacion:
            actualizado.fecha_actualizacion?.toISOString().split("T")[0] || null,
        });
    } catch (error) {
        console.error("❌ Error al actualizar insumo:", error);
        return NextResponse.json(
        { error: "Error al actualizar insumo" },
        { status: 500 }
        );
    }
}
