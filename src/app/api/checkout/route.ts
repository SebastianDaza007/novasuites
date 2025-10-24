import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

// GET - Listar reservas pendientes de check-out
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = page * limit;

    // Parámetros de ordenamiento
    const sortField = searchParams.get('sortField') || 'fecha_checkout';
    const sortOrderParam = searchParams.get('sortOrder') || '1';
    const sortOrder = sortOrderParam === '1' || sortOrderParam === 'asc' ? 'asc' : 'desc';

    // Parámetros de filtro
    const busqueda = searchParams.get('busqueda');

    // Construir filtros WHERE - solo reservas con estado CHECKIN
    const whereConditions: Prisma.reservasWhereInput = {
      estado: 'CHECKIN'
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
        orderBy.fecha_checkout = sortOrder as Prisma.SortOrder;
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
                  capacidad: true
                }
              }
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy
      }),
      prisma.reservas.count({ where: whereConditions })
    ]);

    // Formatear respuesta
    const reservasFormateadas = reservas.map(reserva => {
      const habitaciones = reserva.reservas_habitaciones.map(rh => ({
        id_habitacion: rh.habitacion.id_habitaciones,
        numero: rh.habitacion.numero,
        tipo: rh.habitacion.tipo,
        capacidad: rh.habitacion.capacidad,
        cantidad_personas: rh.cantidad_personas
      }));

      // Verificar si ya pasó la fecha de checkout o si es temprano
      const ahora = new Date();
      const fechaCheckout = new Date(reserva.fecha_checkout);

      // Normalizar fechas a medianoche para comparación
      const hoyMedianoche = new Date(ahora);
      hoyMedianoche.setHours(0, 0, 0, 0);

      const checkoutMedianoche = new Date(fechaCheckout);
      checkoutMedianoche.setHours(0, 0, 0, 0);

      // Comparar usando fechas normalizadas a medianoche
      const checkoutVencido = hoyMedianoche > checkoutMedianoche;
      const checkoutTemprano = hoyMedianoche < checkoutMedianoche;

      // Calcular días restantes o días de extensión
      const diasRestantes = Math.ceil((checkoutMedianoche.getTime() - hoyMedianoche.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id_reservas: reserva.id_reservas,
        fecha_checkin: reserva.fecha_checkin,
        fecha_checkout: reserva.fecha_checkout,
        cantidad_adultos: reserva.cantidad_adultos,
        cantidad_menores: reserva.cantidad_menores,
        monto_total: reserva.monto_total,
        estado: reserva.estado,
        huesped: reserva.huesped,
        metodo_pago: reserva.metodo_pago,
        habitaciones,
        validaciones: {
          checkout_vencido: checkoutVencido,
          checkout_temprano: checkoutTemprano,
          dias_restantes: checkoutTemprano ? diasRestantes : 0
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: reservasFormateadas,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error al listar reservas para checkout:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener las reservas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Función para generar consumos consistentes basados en ID de reserva
function generarConsumos(idReserva: number, montoHospedaje: number) {
  const consumosBase = [
    { categoria: 'Minibar', items: ['Coca Cola 350ml', 'Agua Mineral 500ml', 'Cerveza Corona', 'Snickers', 'Papas Lays', 'Vino Tinto 187ml'] },
    { categoria: 'Room Service', items: ['Desayuno Continental', 'Hamburguesa Completa', 'Ensalada César', 'Pizza Margarita', 'Club Sandwich', 'Pasta Alfredo'] },
    { categoria: 'Lavandería', items: ['Camisa', 'Pantalón', 'Vestido', 'Traje Completo', 'Sábanas extras'] },
    { categoria: 'Spa & Wellness', items: ['Masaje Relajante 60min', 'Tratamiento Facial', 'Acceso Gimnasio', 'Sauna'] },
    { categoria: 'Bar & Restaurante', items: ['Cena para 2', 'Cocktail Mojito', 'Botella de Champagne', 'Postre del Chef'] },
    { categoria: 'Servicios', items: ['Estacionamiento', 'WiFi Premium', 'Late Checkout', 'Traslado Aeropuerto'] }
  ];

  const seed = idReserva;
  const numConsumos = (seed % 5) + 3; // Entre 3 y 7 consumos
  const consumos = [];

  for (let i = 0; i < numConsumos; i++) {
    const catIndex = (seed * (i + 1)) % consumosBase.length;
    const categoria = consumosBase[catIndex];
    const itemIndex = (seed * (i + 2)) % categoria.items.length;
    const item = categoria.items[itemIndex];
    const cantidad = ((seed * (i + 3)) % 3) + 1;
    const precioBase = [500, 800, 1200, 1500, 2000, 2500, 3000, 3500, 4000];
    const precio = precioBase[(seed * (i + 4)) % precioBase.length];

    consumos.push({
      descripcion: `${categoria.categoria} - ${item}`,
      cantidad: cantidad,
      precio_unitario: precio
    });
  }

  return consumos;
}

// POST - Realizar check-out
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_reserva } = body;

    // Validaciones básicas
    if (!id_reserva) {
      return NextResponse.json(
        { success: false, message: 'ID de reserva es requerido' },
        { status: 400 }
      );
    }

    // Buscar la reserva
    const reserva = await prisma.reservas.findUnique({
      where: { id_reservas: id_reserva },
      include: {
        reservas_habitaciones: {
          include: {
            habitacion: true
          }
        }
      }
    });

    if (!reserva) {
      return NextResponse.json(
        { success: false, message: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    // Validar que la reserva esté en estado CHECKIN
    if (reserva.estado !== 'CHECKIN') {
      return NextResponse.json(
        { success: false, message: 'La reserva debe estar en estado CHECKIN para realizar checkout' },
        { status: 400 }
      );
    }

    // Generar consumos
    const consumos = generarConsumos(id_reserva, Number(reserva.monto_total));
    const totalConsumos = consumos.reduce((sum, c) => sum + (c.cantidad * c.precio_unitario), 0);

    // Realizar el checkout en una transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Actualizar estado de la reserva a CHECKOUT
      const reservaActualizada = await tx.reservas.update({
        where: { id_reservas: id_reserva },
        data: {
          estado: 'CHECKOUT',
          fecha_actualizacion: new Date()
        }
      });

      // 2. Cambiar estado de las habitaciones a LIMPIEZA
      const habitacionesIds = reserva.reservas_habitaciones.map(rh => rh.id_habitacion);

      await tx.habitaciones.updateMany({
        where: {
          id_habitaciones: {
            in: habitacionesIds
          }
        },
        data: {
          estado: 'LIMPIEZA'
        }
      });

      // 3. Generar número de factura único
      const ultimaFactura = await tx.facturas_ventas.findFirst({
        orderBy: { id_facturas_ventas: 'desc' },
        select: { numero: true }
      });

      let numeroFactura = 'FV-0001';
      if (ultimaFactura) {
        const ultimoNumero = parseInt(ultimaFactura.numero.split('-')[1]);
        numeroFactura = `FV-${String(ultimoNumero + 1).padStart(4, '0')}`;
      }

      // 4. Crear factura de venta
      const fechaEmision = new Date();
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30); // Vencimiento a 30 días

      const montoTotal = Number(reserva.monto_total) + totalConsumos;

      const factura = await tx.facturas_ventas.create({
        data: {
          numero: numeroFactura,
          id_reserva: id_reserva,
          fecha_emision: fechaEmision,
          fecha_vencimiento: fechaVencimiento,
          monto_total: montoTotal,
          estado: 'PAGADA' // Asumimos que se paga al checkout
        }
      });

      // 5. Crear detalles de factura - Hospedaje
      const habitaciones = reserva.reservas_habitaciones.map(rh => rh.habitacion.numero).join(', ');

      await tx.detalle_facturas_ventas.create({
        data: {
          id_factura: factura.id_facturas_ventas,
          descripcion: `Hospedaje - Habitación(es): ${habitaciones}`,
          cantidad: 1,
          precio_unitario: reserva.monto_total
        }
      });

      // 6. Crear detalles de factura - Consumos
      for (const consumo of consumos) {
        await tx.detalle_facturas_ventas.create({
          data: {
            id_factura: factura.id_facturas_ventas,
            descripcion: consumo.descripcion,
            cantidad: consumo.cantidad,
            precio_unitario: consumo.precio_unitario
          }
        });
      }

      return {
        reserva: reservaActualizada,
        habitaciones_actualizadas: habitacionesIds.length,
        factura: {
          id: factura.id_facturas_ventas,
          numero: factura.numero,
          monto_total: factura.monto_total,
          estado: factura.estado
        }
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Check-out realizado exitosamente',
      data: resultado
    });

  } catch (error) {
    console.error('Error al realizar checkout:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al realizar el checkout',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
