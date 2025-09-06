import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const tipos = await prisma.tipo_movimiento.findMany({
      where: { estado_tipo: true }, // si querés filtrar
      orderBy: { nombre_tipo: 'asc' }
    })

    return NextResponse.json(tipos)
  } catch (error: any) {
    console.error('Error al obtener tipos:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}