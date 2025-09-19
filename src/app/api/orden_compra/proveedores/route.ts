import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const proveedores = await prisma.proveedor.findMany({
      where: { activo: true }, // opcional: solo los proveedores activos
      orderBy: { nombre_proveedor: 'asc' } // orden alfabético
    })

    return NextResponse.json(proveedores)
  } catch (error: any) {
    console.error('Error al obtener proveedores:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
