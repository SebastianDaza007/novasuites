import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const insumos = await prisma.insumo.findMany({
      where: {
        estado_insumo: true // o filtrá como prefieras
      },
      select: {
        id_insumo: true,
        nombre_insumo: true
      }
    })

    return NextResponse.json(insumos)
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener insumos' }, { status: 500 })
  }
}
