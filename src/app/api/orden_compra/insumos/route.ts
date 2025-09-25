import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const insumos = await prisma.insumo.findMany({
      select: {
        id_insumo: true,
        nombre_insumo: true,
      },
      orderBy: {
        nombre_insumo: 'asc',
      },
    });

    return NextResponse.json(insumos);
  } catch (error) {
    console.error('Error al obtener insumos:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
