import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_reserva, motivo, cargo_penalizacion } = body;

    // Validaciones
    if (!id_reserva) {
      return NextResponse.json({
        success: false,
        message: 'El ID de reserva es requerido'
      }, { status: 400 });
    }

    if (!motivo || !motivo.trim()) {
      return NextResponse.json({
        success: false,
        message: 'El motivo de cancelación es requerido'
      }, { status: 400 });
    }

    // Verificar que la reserva existe
    const reserva = await prisma.reservas.findUnique({
      where: {
        id_reservas: parseInt(id_reserva)
      }
    });

    if (!reserva) {
      return NextResponse.json({
        success: false,
        message: 'La reserva no existe'
      }, { status: 404 });
    }

    // Verificar que la reserva no esté ya cancelada o en checkout
    if (reserva.estado === 'CANCELADA') {
      return NextResponse.json({
        success: false,
        message: 'La reserva ya está cancelada'
      }, { status: 400 });
    }

    if (reserva.estado === 'CHECKOUT') {
      return NextResponse.json({
        success: false,
        message: 'No se puede cancelar una reserva que ya tiene checkout'
      }, { status: 400 });
    }

    if (reserva.estado === 'CHECKIN') {
      return NextResponse.json({
        success: false,
        message: 'No se puede cancelar una reserva en estado CHECKIN. Use la opción de checkout.'
      }, { status: 400 });
    }

    // Usar una transacción para garantizar la integridad de los datos
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Actualizar el estado de la reserva a CANCELADA
      const reservaActualizada = await tx.reservas.update({
        where: {
          id_reservas: parseInt(id_reserva)
        },
        data: {
          estado: 'CANCELADA',
          fecha_actualizacion: new Date()
        }
      });

      // 2. Si hay cargo por penalización, crear una factura
      let facturaCreada = null;
      if (cargo_penalizacion && cargo_penalizacion > 0) {
        const hoy = new Date();
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 30); // 30 días para pagar

        // Generar número de factura único
        const numeroFactura = `FC-CANCEL-${id_reserva}-${Date.now()}`;

        // Crear la factura de cancelación
        facturaCreada = await tx.facturas_ventas.create({
          data: {
            numero: numeroFactura,
            id_reserva: parseInt(id_reserva),
            fecha_emision: hoy,
            fecha_vencimiento: fechaVencimiento,
            monto_total: new Prisma.Decimal(cargo_penalizacion),
            estado: 'PENDIENTE'
          }
        });

        // Crear el detalle de la factura
        await tx.detalle_facturas_ventas.create({
          data: {
            id_factura: facturaCreada.id_facturas_ventas,
            descripcion: `Cargo por cancelación tardía - ${motivo}`,
            cantidad: new Prisma.Decimal(1),
            precio_unitario: new Prisma.Decimal(cargo_penalizacion)
          }
        });
      }

      return { reservaActualizada, facturaCreada };
    });

    const mensajeRespuesta = resultado.facturaCreada
      ? `Reserva cancelada. Se generó una factura por penalización de $${Number(cargo_penalizacion).toFixed(2)}`
      : 'Reserva cancelada correctamente sin cargo';

    return NextResponse.json({
      success: true,
      message: mensajeRespuesta,
      data: {
        id_reserva: resultado.reservaActualizada.id_reservas,
        estado: resultado.reservaActualizada.estado,
        motivo_cancelacion: motivo,
        cargo_penalizacion: cargo_penalizacion || 0,
        factura_generada: resultado.facturaCreada ? {
          id_factura: resultado.facturaCreada.id_facturas_ventas,
          numero_factura: resultado.facturaCreada.numero,
          monto: Number(resultado.facturaCreada.monto_total)
        } : null
      }
    });

  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });

  } finally {
    await prisma.$disconnect();
  }
}
