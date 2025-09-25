import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const proveedores = await prisma.proveedor.findMany({
      where: {
        activo: true
      },
      select: {
        id_proveedor: true,
        nombre_proveedor: true,
        cuit_proveedor: true
      },
      orderBy: {
        nombre_proveedor: 'asc'
      }
    });

    const formattedProveedores = proveedores.map(proveedor => ({
      ...proveedor,
      cuit_proveedor: Number(proveedor.cuit_proveedor)
    }));

    return NextResponse.json({
      success: true,
      data: formattedProveedores
    });

  } catch (error) {
    console.error('Error fetching proveedores:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}