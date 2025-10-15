import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma, estado_reservacion } from '@prisma/client';

const prisma = new PrismaClient();

// Función helper para validar estados de reservación
function isValidEstadoReservacion(estado: string): estado is estado_reservacion {
  return Object.values(estado_reservacion).includes(estado as estado_reservacion);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = page * limit;

    // Parámetros de ordenamiento
    const sortField = searchParams.get('sortField') || 'fecha_creacion';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Parámetros de filtro
    const busqueda = searchParams.get('busqueda');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const estado = searchParams.get('estado');

    // Construir filtros WHERE
    const whereConditions: Prisma.reservasWhereInput = {};

    // Filtro por búsqueda (nombre, apellido o documento del huésped)
    if (busqueda) {
      const searchTerms = busqueda.trim().toLowerCase();
      whereConditions.OR = [
        {
          huesped: {
            nombre: {
              contains: searchTerms,
              mode: 'insensitive'
            }
          }
        },
        {
          huesped: {
            apellido: {
              contains: searchTerms,
              mode: 'insensitive'
            }
          }
        },
        {
          huesped: {
            documento: {
              contains: searchTerms,
              mode: 'insensitive'
            }
          }
        },
        {
          huesped: {
            email: {
              contains: searchTerms,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    // Filtro por rango de fechas (fecha_checkin)
    if (fechaInicio || fechaFin) {
      const fechaCheckinFilter: Prisma.DateTimeFilter = {};

      if (fechaInicio) {
        const fechaInicioDate = new Date(fechaInicio);
        fechaInicioDate.setHours(0, 0, 0, 0);
        fechaCheckinFilter.gte = fechaInicioDate;
      }

      if (fechaFin) {
        const fechaFinDate = new Date(fechaFin);
        fechaFinDate.setHours(23, 59, 59, 999);
        fechaCheckinFilter.lte = fechaFinDate;
      }

      whereConditions.fecha_checkin = fechaCheckinFilter;
    }

    // Filtro por estado de reservación
    if (estado && isValidEstadoReservacion(estado)) {
      whereConditions.estado = estado;
    }

    // Configurar ordenamiento
    const orderBy: Prisma.reservasOrderByWithRelationInput = {};

    switch (sortField) {
      case 'id_reservas':
        orderBy.id_reservas = sortOrder as Prisma.SortOrder;
        break;
      case 'fecha_checkin':
        orderBy.fecha_checkin = sortOrder as Prisma.SortOrder;
        break;
      case 'fecha_checkout':
        orderBy.fecha_checkout = sortOrder as Prisma.SortOrder;
        break;
      case 'estado':
        orderBy.estado = sortOrder as Prisma.SortOrder;
        break;
      case 'monto_total':
        orderBy.monto_total = sortOrder as Prisma.SortOrder;
        break;
      case 'fecha_creacion':
      default:
        orderBy.fecha_creacion = sortOrder as Prisma.SortOrder;
        break;
    }

    // Obtener datos con paginación
    const [reservas, totalCount] = await Promise.all([
      prisma.reservas.findMany({
        where: whereConditions,
        include: {
          huesped: {
            select: {
              nombre: true,
              apellido: true,
              documento: true,
              telefono: true,
              email: true
            }
          },
          metodo_pago: {
            select: {
              id_metodo: true,
              nombre_metodo: true
            }
          },
          reservas_habitaciones: {
            include: {
              habitacion: {
                select: {
                  id_habitaciones: true,
                  numero: true,
                  tipo: true,
                  capacidad: true,
                  precio_base: true
                }
              }
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.reservas.count({
        where: whereConditions
      })
    ]);

    // Formatear datos para el frontend
    const formattedData = reservas.map(reserva => ({
      id_reservas: reserva.id_reservas,
      huesped: {
        nombre: reserva.huesped.nombre,
        apellido: reserva.huesped.apellido,
        documento: reserva.huesped.documento,
        telefono: reserva.huesped.telefono,
        email: reserva.huesped.email
      },
      fecha_checkin: reserva.fecha_checkin.toISOString(),
      fecha_checkout: reserva.fecha_checkout.toISOString(),
      cantidad_adultos: reserva.cantidad_adultos,
      cantidad_menores: reserva.cantidad_menores,
      estado: reserva.estado,
      monto_total: Number(reserva.monto_total),
      fecha_creacion: reserva.fecha_creacion?.toISOString(),
      fecha_actualizacion: reserva.fecha_actualizacion?.toISOString(),
      metodo_pago: reserva.metodo_pago ? {
        id_metodo: reserva.metodo_pago.id_metodo,
        nombre_metodo: reserva.metodo_pago.nombre_metodo
      } : null,
      reservas_habitaciones: reserva.reservas_habitaciones.map(rh => ({
        id_reservas_habitaciones: rh.id_reservas_habitaciones,
        cantidad_personas: rh.cantidad_personas,
        habitacion: {
          id_habitaciones: rh.habitacion.id_habitaciones,
          numero: rh.habitacion.numero,
          tipo: rh.habitacion.tipo,
          capacidad: rh.habitacion.capacidad,
          precio_base: Number(rh.habitacion.precio_base)
        }
      }))
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: (page + 1) < Math.ceil(totalCount / limit),
        hasPrev: page > 0
      }
    });

  } catch (error) {
    console.error('Error fetching reservas:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });

  } finally {
    await prisma.$disconnect();
  }
}
