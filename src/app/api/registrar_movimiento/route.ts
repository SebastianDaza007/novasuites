import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("📦 Payload recibido:", data);

    const {
      id_usuario,
      id_deposito,
      id_razon_movimiento,
      numero_comprobante,
      observaciones,
      detalles,
    } = data;

    // Traer la razón para saber qué tipo de movimiento es
    const razon = await prisma.razon_movimiento.findUnique({
      where: { id_razon: id_razon_movimiento },
      select: { tipo_movimiento: true },
    });

    if (!razon) {
      return new Response(
        JSON.stringify({ error: "Razón de movimiento no encontrada" }),
        { status: 400 }
      );
    }

    // Crear cabecera del movimiento
    const movimiento = await prisma.movimiento_inventario.create({
      data: {
        id_usuario,
        id_deposito,
        id_razon_movimiento,
        numero_comprobante,
        observaciones,
        detalles: {
          create: detalles.map((d: any) => ({
            id_insumo: d.id_insumo,
            cantidad: d.cantidad,
            costo_unitario: null,
            lote: d.lote,
            fecha_vencimiento: d.vencimiento ? new Date(d.vencimiento) : null,
          })),
        },
      },
      include: { detalles: true },
    });

    // Actualizar stock por cada detalle
    for (const d of detalles) {
      await prisma.stock_deposito.upsert({
        where: {
          id_deposito_id_insumo: {
            id_deposito,
            id_insumo: d.id_insumo,
          },
        },
        update: {
          cantidad_actual:
            razon.tipo_movimiento === "ALTA" ||
            razon.tipo_movimiento === "TRANSFERENCIA_ENTRADA"
              ? { increment: d.cantidad }
              : razon.tipo_movimiento === "BAJA" ||
                razon.tipo_movimiento === "TRANSFERENCIA_SALIDA"
              ? { decrement: d.cantidad }
              : razon.tipo_movimiento === "AJUSTE"
              ? { set: d.cantidad } // 👈 en ajuste se sobrescribe el valor
              : undefined,
          stock_minimo: d.stockMinimo ?? undefined,
          stock_critico: d.stockCritico ?? undefined,
          fecha_ultimo_mov: new Date(),
        },
        create: {
          id_deposito,
          id_insumo: d.id_insumo,
          cantidad_actual:
            razon.tipo_movimiento === "ALTA" ||
            razon.tipo_movimiento === "TRANSFERENCIA_ENTRADA"
              ? d.cantidad
              : razon.tipo_movimiento === "BAJA" ||
                razon.tipo_movimiento === "TRANSFERENCIA_SALIDA"
              ? -d.cantidad
              : razon.tipo_movimiento === "AJUSTE"
              ? d.cantidad
              : 0,
          stock_minimo: d.stockMinimo ?? 0,
          stock_critico: d.stockCritico ?? 0,
          stock_maximo: d.stockMaximo ?? 0,
          fecha_ultimo_mov: new Date(),
        },
      });
    }

    return new Response(JSON.stringify(movimiento), { status: 201 });
  } catch (err) {
    console.error("❌ Error al registrar movimiento:", err);
    return new Response(
      JSON.stringify({ error: "Error registrando movimiento" }),
      { status: 500 }
    );
  }
}
