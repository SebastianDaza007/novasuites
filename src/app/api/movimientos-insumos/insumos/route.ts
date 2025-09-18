import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Obtener todos los insumos activos
    const insumos = await prisma.insumo.findMany({
      where: {
        activo: true
      },
      select: {
        id_insumo: true,
        nombre_insumo: true,
        descripcion_insumo: true,
        categoria: {
          select: {
            nombre_categoria: true
          }
        }
      },
      orderBy: {
        nombre_insumo: 'asc'
      }
    });

    // Formatear datos para el dropdown (incluye todos los insumos activos)
    const formattedData = insumos.map(insumo => ({
      value: insumo.id_insumo,
      label: `${insumo.nombre_insumo} (${insumo.categoria.nombre_categoria})`,
      id_insumo: insumo.id_insumo,
      nombre_insumo: insumo.nombre_insumo,
      descripcion_insumo: insumo.descripcion_insumo,
      categoria: insumo.categoria.nombre_categoria
    }));

    return NextResponse.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('Error fetching insumos:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}