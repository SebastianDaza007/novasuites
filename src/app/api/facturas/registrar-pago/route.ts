import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * NOTA IMPORTANTE PARA EL DBA:
 * Este endpoint requiere que se agreguen los siguientes campos a la tabla factura_proveedor:
 *
 * - fecha_pago: DateTime? @db.Timestamp(6)
 * - metodo_pago: String?
 *
 * Una vez agregados estos campos, descomentar las líneas marcadas con "DESCOMENTAR"
 * en este archivo y comentar/eliminar la línea actual que solo actualiza el estado.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_factura, metodo_pago, fecha_pago } = body;

    // Validaciones
    if (!id_factura || !metodo_pago || !fecha_pago) {
      return NextResponse.json(
        {
          success: false,
          message: 'Faltan campos requeridos: id_factura, metodo_pago, fecha_pago'
        },
        { status: 400 }
      );
    }

    // Verificar que la factura existe y está pendiente
    const factura = await prisma.factura_proveedor.findUnique({
      where: { id_factura: Number(id_factura) }
    });

    if (!factura) {
      return NextResponse.json(
        { success: false, message: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    if (factura.estado_factura !== 'PENDIENTE') {
      return NextResponse.json(
        {
          success: false,
          message: `No se puede registrar el pago. La factura está en estado: ${factura.estado_factura}`
        },
        { status: 400 }
      );
    }

    // TEMPORAL: Solo actualiza el estado hasta que se agreguen los campos fecha_pago y metodo_pago
    const facturaActualizada = await prisma.factura_proveedor.update({
      where: { id_factura: Number(id_factura) },
      data: {
        estado_factura: 'PAGADA'
      }
    });

    /* DESCOMENTAR cuando se agreguen los campos fecha_pago y metodo_pago a la BD:
    const facturaActualizada = await prisma.factura_proveedor.update({
      where: { id_factura: Number(id_factura) },
      data: {
        estado_factura: 'PAGADA',
        fecha_pago: new Date(fecha_pago),
        metodo_pago: metodo_pago
      }
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Pago registrado exitosamente',
      data: facturaActualizada
    });

  } catch (error) {
    console.error('Error al registrar el pago:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al registrar el pago',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
