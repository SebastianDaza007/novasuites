import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📅 Helper: etiqueta del mes abreviada (ENE, FEB, …)
function getMonthLabel(date: Date): string {
  return date.toLocaleString("es-ES", { month: "short" }).toUpperCase();
}

// 🗓️ Mapa de meses → índices seguros
const monthMap: Record<string, number> = {
  ENE: 0, FEB: 1, MAR: 2, ABR: 3, MAY: 4, JUN: 5,
  JUL: 6, AGO: 7, SEP: 8, OCT: 9, NOV: 10, DIC: 11,
};

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

    // ==========================
    // 🏨 TASA DE OCUPACIÓN MENSUAL (rellena meses vacíos)
    // ==========================
    const totalHabitaciones = await prisma.habitaciones.count();

    const reservas = await prisma.reservas.findMany({
      where: {
        fecha_checkin: { lte: hasta },
        fecha_checkout: { gte: desde },
      },
      select: { fecha_checkin: true, fecha_checkout: true },
    });

    const ocupacionMap = new Map<string, number>();

    for (const r of reservas) {
      const checkin = new Date(r.fecha_checkin);
      const checkout = new Date(r.fecha_checkout);

      // 🔹 Limitamos la estadía al rango visible
      const inicio = checkin < desde ? desde : checkin;
      const fin = checkout > hasta ? hasta : checkout;

      const cursor = new Date(inicio);
      while (cursor <= fin) {
        const mes = getMonthLabel(cursor);
        const key = `${mes}-${cursor.getFullYear()}`;
        ocupacionMap.set(key, (ocupacionMap.get(key) || 0) + 1);
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    // 🔹 Convertimos a porcentaje
    const ocupacionMensualTemp = Array.from(ocupacionMap.entries()).map(
      ([key, noches]) => {
        const [mesAbrev, yearStr] = key.split("-");
        const mesIndex = monthMap[mesAbrev] ?? 0;
        const year = parseInt(yearStr);
        const diasMes = new Date(year, mesIndex + 1, 0).getDate();
        const capacidad = totalHabitaciones * diasMes;
        return {
          mes: key,
          porcentaje: Number(((noches / capacidad) * 100).toFixed(1)),
        };
      }
    );

    // 🔹 Rellenar meses sin datos
    const allMonthsOcupacion: { mes: string; porcentaje: number }[] = [];
    const tempOcup = new Date(desde);
    while (tempOcup <= hasta) {
      const key = `${getMonthLabel(tempOcup)}-${tempOcup.getFullYear()}`;
      const existente = ocupacionMensualTemp.find((m) => m.mes === key);
      allMonthsOcupacion.push(existente ?? { mes: key, porcentaje: 0 });
      tempOcup.setMonth(tempOcup.getMonth() + 1);
    }

    allMonthsOcupacion.sort((a, b) => {
      const [mesA, anioA] = a.mes.split("-");
      const [mesB, anioB] = b.mes.split("-");
      return (
        parseInt(anioA) - parseInt(anioB) ||
        monthMap[mesA] - monthMap[mesB]
      );
    });

    const ocupacionMensual = allMonthsOcupacion;

    // ==========================
    // 🛏️ RESERVAS POR TIPO DE HABITACIÓN
    // ==========================
    const reservasConTipo = await prisma.reservas_habitaciones.findMany({
      where: {
        reserva: {
          fecha_checkin: { lte: hasta },
          fecha_checkout: { gte: desde },
        },
      },
      include: { habitacion: { select: { tipo: true } } },
    });

    const reservasPorCategoriaMap = new Map<string, number>();
    for (const r of reservasConTipo) {
      const tipo = r.habitacion?.tipo?.toUpperCase() ?? "SIN TIPO";
      reservasPorCategoriaMap.set(
        tipo,
        (reservasPorCategoriaMap.get(tipo) || 0) + 1
      );
    }
    const reservasPorCategoria = Array.from(reservasPorCategoriaMap.entries()).map(
      ([tipo, cantidad]) => ({ tipo, cantidad })
    );

    // ==========================
    // ⏳ PROMEDIO DE ESTADÍA
    // ==========================
    const totalDias = reservas.reduce((acc, r) => {
      const dias =
        (r.fecha_checkout.getTime() - r.fecha_checkin.getTime()) /
        (1000 * 60 * 60 * 24);
      return acc + dias;
    }, 0);
    const promedioEstadia = reservas.length
      ? Number((totalDias / reservas.length).toFixed(1))
      : 0;

    // ==========================
    // ❌ RESERVAS CANCELADAS POR MES (rellena meses vacíos)
    // ==========================
    const canceladas = await prisma.reservas.findMany({
      where: {
        estado: "CANCELADA",
        fecha_checkin: { gte: desde, lte: hasta },
      },
      select: { fecha_checkin: true },
    });

    const canceladasMap = canceladas.reduce<Record<string, number>>((acc, r) => {
      const fecha = new Date(r.fecha_checkin);
      const mes = `${getMonthLabel(fecha)}-${fecha.getFullYear()}`;
      acc[mes] = (acc[mes] || 0) + 1;
      return acc;
    }, {});

    const allMonthsCanceladas: { mes: string; cantidad: number }[] = [];
    const tempCancel = new Date(desde);
    while (tempCancel <= hasta) {
      const key = `${getMonthLabel(tempCancel)}-${tempCancel.getFullYear()}`;
      allMonthsCanceladas.push({
        mes: key,
        cantidad: canceladasMap[key] || 0,
      });
      tempCancel.setMonth(tempCancel.getMonth() + 1);
    }

    const canceladasPorMes = allMonthsCanceladas;

    // ==========================
    // 💳 RANKING DE MÉTODOS DE PAGO POR MES
    // ==========================
    const reservasConMetodo = await prisma.reservas.findMany({
      where: {
        fecha_checkin: { gte: desde, lte: hasta },
        estado: { not: "CANCELADA" },
        id_metodo_pago: { not: null },
      },
      include: { metodo_pago: { select: { nombre_metodo: true } } },
    });

    const rankingMap = new Map<string, number>();
    for (const r of reservasConMetodo) {
      const fecha = new Date(r.fecha_checkin);
      const mesKey = `${getMonthLabel(fecha)}-${fecha.getFullYear()}`;
      const metodo = r.metodo_pago?.nombre_metodo ?? "Desconocido";
      const key = `${mesKey}_${metodo}`;
      rankingMap.set(key, (rankingMap.get(key) || 0) + 1);
    }

    const rankingMetodosTemp = Array.from(rankingMap.entries()).map(([key, cantidad]) => {
      const [mes, metodo] = key.split("_");
      return { mes, metodo, cantidad };
    });

    // 🔹 Completar meses sin datos
    const metodosDisponibles = await prisma.metodo_pago.findMany({
      select: { nombre_metodo: true },
    });

    const allRanking: { mes: string; metodo: string; cantidad: number }[] = [];
    const tempRank = new Date(desde);
    while (tempRank <= hasta) {
      const mesKey = `${getMonthLabel(tempRank)}-${tempRank.getFullYear()}`;
      for (const m of metodosDisponibles) {
        const existente = rankingMetodosTemp.find(
          (r) => r.mes === mesKey && r.metodo === m.nombre_metodo
        );
        allRanking.push(
          existente ?? { mes: mesKey, metodo: m.nombre_metodo, cantidad: 0 }
        );
      }
      tempRank.setMonth(tempRank.getMonth() + 1);
    }

    allRanking.sort((a, b) => {
      const [mesA, anioA] = a.mes.split("-");
      const [mesB, anioB] = b.mes.split("-");
      return (
        parseInt(anioA) - parseInt(anioB) ||
        monthMap[mesA] - monthMap[mesB] ||
        a.metodo.localeCompare(b.metodo)
      );
    });

    const rankingMetodos = allRanking;

    // ==========================
    // 📦 RESPUESTA FINAL
    // ==========================
    return NextResponse.json({
      rango: { desde, hasta },
      ocupacionMensual,
      reservasPorCategoria,
      promedioEstadia,
      canceladasPorMes,
      rankingMetodos,
    });
  } catch (error) {
    console.error("❌ Error generando dashboard de reservas:", error);
    return NextResponse.json(
      { error: "Error generando dashboard de reservas" },
      { status: 500 }
    );
  }
}
