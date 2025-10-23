import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📅 Helpers
function getMonthLabel(date: Date): string {
  const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  return `${MONTHS[date.getMonth()]}-${date.getFullYear()}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const desdeParam = searchParams.get("desde");
    const hastaParam = searchParams.get("hasta");

    const hoy = new Date();
    const desde = desdeParam
      ? new Date(desdeParam)
      : new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);
    const hasta = hastaParam
      ? new Date(hastaParam)
      : new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    // =============================================
    // 💵 INGRESOS MENSUALES (SIN CAMBIOS)
    // =============================================
    const facturasVentas = await prisma.facturas_ventas.findMany({
      where: { fecha_emision: { gte: desde, lte: hasta } },
      select: { fecha_emision: true, monto_total: true },
    });

    const ingresosMap = new Map<string, number>();
    for (const f of facturasVentas) {
      const key = getMonthLabel(f.fecha_emision);
      ingresosMap.set(key, (ingresosMap.get(key) || 0) + Number(f.monto_total));
    }

    // =============================================
    // 💸 EGRESOS MENSUALES (AHORA POR ÓRDENES DE PAGO)
    // =============================================
    const ordenesPago = await prisma.ordenes_pago.findMany({
      where: { fecha: { gte: desde, lte: hasta } },
      select: { fecha: true, total: true },
    });

    const egresosMap = new Map<string, number>();
    for (const op of ordenesPago) {
      const key = getMonthLabel(op.fecha);
      egresosMap.set(key, (egresosMap.get(key) || 0) + Number(op.total));
    }

    // =============================================
    // 📆 COMPLETAR MESES SIN DATOS
    // =============================================
    const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    const mesesCompletos: string[] = [];

    const temp = new Date(desde);
    while (temp <= hasta) {
      mesesCompletos.push(getMonthLabel(temp));
      temp.setMonth(temp.getMonth() + 1);
    }

    const ingresosMensuales = mesesCompletos.map((mes) => ({
      mes,
      monto: ingresosMap.get(mes) || 0,
    }));

    const egresosMensuales = mesesCompletos.map((mes) => ({
      mes,
      monto: egresosMap.get(mes) || 0,
    }));

    // =============================================
    // 📊 BALANCE (ingresos - egresos por órdenes de pago)
    // =============================================
    const balance = mesesCompletos.map((mes) => {
      const ingreso = ingresosMap.get(mes) || 0;
      const egreso = egresosMap.get(mes) || 0;
      return { mes, ingresos: ingreso, egresos: egreso, balance: ingreso - egreso };
    });

    // =============================================
    // 🧾 FACTURAS PROVEEDOR POR ESTADO (SIN CAMBIOS)
    //   *Solo para el widget de estados; NO se usa para egresos*
    // =============================================
    const facturasProveedorEstados = await prisma.factura_proveedor.findMany({
      where: { fecha_emision: { gte: desde, lte: hasta } },
      select: { estado_factura: true },
    });

    const facturasProveedorPorEstado = facturasProveedorEstados.reduce<Record<string, number>>(
      (acc, f) => {
        acc[f.estado_factura] = (acc[f.estado_factura] || 0) + 1;
        return acc;
      },
      {}
    );

    // =============================================
    // 💳 RANKING MÉTODOS DE PAGO (SIN CAMBIOS)
    // =============================================
    const rankingMetodos = await prisma.reservas.groupBy({
      by: ["id_metodo_pago"],
      _count: { _all: true },
      where: { fecha_checkin: { gte: desde, lte: hasta } },
    });

    const metodos = await prisma.metodo_pago.findMany({
      where: { id_metodo: { in: rankingMetodos.map((r) => r.id_metodo_pago!).filter(Boolean) } },
      select: { id_metodo: true, nombre_metodo: true },
    });

    const ranking = rankingMetodos.map((r) => ({
      metodo:
        metodos.find((m) => m.id_metodo === r.id_metodo_pago)?.nombre_metodo ||
        "Desconocido",
      cantidad: r._count._all,
    }));

    // =============================================
    // 📦 RESPUESTA FINAL
    // =============================================
    return NextResponse.json({
      rango: { desde, hasta },
      ingresosMensuales,              // devengado (ventas)
      egresosMensuales,               // caja (órdenes de pago)
      balance,                        // ingresos - egresos (con órdenes de pago)
      facturasProveedorPorEstado,     // conteo por estado (informativo)
      rankingMetodos: ranking,
    });
  } catch (error) {
    console.error("❌ Error generando dashboard financieros:", error);
    return NextResponse.json(
      { error: "Error al generar dashboard financieros" },
      { status: 500 }
    );
  }
}
