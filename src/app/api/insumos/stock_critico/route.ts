import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const stockCritico = await prisma.stock_deposito.findMany({
      where: {
        OR: [
          {
            cantidad_actual: {
              lte: prisma.stock_deposito.fields.stock_minimo
            }
          },
          {
            cantidad_actual: {
              lte: prisma.stock_deposito.fields.stock_critico
            }
          }
        ]
      },
      include: {
        insumo: {
          select: {
            id_insumo: true,
            nombre_insumo: true,
            estado_insumo: true
          }
        },
        deposito: {
          select: {
            id_deposito: true,
            nom_deposito: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: stockCritico
    })
  } catch (error) {
    console.error('Error fetching stock crítico:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener stock crítico' },
      { status: 500 }
    )
  }
}