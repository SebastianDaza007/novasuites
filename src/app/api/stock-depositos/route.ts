import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const createStockDepositoSchema = z.object({
  id_deposito: z.number().int().positive('ID de depósito inválido'),
  id_insumo: z.number().int().positive('ID de insumo inválido'),
  cantidad_actual: z.number().int().min(0, 'La cantidad no puede ser negativa').default(0),
  stock_minimo: z.number().int().min(0, 'El stock mínimo no puede ser negativo').default(0),
  stock_critico: z.number().int().min(0, 'El stock crítico no puede ser negativo').default(0)
})

// GET /api/stock-depositos - Listar stock por depósito
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const depositoId = searchParams.get('deposito')
    const insumoId = searchParams.get('insumo')
    const alertasCriticas = searchParams.get('alertasCriticas') === 'true'
    const stockBajo = searchParams.get('stockBajo') === 'true'

    const where: Prisma.stock_depositoWhereInput = {}

    if (depositoId) {
      where.id_deposito = parseInt(depositoId)
    }

    if (insumoId) {
      where.id_insumo = parseInt(insumoId)
    }

    const stockDepositos = await prisma.stock_deposito.findMany({
      where,
      include: {
        deposito: {
          select: {
            id_deposito: true,
            nom_deposito: true
          }
        },
        insumo: {
          include: {
            categoria: {
              select: {
                id_categoria: true,
                nombre_categoria: true
              }
            },
            proveedor: {
              select: {
                id_proveedor: true,
                nombre_proveedor: true
              }
            }
          }
        }
      },
      orderBy: [
        { deposito: { nom_deposito: 'asc' } },
        { insumo: { nombre_insumo: 'asc' } }
      ]
    })

    // Filtrar por alertas después de obtener los datos
    let stockFiltrado = stockDepositos

    if (alertasCriticas) {
      stockFiltrado = stockDepositos.filter(stock => 
        stock.cantidad_actual <= stock.stock_critico
      )
    } else if (stockBajo) {
      stockFiltrado = stockDepositos.filter(stock => 
        stock.cantidad_actual <= stock.stock_minimo
      )
    }

    // Agregar información de alerta
    const stockWithAlerts = stockFiltrado.map(stock => ({
      ...stock,
      alerta_nivel: stock.cantidad_actual <= stock.stock_critico ? 'CRITICO' :
                   stock.cantidad_actual <= stock.stock_minimo ? 'BAJO' : 'NORMAL',
      necesita_reposicion: stock.cantidad_actual <= stock.stock_minimo
    }))

    return NextResponse.json({
      success: true,
      data: stockWithAlerts
    })
  } catch (error) {
    console.error('Error fetching stock depositos:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener stock de depósitos' },
      { status: 500 }
    )
  }
}

// POST /api/stock-depositos - Crear nuevo stock en depósito
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createStockDepositoSchema.parse(body)

    // Verificar que no existe ya un registro para este depósito e insumo
    const existingStock = await prisma.stock_deposito.findFirst({
      where: {
        id_deposito: validatedData.id_deposito,
        id_insumo: validatedData.id_insumo
      }
    })

    if (existingStock) {
      return NextResponse.json({
        success: false,
        message: 'Ya existe un registro de stock para este insumo en el depósito'
      }, { status: 400 })
    }

    const nuevoStock = await prisma.stock_deposito.create({
      data: {
        ...validatedData,
        fecha_ultimo_mov: new Date()
      },
      include: {
        deposito: true,
        insumo: {
          include: {
            categoria: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: nuevoStock,
      message: 'Stock creado exitosamente'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error creating stock deposito:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear stock' },
      { status: 500 }
    )
  }
}