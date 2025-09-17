import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Obtener números de movimiento únicos con información básica
    const movimientos = await prisma.movimiento_inventario.findMany({
      select: {
        id_movimiento: true,
        numero_comprobante: true,
        fecha_movimiento: true,
        razon_movimiento: {
          select: {
            nombre_razon: true,
            tipo_movimiento: true
          }
        }
      },
      orderBy: {
        id_movimiento: 'desc'
      }
    });

    // Formatear datos para el dropdown
    const formattedData = movimientos.map(mov => ({
      value: mov.id_movimiento,
      label: `#${mov.id_movimiento}${mov.numero_comprobante ? ` - ${mov.numero_comprobante}` : ''} (${mov.razon_movimiento?.nombre_razon || 'Sin razón'})`,
      id_movimiento: mov.id_movimiento,
      numero_comprobante: mov.numero_comprobante,
      fecha_movimiento: mov.fecha_movimiento,
      razon: mov.razon_movimiento?.nombre_razon
    }));

    return NextResponse.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('Error fetching números de movimiento:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}