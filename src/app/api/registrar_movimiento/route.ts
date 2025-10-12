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
      orden_compra, // 👈 número de orden de compra (string opcional)
    } = data;

    // 🔎 Validar si se envió orden de compra
    let id_orden_compra: number | null = null;

    if (orden_compra) {
      const orden = await prisma.orden_compra.findUnique({
        where: { numero_orden: orden_compra },
      });

      if (!orden) {
        return new Response(
          JSON.stringify({ error: "Orden de compra no encontrada" }),
          { status: 400 }
        );
      }

      id_orden_compra = orden.id_orden_compra;
    }

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
        id_orden_compra, // 👈 se guarda si existe
        detalles: {
          create: detalles.map((d: any) => ({
            id_insumo: d.id_insumo,
            cantidad: d.cantidad,
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
              ? { set: d.cantidad }
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
