import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📅 Helper para obtener mes abreviado
function getMonthLabel(date: Date): string {
  return date.toLocaleString("es-ES", { month: "short" }).toUpperCase();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const desdeParam = searchParams.get("desde");
    const hastaParam = searchParams.get("hasta");

    const hoy = new Date();
    const desde = desdeParam
      ? new Date(desdeParam)
      : new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const hasta = hastaParam
      ? new Date(hastaParam)
      : new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    // ==========================
    // 🏢 STOCK ACTUAL POR DEPÓSITO
    // ==========================
    const stockPorDeposito = await prisma.stock_deposito.findMany({
      include: { deposito: true },
    });

    const stockAgrupado = stockPorDeposito.reduce<Record<string, number>>(
      (acc, item) => {
        const nombre = item.deposito.nombre_deposito;
        acc[nombre] = (acc[nombre] || 0) + item.cantidad_actual;
        return acc;
      },
      {}
    );

    // ==========================
    // 📦 INSUMOS POR TIPO / CATEGORÍA
    // ==========================
    const insumosPorCategoria = await prisma.insumo.groupBy({
      by: ["id_categoria"],
      _count: { _all: true },
    });

    const categorias = await prisma.categoria.findMany({
      where: { id_categoria: { in: insumosPorCategoria.map((i) => i.id_categoria) } },
    });

    const insumosPorTipo = insumosPorCategoria.map((c) => {
      const categoria = categorias.find((cat) => cat.id_categoria === c.id_categoria);
      return {
        tipo: categoria?.nombre_categoria ?? "Sin categoría",
        cantidad: c._count._all,
      };
    });

    // ==========================
    // ⚠️ INSUMOS BAJO STOCK CRÍTICO O MÍNIMO
    // ==========================
    const insumosCriticos = await prisma.stock_deposito.findMany({
      where: {
        OR: [
          { cantidad_actual: { lt: prisma.stock_deposito.fields.stock_minimo } },
          { cantidad_actual: { lt: prisma.stock_deposito.fields.stock_critico } },
        ],
      },
      include: { insumo: true, deposito: true },
    });

    // ==========================
    // 📊 COMPARATIVA DE STOCK (mes actual vs mes anterior)
    // ==========================
    const mesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);

    const movimientos = await prisma.movimiento_inventario.findMany({
      where: {
        fecha_movimiento: { gte: mesAnterior, lte: hasta },
      },
      include: { detalles: true },
    });

    const comparativaStock: Record<string, { actual: number; anterior: number }> = {};

    for (const m of movimientos) {
      for (const d of m.detalles) {
        const key = `INS-${d.id_insumo}`;
        const cantidad = d.cantidad;
        const mes = getMonthLabel(new Date(m.fecha_movimiento!));

        if (!comparativaStock[key]) comparativaStock[key] = { actual: 0, anterior: 0 };

        if (mes === getMonthLabel(mesActual)) comparativaStock[key].actual += cantidad;
        if (mes === getMonthLabel(mesAnterior)) comparativaStock[key].anterior += cantidad;
      }
    }

    // ==========================
    // ✅ RESPUESTA
    // ==========================
    return NextResponse.json({
      rango: { desde, hasta },
      stockPorDeposito,
      stockAgrupado,
      insumosPorTipo,
      insumosCriticos,
      comparativaStock,
    });
  } catch (error) {
    console.error("❌ Error generando dashboard de insumos:", error);
    return NextResponse.json(
      { error: "Error al generar el dashboard de insumos" },
      { status: 500 }
    );
  }
}
