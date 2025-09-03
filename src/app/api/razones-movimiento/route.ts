import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const createRazonSchema = z.object({
  nombre_razon: z.string().min(1, 'El nombre de la razón es requerido'),
  descripcion: z.string().optional(),
  id_tipo_movimiento: z.number().int().positive('ID del tipo de movimiento es requerido')
})

// GET /api/razones-movimiento - Listar todas las razones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipoMovimiento = searchParams.get('tipo_movimiento')
    
    const whereClause = tipoMovimiento 
      ? { id_tipo_movimiento: parseInt(tipoMovimiento) }
      : {}

    const razones = await prisma.razon_movimiento.findMany({
      where: whereClause,
      include: {
        tipo_movimiento: {
          select: {
            id_tipo_movimiento: true,
            nombre_tipo: true,
            afecta_stock: true
          }
        },
        _count: {
          select: {
            movimientos: true
          }
        }
      },
      orderBy: {
        nombre_razon: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: razones
    })
  } catch (error) {
    console.error('Error fetching razones movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener razones de movimiento' },
      { status: 500 }
    )
  }
}

// POST /api/razones-movimiento - Crear nueva razón
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createRazonSchema.parse(body)

    // Verificar que el tipo de movimiento existe
    const tipoMovimiento = await prisma.tipo_movimiento.findUnique({
      where: { id_tipo_movimiento: validatedData.id_tipo_movimiento }
    })

    if (!tipoMovimiento) {
      return NextResponse.json({
        success: false,
        message: 'El tipo de movimiento especificado no existe'
      }, { status: 400 })
    }

    // Verificar que el nombre no esté duplicado para el mismo tipo
    const existingRazon = await prisma.razon_movimiento.findFirst({
      where: {
        nombre_razon: validatedData.nombre_razon,
        id_tipo_movimiento: validatedData.id_tipo_movimiento
      }
    })

    if (existingRazon) {
      return NextResponse.json({
        success: false,
        message: 'Ya existe una razón con este nombre para este tipo de movimiento'
      }, { status: 400 })
    }

    const nuevaRazon = await prisma.razon_movimiento.create({
      data: validatedData,
      include: {
        tipo_movimiento: {
          select: {
            id_tipo_movimiento: true,
            nombre_tipo: true,
            afecta_stock: true
          }
        },
        _count: {
          select: {
            movimientos: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: nuevaRazon,
      message: 'Razón de movimiento creada exitosamente'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error creating razon movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear razón de movimiento' },
      { status: 500 }
    )
  }
}