import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Obtener lotes únicos no nulos
    const lotes = await prisma.detalle_movimiento_inventario.findMany({
      where: {
        lote: {
          not: null
        }
      },
      select: {
        lote: true,
        fecha_vencimiento: true,
        insumo: {
          select: {
            nombre_insumo: true
          }
        }
      },
      distinct: ['lote'],
      orderBy: {
        lote: 'asc'
      }
    });

    // Formatear datos para el dropdown
    const formattedData = lotes.map(detalle => ({
      value: detalle.lote!,
      label: `${detalle.lote}${detalle.fecha_vencimiento ? ` (Vence: ${new Date(detalle.fecha_vencimiento).toLocaleDateString('es-AR')})` : ''}`,
      lote: detalle.lote!,
      fecha_vencimiento: detalle.fecha_vencimiento,
      insumo_ejemplo: detalle.insumo.nombre_insumo
    }));

    return NextResponse.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('Error fetching lotes:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}