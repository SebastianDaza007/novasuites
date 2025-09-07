import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const razones = await prisma.razon_movimiento.findMany({
      orderBy: { nombre_razon: 'asc' },
      select: {
        id_razon: true,
        nombre_razon: true
      }
    })
    return NextResponse.json(razones)
  } catch (error: any) {
    console.error('Error al cargar razones de movimiento:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
