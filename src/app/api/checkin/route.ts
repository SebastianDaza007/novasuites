import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

// GET - Listar reservas pendientes de check-in
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = page * limit;

    // Parámetros de ordenamiento
    const sortField = searchParams.get('sortField') || 'fecha_checkin';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Parámetros de filtro
    const busqueda = searchParams.get('busqueda');

    // Calcular rango de fechas válido para check-in
    const ahora = new Date();

    // Obtener día actual sin hora
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

    // Si son las 14:00 o después, mostrar reservas de hoy
    // Si es antes de las 14:00, mostrar reservas de ayer (que aún están en plazo)
    const horaActual = ahora.getHours();
    let inicioRango: Date;

    if (horaActual >= 14) {
      // Ya pasaron las 14:00, mostrar desde hoy
      inicioRango = new Date(hoy);
      inicioRango.setHours(0, 0, 0, 0);
    } else {
      // Antes de las 14:00, incluir reservas de ayer
      inicioRango = new Date(hoy);
      inicioRango.setDate(inicioRango.getDate() - 1);
      inicioRango.setHours(0, 0, 0, 0);
    }

    // Fin: Hasta mañana (para incluir reservas de hoy que tienen plazo hasta mañana)
    const finRango = new Date(hoy);
    finRango.setDate(finRango.getDate() + 1);
    finRango.setHours(23, 59, 59, 999);

    // Construir filtros WHERE
    const whereConditions: Prisma.reservasWhereInput = {
      estado: 'RESERVADA',
      fecha_checkin: {
        gte: inicioRango,
        lte: finRango
      }
    };

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
        }
      ];
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
      case 'monto_total':
        orderBy.monto_total = sortOrder as Prisma.SortOrder;
        break;
      default:
        orderBy.fecha_checkin = sortOrder as Prisma.SortOrder;
        break;
    }

    // Obtener datos con paginación
    const [reservas, totalCount] = await Promise.all([
      prisma.reservas.findMany({
        where: whereConditions,
        include: {
          huesped: {
            select: {
              id_huespedes: true,
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
              nombre_metodo: true,
              activo: true
            }
          },
          tarjeta: {
            select: {
              id_tarjeta: true,
              numero_tarjeta: true,
              titular_tarjeta: true
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
                  estado: true
                }
              }
            }
          },
          acompanantes: {
            select: {
              id_acompanante: true,
              nombre: true,
              apellido: true,
              dni: true,
              fecha_nacimiento: true,
              fecha_creacion: true
            },
            orderBy: {
              id_acompanante: 'asc'
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
    const formattedData = reservas.map(reserva => {
      // Validar capacidad total vs personas
      const capacidadTotal = reserva.reservas_habitaciones.reduce((sum, rh) => sum + rh.habitacion.capacidad, 0);
      const personasTotal = reserva.cantidad_adultos + reserva.cantidad_menores;
      const excedeCapacidad = personasTotal > capacidadTotal;

      // Verificar si todas las habitaciones están disponibles
      const habitacionesDisponibles = reserva.reservas_habitaciones.every(rh =>
        rh.habitacion.estado === 'DISPONIBLE' || rh.habitacion.estado === 'LIMPIEZA'
      );

      return {
        id_reservas: reserva.id_reservas,
        huesped: {
          id_huespedes: reserva.huesped.id_huespedes,
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
        metodo_pago: reserva.metodo_pago ? {
          id_metodo: reserva.metodo_pago.id_metodo,
          nombre_metodo: reserva.metodo_pago.nombre_metodo,
          activo: reserva.metodo_pago.activo
        } : null,
        tarjeta: reserva.tarjeta ? {
          id_tarjeta: reserva.tarjeta.id_tarjeta,
          numero_tarjeta: reserva.tarjeta.numero_tarjeta.slice(-4), // Solo últimos 4 dígitos
          titular_tarjeta: reserva.tarjeta.titular_tarjeta
        } : null,
        reservas_habitaciones: reserva.reservas_habitaciones.map(rh => ({
          id_reservas_habitaciones: rh.id_reservas_habitaciones,
          cantidad_personas: rh.cantidad_personas,
          habitacion: {
            id_habitaciones: rh.habitacion.id_habitaciones,
            numero: rh.habitacion.numero,
            tipo: rh.habitacion.tipo,
            capacidad: rh.habitacion.capacidad,
            estado: rh.habitacion.estado
          }
        })),
        acompanantes: reserva.acompanantes.map(acomp => ({
          id_acompanante: acomp.id_acompanante,
          nombre: acomp.nombre,
          apellido: acomp.apellido,
          dni: acomp.dni,
          fecha_nacimiento: acomp.fecha_nacimiento.toISOString(),
          fecha_creacion: acomp.fecha_creacion?.toISOString()
        })),
        // Validaciones adicionales
        validaciones: {
          excede_capacidad: excedeCapacidad,
          habitaciones_disponibles: habitacionesDisponibles,
          tiene_metodo_pago: !!reserva.metodo_pago,
          capacidad_total: capacidadTotal,
          personas_total: personasTotal
        }
      };
    });

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
    console.error('Error fetching reservas for checkin:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// POST - Realizar check-in
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id_reserva,
      contacto_actualizado, // { telefono?, email? }
      acompanantes, // Array de acompañantes a registrar
      crear_factura = true,
      notificar_housekeeping = true
    } = body;

    if (!id_reserva) {
      return NextResponse.json({
        success: false,
        message: 'El ID de reserva es requerido'
      }, { status: 400 });
    }

    // Verificar que la reserva existe y está en estado RESERVADA
    const reserva = await prisma.reservas.findUnique({
      where: { id_reservas: id_reserva },
      include: {
        huesped: true,
        metodo_pago: true,
        reservas_habitaciones: {
          include: {
            habitacion: true
          }
        }
      }
    });

    if (!reserva) {
      return NextResponse.json({
        success: false,
        message: 'Reserva no encontrada'
      }, { status: 404 });
    }

    if (reserva.estado !== 'RESERVADA') {
      return NextResponse.json({
        success: false,
        message: `No se puede realizar check-in. Estado actual: ${reserva.estado}`
      }, { status: 400 });
    }

    // Validar política de check-in (a partir de las 14:00 del día de check-in)
    const ahora = new Date();
    const fechaCheckin = new Date(reserva.fecha_checkin);

    // Usar fechas en zona horaria local de Argentina (UTC-3)
    // Extraer año, mes, día en UTC y crear fecha local
    const year = fechaCheckin.getUTCFullYear();
    const month = fechaCheckin.getUTCMonth();
    const day = fechaCheckin.getUTCDate();

    // Crear fecha local con el día de la reserva a las 00:00 hora local
    const diaReserva = new Date(year, month, day, 0, 0, 0, 0);

    // Crear fecha de inicio de check-in: día de la reserva a las 14:00 hora local
    const inicioCheckin = new Date(year, month, day, 14, 0, 0, 0);

    // Permitir hasta 1 día después a las 23:59 hora local
    const unDiaDespues = new Date(year, month, day + 1, 23, 59, 59, 999);

    if (ahora < inicioCheckin) {
      const fechaFormateada = diaReserva.toLocaleDateString('es-AR');
      return NextResponse.json({
        success: false,
        message: `El check-in solo puede realizarse a partir de las 14:00 horas del ${fechaFormateada}`
      }, { status: 400 });
    }

    if (ahora > unDiaDespues) {
      return NextResponse.json({
        success: false,
        message: 'El plazo para realizar el check-in ha expirado (más de 1 día después de la fecha programada)'
      }, { status: 400 });
    }

    // Validaciones adicionales
    const capacidadTotal = reserva.reservas_habitaciones.reduce((sum, rh) => sum + rh.habitacion.capacidad, 0);
    const personasTotal = reserva.cantidad_adultos + reserva.cantidad_menores;

    if (personasTotal > capacidadTotal) {
      return NextResponse.json({
        success: false,
        message: `La cantidad de personas (${personasTotal}) excede la capacidad total de las habitaciones (${capacidadTotal})`
      }, { status: 400 });
    }

    // Verificar método de pago
    if (!reserva.metodo_pago) {
      return NextResponse.json({
        success: false,
        message: 'La reserva no tiene un método de pago registrado. Por favor, registre un método de pago antes del check-in.'
      }, { status: 400 });
    }

    // Actualizar contacto del huésped si se proporciona
    if (contacto_actualizado) {
      await prisma.huespedes.update({
        where: { id_huespedes: reserva.huesped.id_huespedes },
        data: {
          telefono: contacto_actualizado.telefono || reserva.huesped.telefono,
          email: contacto_actualizado.email || reserva.huesped.email
        }
      });
    }

    // Registrar acompañantes si se proporcionan
    if (acompanantes && Array.isArray(acompanantes) && acompanantes.length > 0) {
      await prisma.acompanante.createMany({
        data: acompanantes.map((acomp: any) => ({
          nombre: acomp.nombre,
          apellido: acomp.apellido,
          dni: acomp.dni,
          fecha_nacimiento: new Date(acomp.fecha_nacimiento),
          id_reserva: id_reserva
        }))
      });
    }

    // Actualizar estado de la reserva a CHECKIN
    const reservaActualizada = await prisma.reservas.update({
      where: { id_reservas: id_reserva },
      data: {
        estado: 'CHECKIN',
        fecha_actualizacion: new Date()
      },
      include: {
        huesped: true,
        reservas_habitaciones: {
          include: {
            habitacion: true
          }
        }
      }
    });

    // Actualizar estado de las habitaciones a OCUPADA
    const habitacionesIds = reserva.reservas_habitaciones.map(rh => rh.habitacion.id_habitaciones);

    await prisma.habitaciones.updateMany({
      where: {
        id_habitaciones: {
          in: habitacionesIds
        }
      },
      data: {
        estado: 'OCUPADA'
      }
    });

    // Crear factura de hospedaje si se solicita
    let facturaCreada = null;
    if (crear_factura) {
      const fechaEmision = new Date();
      const fechaVencimiento = new Date(reserva.fecha_checkout);

      facturaCreada = await prisma.facturas_ventas.create({
        data: {
          numero: `FV-${id_reserva}-${Date.now()}`,
          id_reserva: id_reserva,
          fecha_emision: fechaEmision,
          fecha_vencimiento: fechaVencimiento,
          monto_total: reserva.monto_total,
          estado: 'PENDIENTE',
          detalles: {
            create: reserva.reservas_habitaciones.map((rh, index) => {
              const dias = Math.ceil(
                (new Date(reserva.fecha_checkout).getTime() - new Date(reserva.fecha_checkin).getTime()) /
                (1000 * 60 * 60 * 24)
              );
              const precioUnitario = Number(rh.habitacion.precio_base);

              return {
                descripcion: `Habitación ${rh.habitacion.numero} - ${rh.habitacion.tipo} (${dias} noche${dias > 1 ? 's' : ''})`,
                cantidad: dias,
                precio_unitario: precioUnitario,
                subtotal: precioUnitario * dias
              };
            })
          }
        }
      });
    }

    // TODO: Notificar a housekeeping para preparación (pendiente - módulo housekeeping no implementado)
    // const tareasHousekeeping = [];
    // if (notificar_housekeeping) {
    //   const usuarioHousekeeping = await prisma.usuario.findFirst({
    //     where: {
    //       OR: [
    //         { rol: 'housekeeping' },
    //         { rol: 'admin' }
    //       ]
    //     }
    //   });
    //   if (usuarioHousekeeping) {
    //     for (const rh of reserva.reservas_habitaciones) {
    //       const tarea = await prisma.housekeeping.create({
    //         data: {
    //           id_habitacion: rh.habitacion.id_habitaciones,
    //           fecha: new Date(),
    //           tarea: `Check-in realizado - Habitación ocupada`,
    //           estado: 'COMPLETADA',
    //           observaciones: `Check-in de ${reserva.huesped.nombre} ${reserva.huesped.apellido}. ${personasTotal} persona${personasTotal > 1 ? 's' : ''}.`,
    //           asignado_a: usuarioHousekeeping.id
    //         }
    //       });
    //       tareasHousekeeping.push(tarea.id_housekeeping);
    //     }
    //   }
    // }

    return NextResponse.json({
      success: true,
      message: 'Check-in realizado exitosamente',
      data: {
        id_reservas: reservaActualizada.id_reservas,
        estado: reservaActualizada.estado,
        huesped: `${reservaActualizada.huesped.nombre} ${reservaActualizada.huesped.apellido}`,
        habitaciones: reservaActualizada.reservas_habitaciones.map(rh => rh.habitacion.numero).join(', '),
        acompanantes_registrados: acompanantes ? acompanantes.length : 0,
        factura_creada: facturaCreada ? {
          id_factura: facturaCreada.id_facturas_ventas,
          numero: facturaCreada.numero,
          monto_total: Number(facturaCreada.monto_total)
        } : null
      }
    });

  } catch (error) {
    console.error('Error realizando check-in:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
