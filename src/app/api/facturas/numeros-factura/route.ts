import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const facturas = await prisma.factura_proveedor.findMany({
      select: {
        id_factura: true,
        numero_factura: true
      },
      orderBy: {
        numero_factura: 'asc'
      }
    });

    const numerosFactura = facturas.map(factura => ({
      value: factura.id_factura,
      label: factura.numero_factura
    }));

    return NextResponse.json({
      success: true,
      data: numerosFactura
    });

  } catch (error) {
    console.error('Error fetching números de factura:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}