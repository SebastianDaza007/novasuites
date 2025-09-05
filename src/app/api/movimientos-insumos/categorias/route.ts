import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      where: {
        activo: true
      },
      select: {
        id_categoria: true,
        nombre_categoria: true,
        descripcion_categoria: true
      },
      orderBy: {
        nombre_categoria: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: categorias
    });

  } catch (error) {
    console.error('Error fetching categorias:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}