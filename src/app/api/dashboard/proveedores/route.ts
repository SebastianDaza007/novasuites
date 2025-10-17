import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper: devuelve "ENE-2025"
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

    // =====================================================
    // 🧾 Proveedores activos / inactivos
    // =====================================================
    const proveedoresActivos = await prisma.proveedor.count({ where: { activo: true } });
    const proveedoresInactivos = await prisma.proveedor.count({ where: { activo: false } });

    // =====================================================
    // 🛒 Órdenes de compra por proveedor
    // =====================================================
    const ordenesPorProveedor = await prisma.orden_compra.groupBy({
      by: ["id_proveedor"],
      _count: { _all: true },
      where: { fecha_orden: { gte: desde, lte: hasta } },
    });

    const proveedores = await prisma.proveedor.findMany({
      where: {
        id_proveedor: { in: ordenesPorProveedor.map((o) => o.id_proveedor) },
      },
      select: { id_proveedor: true, nombre_proveedor: true },
    });

    const ordenesConNombres = ordenesPorProveedor.map((o) => ({
      proveedor:
        proveedores.find((p) => p.id_proveedor === o.id_proveedor)?.nombre_proveedor ||
        "Desconocido",
      cantidad: o._count._all,
    }));

    // =====================================================
    // 💰 Pagos mensuales
    // =====================================================
    const facturasProveedor = await prisma.factura_proveedor.findMany({
      where: { fecha_emision: { gte: desde, lte: hasta } },
      select: {
        fecha_emision: true,
        estado_factura: true,
        detalle_factura_proveedor: { select: { cantidad: true, precio: true } },
      },
    });

    // Calcular montos pagados y pendientes por mes
    const pagosMensualesMap = new Map<string, { pagado: number; pendiente: number }>();

    for (const f of facturasProveedor) {
      const key = getMonthLabel(f.fecha_emision);
      const total = f.detalle_factura_proveedor.reduce(
        (sum, d) => sum + Number(d.precio) * d.cantidad,
        0
      );

      const actual = pagosMensualesMap.get(key) || { pagado: 0, pendiente: 0 };

      if (f.estado_factura === "PAGADA") actual.pagado += total;
      else if (f.estado_factura === "PENDIENTE") actual.pendiente += total;

      pagosMensualesMap.set(key, actual);
    }

    // =====================================================
    // 📆 Completar meses faltantes dentro del rango
    // =====================================================
    const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    const mesesCompletos: string[] = [];

    const temp = new Date(desde);
    while (temp <= hasta) {
      mesesCompletos.push(getMonthLabel(temp));
      temp.setMonth(temp.getMonth() + 1);
    }

    const pagosMensuales = mesesCompletos.map((mes) => ({
      mes,
      pagado: pagosMensualesMap.get(mes)?.pagado || 0,
      pendiente: pagosMensualesMap.get(mes)?.pendiente || 0,
    }));

    // =====================================================
    // 🧾 Facturas proveedor por estado
    // =====================================================
    const facturasPorEstado = facturasProveedor.reduce<Record<string, number>>(
      (acc, f) => {
        acc[f.estado_factura] = (acc[f.estado_factura] || 0) + 1;
        return acc;
      },
      {}
    );

    // =====================================================
    // 📤 Respuesta final
    // =====================================================
    return NextResponse.json({
      rango: { desde, hasta },
      proveedores: { activos: proveedoresActivos, inactivos: proveedoresInactivos },
      ordenesPorProveedor: ordenesConNombres,
      pagosMensuales,
      facturasPorEstado,
    });
  } catch (error) {
    console.error("❌ Error generando dashboard de proveedores:", error);
    return NextResponse.json(
      { error: "Error generando dashboard de proveedores" },
      { status: 500 }
    );
  }
}
