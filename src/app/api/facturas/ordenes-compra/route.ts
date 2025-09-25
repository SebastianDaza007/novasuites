import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const ordenesCompra = await prisma.orden_compra.findMany({
      select: {
        id_orden_compra: true,
        numero_orden: true
      },
      orderBy: {
        numero_orden: 'asc'
      }
    });

    const ordenesOptions = ordenesCompra.map(orden => ({
      value: orden.id_orden_compra,
      label: orden.numero_orden
    }));

    return NextResponse.json({
      success: true,
      data: ordenesOptions
    });

  } catch (error) {
    console.error('Error fetching órdenes de compra:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}