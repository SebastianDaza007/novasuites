import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/habitaciones/disponibles
 * Retorna habitaciones disponibles en un rango de fechas específico
 * Query params: fecha_checkin, fecha_checkout
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaCheckin = searchParams.get('fecha_checkin');
    const fechaCheckout = searchParams.get('fecha_checkout');

    // Validar que se proporcionen las fechas
    if (!fechaCheckin || !fechaCheckout) {
      return NextResponse.json(
        { error: 'Se requieren fecha_checkin y fecha_checkout como parámetros' },
        { status: 400 }
      );
    }

    // Convertir a Date y normalizar a medianoche UTC
    const checkin = new Date(fechaCheckin + 'T00:00:00.000Z');
    const checkout = new Date(fechaCheckout + 'T00:00:00.000Z');

    // Validar que las fechas sean válidas
    if (isNaN(checkin.getTime()) || isNaN(checkout.getTime())) {
      return NextResponse.json(
        { error: 'Formato de fechas inválido' },
        { status: 400 }
      );
    }

    // Validar que checkout sea después de checkin
    if (checkout <= checkin) {
      return NextResponse.json(
        { error: 'La fecha de checkout debe ser posterior a la fecha de checkin' },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando disponibilidad:', {
      fechaCheckin: checkin.toISOString(),
      fechaCheckout: checkout.toISOString()
    });

    // 1. Obtener todas las habitaciones (excepto las en MANTENIMIENTO permanente)
    // El estado OCUPADA/LIMPIEZA es temporal y no debe bloquear reservas futuras
    const todasLasHabitaciones = await prisma.habitaciones.findMany({
      where: {
        estado: {
          not: 'MANTENIMIENTO'
        }
      },
      orderBy: {
        numero: 'asc'
      }
    });

    // 2. Buscar habitaciones que tienen reservas que se solapan con el rango de fechas
    const habitacionesOcupadas = await prisma.reservas_habitaciones.findMany({
      where: {
        reserva: {
          // Solo considerar reservas activas
          estado: {
            in: ['RESERVADA', 'CHECKIN']
          },
          // Validar solapamiento de fechas
          AND: [
            {
              fecha_checkout: {
                gt: checkin
              }
            },
            {
              fecha_checkin: {
                lt: checkout
              }
            }
          ]
        }
      },
      include: {
        reserva: {
          select: {
            fecha_checkin: true,
            fecha_checkout: true,
            estado: true
          }
        },
        habitacion: {
          select: {
            numero: true
          }
        }
      }
    });

    console.log('🔒 Habitaciones ocupadas encontradas:', habitacionesOcupadas.map(h => ({
      id: h.id_habitacion,
      habitacion: h.habitacion.numero,
      reserva: {
        checkin: h.reserva.fecha_checkin,
        checkout: h.reserva.fecha_checkout,
        estado: h.reserva.estado
      }
    })));

    // 3. Obtener IDs de habitaciones ocupadas
    const idsHabitacionesOcupadas = new Set(
      habitacionesOcupadas.map(h => h.id_habitacion)
    );

    // 4. Filtrar habitaciones disponibles
    const habitacionesDisponibles = todasLasHabitaciones.filter(
      habitacion => !idsHabitacionesOcupadas.has(habitacion.id_habitaciones)
    );

    console.log('✅ Habitaciones disponibles:', habitacionesDisponibles.map(h => h.numero));

    return NextResponse.json(habitacionesDisponibles);

  } catch (error) {
    console.error('Error al obtener habitaciones disponibles:', error);
    return NextResponse.json(
      { error: 'Error al obtener habitaciones disponibles' },
      { status: 500 }
    );
  }
}
