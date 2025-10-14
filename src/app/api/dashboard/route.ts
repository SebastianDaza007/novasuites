import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📅 Helper para obtener etiqueta de mes (Ene, Feb, Mar…)
function getMonthLabel(date: Date): string {
  return date.toLocaleString("es-ES", { month: "short" }).toUpperCase();
}

// 📅 Helper para saber cuántos días tiene un mes
function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

export async function GET(req: Request) {
  try {
    // ========= ⚙️ PARÁMETROS DE FECHA =========
    const { searchParams } = new URL(req.url);
    const desdeParam = searchParams.get("desde");
    const hastaParam = searchParams.get("hasta");

    // Si no se envían, se toman los últimos 6 meses como rango por defecto
    const hoy = new Date();
    const desde = desdeParam
      ? new Date(desdeParam)
      : new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);
    const hasta = hastaParam
      ? new Date(hastaParam)
      : new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    // ========= 🏨 OPERATIVOS =========

    // 🔹 Ocupación actual (según estado real de habitaciones)
    const totalHabitaciones = await prisma.habitaciones.count();
    const ocupadasHoy = await prisma.habitaciones.count({
      where: { estado: "OCUPADA" },
    });

    const ocupacion = {
      OCUPADA: ocupadasHoy,
      DISPONIBLE: totalHabitaciones - ocupadasHoy,
    };

    // 🔹 Housekeeping (tareas por estado, dentro del rango)
    const tareas = await prisma.housekeeping.findMany({
      where: { fecha: { gte: desde, lte: hasta } },
      select: { estado: true },
    });

    const housekeeping = tareas.reduce<Record<string, number>>((acc, t) => {
      acc[t.estado] = (acc[t.estado] || 0) + 1;
      return acc;
    }, {});

    // 🔹 Ocupación mensual (real, dentro del rango)
    const reservas = await prisma.reservas.findMany({
      where: {
        OR: [
          { fecha_checkin: { gte: desde, lte: hasta } },
          { fecha_checkout: { gte: desde, lte: hasta } },
        ],
      },
      select: {
        fecha_checkin: true,
        fecha_checkout: true,
        reservas_habitaciones: { select: { id_habitacion: true } },
      },
    });

    const ocupacionMensualMap = new Map<string, number>();

    for (const r of reservas) {
      const checkin = new Date(r.fecha_checkin);
      const checkout = new Date(r.fecha_checkout);
      const habitacionesUsadas = r.reservas_habitaciones.length || 1;

      const current = new Date(checkin);
      while (current < checkout) {
        if (current >= desde && current <= hasta) {
          const mes = getMonthLabel(current);
          const key = `${mes}-${current.getFullYear()}`;
          ocupacionMensualMap.set(
            key,
            (ocupacionMensualMap.get(key) || 0) + habitacionesUsadas
          );
        }
        current.setDate(current.getDate() + 1);
      }
    }

    const ocupacionMensual: { mes: string; porcentaje: number }[] = [];
    for (const [key, nochesOcupadas] of ocupacionMensualMap.entries()) {
      const [mesAbrev, yearStr] = key.split("-");
      const year = parseInt(yearStr);
      const monthIndex = new Date(`${mesAbrev} 1, ${year}`).getMonth() + 1;
      const diasMes = daysInMonth(monthIndex, year);
      const capacidadMes = totalHabitaciones * diasMes;
      const porcentaje = Number(((nochesOcupadas / capacidadMes) * 100).toFixed(1));
      ocupacionMensual.push({ mes: mesAbrev, porcentaje });
    }

    // ========= 💰 FINANCIEROS =========

    const facturasVentas = await prisma.facturas_ventas.findMany({
      where: { fecha_emision: { gte: desde, lte: hasta } },
      select: { fecha_emision: true, monto_total: true },
    });

    const facturasProveedor = await prisma.factura_proveedor.findMany({
      where: { fecha_emision: { gte: desde, lte: hasta } },
      select: {
        fecha_emision: true,
        estado_factura: true,
        detalle_factura_proveedor: {
          select: { cantidad: true, precio: true },
        },
      },
    });

    // Ingresos mensuales
    const ingresosMensualesMap = new Map<string, number>();
    for (const f of facturasVentas) {
      const mes = getMonthLabel(f.fecha_emision);
      ingresosMensualesMap.set(
        mes,
        (ingresosMensualesMap.get(mes) || 0) + Number(f.monto_total)
      );
    }
    const ingresosMensuales = Array.from(ingresosMensualesMap, ([mes, monto]) => ({
      mes,
      monto,
    }));

    // Egresos mensuales
    const egresosMensualesMap = new Map<string, number>();
    for (const f of facturasProveedor) {
      const mes = getMonthLabel(f.fecha_emision);
      const totalFactura = f.detalle_factura_proveedor.reduce(
        (sum, d) => sum + Number(d.precio) * d.cantidad,
        0
      );
      egresosMensualesMap.set(
        mes,
        (egresosMensualesMap.get(mes) || 0) + totalFactura
      );
    }
    const egresosMensuales = Array.from(egresosMensualesMap, ([mes, monto]) => ({
      mes,
      monto,
    }));

    // Balance mensual combinado
    const todosLosMeses = Array.from(
      new Set([
        ...ingresosMensuales.map((i) => i.mes),
        ...egresosMensuales.map((e) => e.mes),
      ])
    );
    const balance = todosLosMeses.map((mes) => {
      const ingreso = ingresosMensuales.find((i) => i.mes === mes)?.monto || 0;
      const egreso = egresosMensuales.find((e) => e.mes === mes)?.monto || 0;
      return { mes, ingresos: ingreso, egresos: egreso, balance: ingreso - egreso };
    });

    // Facturas proveedor por estado
    const facturasProveedorPorEstado = facturasProveedor.reduce<
      Record<string, number>
    >((acc, f) => {
      acc[f.estado_factura] = (acc[f.estado_factura] || 0) + 1;
      return acc;
    }, {});

    // ========= 👥 CLIENTES =========

    const huespedes = await prisma.huespedes.findMany({
      include: {
        reservas: {
          where: {
            OR: [
              { fecha_checkin: { gte: desde, lte: hasta } },
              { fecha_checkout: { gte: desde, lte: hasta } },
            ],
          },
        },
      },
    });

    const huespedesFrecuentes = huespedes
      .map((h) => ({
        nombre: `${h.nombre} ${h.apellido}`,
        reservas: h.reservas.length,
      }))
      .sort((a, b) => b.reservas - a.reservas)
      .slice(0, 5);

    const totalDias = reservas.reduce((acc, r) => {
      const dias =
        (r.fecha_checkout.getTime() - r.fecha_checkin.getTime()) /
        (1000 * 60 * 60 * 24);
      return acc + dias;
    }, 0);
    const promedioEstadia = reservas.length
      ? Number((totalDias / reservas.length).toFixed(1))
      : 0;

    const estadoReservas = await prisma.reservas.groupBy({
      by: ["estado"],
      _count: { _all: true },
      where: {
        OR: [
          { fecha_checkin: { gte: desde, lte: hasta } },
          { fecha_checkout: { gte: desde, lte: hasta } },
        ],
      },
    });

    // ========= 📦 RESPUESTA FINAL =========
    return NextResponse.json({
      rango: { desde, hasta },
      operativos: { ocupacion, ocupacionMensual, housekeeping },
      financieros: {
        ingresosMensuales,
        egresosMensuales,
        balance,
        facturasProveedor: facturasProveedorPorEstado,
      },
      clientes: {
        huespedesFrecuentes,
        promedioEstadia,
        estadoReservas,
      },
    });
  } catch (error) {
    console.error("❌ Error generando dashboard:", error);
    return NextResponse.json(
      { error: "Error al generar el dashboard" },
      { status: 500 }
    );
  }
}
