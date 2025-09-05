import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const depositos = await prisma.deposito.findMany({
      where: {
        activo: true
      },
      select: {
        id_deposito: true,
        nombre_deposito: true,
        direccion_deposito: true,
        telefono_deposito: true,
        usuario: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        nombre_deposito: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: depositos
    });

  } catch (error) {
    console.error('Error fetching depositos:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}