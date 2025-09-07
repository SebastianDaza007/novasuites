import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const ordenes = await prisma.orden_compra.findMany({
      orderBy: { fecha_orden: 'desc' },
      select: {
        id_orden_compra: true,
        numero_orden: true
      }
    })
    return NextResponse.json(ordenes)
  } catch (error: any) {
    console.error('Error al cargar órdenes de compra:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
