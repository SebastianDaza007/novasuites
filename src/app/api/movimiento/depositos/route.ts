import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const depositos = await prisma.deposito.findMany({
      orderBy: { nom_deposito: 'asc' }
    })
    return NextResponse.json(depositos)
  } catch (error: any) {
    console.error('Error al cargar depósitos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
