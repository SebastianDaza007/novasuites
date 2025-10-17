import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📅 Helpers
function getMonthLabel(date: Date): string {
  // Abreviaciones consistentes (ENE, FEB, MAR...)
  const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  return MONTHS[date.getMonth()];
}

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
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
    // 🏨 OCUPACIÓN ACTUAL
    // =============================================
    const totalHabitaciones = await prisma.habitaciones.count();
    const ocupadasHoy = await prisma.habitaciones.count({
      where: { estado: "OCUPADA" },
    });

    const ocupacion = {
      OCUPADA: ocupadasHoy,
      DISPONIBLE: totalHabitaciones - ocupadasHoy,
    };

    // =============================================
    // 🧹 HOUSEKEEPING
    // =============================================
    const tareas = await prisma.housekeeping.findMany({
      where: { fecha: { gte: desde, lte: hasta } },
      select: { estado: true },
    });

    const housekeeping = tareas.reduce<Record<string, number>>((acc, t) => {
      acc[t.estado] = (acc[t.estado] || 0) + 1;
      return acc;
    }, {});

    // =============================================
    // 📆 OCUPACIÓN MENSUAL
    // =============================================
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

    // =============================================
    // 🩵 COMPLETAR MESES SIN DATOS
    // =============================================
    const mesesCompletos: { mes: string; porcentaje: number }[] = [];
    const fechaTmp = new Date(desde);

    const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

    while (fechaTmp <= hasta) {
      const mesAbrev = MONTHS[fechaTmp.getMonth()];
      const existente = ocupacionMensual.find((m) => m.mes === mesAbrev);
      mesesCompletos.push(existente || { mes: mesAbrev, porcentaje: 0 });
      fechaTmp.setMonth(fechaTmp.getMonth() + 1);
    }

    // =============================================
    // 🧾 ESTADO DE RESERVAS
    // =============================================
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

    // =============================================
    // 📦 RESPUESTA FINAL
    // =============================================
    return NextResponse.json({
      rango: { desde, hasta },
      ocupacion,
      housekeeping,
      ocupacionMensual: mesesCompletos,
      estadoReservas,
    });
  } catch (error) {
    console.error("❌ Error generando datos operativos:", error);
    return NextResponse.json(
      { error: "Error al generar datos operativos" },
      { status: 500 }
    );
  }
}
