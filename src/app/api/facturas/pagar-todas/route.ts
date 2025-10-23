import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_facturas, metodo_pago, fecha_pago } = body;

    // Validaciones básicas
    if (!id_facturas || !Array.isArray(id_facturas) || id_facturas.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Debe proporcionar un array válido de IDs de facturas'
        },
        { status: 400 }
      );
    }

    if (!metodo_pago || !fecha_pago) {
      return NextResponse.json(
        {
          success: false,
          message: 'Faltan campos requeridos: metodo_pago, fecha_pago'
        },
        { status: 400 }
      );
    }

    // Verificar que todas las facturas existen y están pendientes
    const facturas = await prisma.factura_proveedor.findMany({
      where: {
        id_factura: {
          in: id_facturas.map(id => Number(id))
        }
      }
    });

    if (facturas.length !== id_facturas.length) {
      return NextResponse.json(
        {
          success: false,
          message: 'Algunas facturas no fueron encontradas'
        },
        { status: 404 }
      );
    }

    // Verificar que todas estén pendientes
    const facturasNoPendientes = facturas.filter(f => f.estado_factura !== 'PENDIENTE');
    if (facturasNoPendientes.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Las siguientes facturas no están en estado PENDIENTE: ${facturasNoPendientes.map(f => f.numero_factura).join(', ')}`
        },
        { status: 400 }
      );
    }

    // Calcular total de todas las facturas
    const facturaConDetalles = await prisma.factura_proveedor.findMany({
      where: {
        id_factura: {
          in: id_facturas.map(id => Number(id))
        }
      },
      include: {
        detalle_factura_proveedor: true
      }
    });

    const totalGeneral = facturaConDetalles.reduce((sum, factura) => {
      const montoFactura = factura.detalle_factura_proveedor.reduce((sumDetalle, detalle) =>
        sumDetalle + (Number(detalle.cantidad) * Number(detalle.precio)), 0
      );
      return sum + montoFactura;
    }, 0);

    // Usar transacción para asegurar atomicidad
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Crear una única orden de pago para todas las facturas
      const ordenPago = await tx.ordenes_pago.create({
        data: {
          fecha: new Date(fecha_pago),
          total: totalGeneral
        }
      });

      // 2. Actualizar todas las facturas vinculándolas a la orden de pago
      const facturasActualizadas = await tx.factura_proveedor.updateMany({
        where: {
          id_factura: {
            in: id_facturas.map(id => Number(id))
          }
        },
        data: {
          estado_factura: 'PAGADA',
          id_orden_pago: ordenPago.id_ordenes_pago
        }
      });

      return {
        ordenPago,
        facturasActualizadas
      };
    });

    return NextResponse.json({
      success: true,
      message: `${facturas.length} factura(s) pagada(s) exitosamente`,
      data: {
        cantidad_facturas: facturas.length,
        total_pagado: totalGeneral,
        orden_pago: resultado.ordenPago
      }
    });

  } catch (error) {
    console.error('Error al registrar los pagos:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al registrar los pagos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
