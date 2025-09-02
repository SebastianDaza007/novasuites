import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { z } from 'zod'

const createAlertaStockSchema = z.object({
  tipo_alerta: z.enum(['STOCK_MINIMO', 'STOCK_CRITICO', 'VENCIMIENTO_PROXIMO']),
  mensaje: z.string().min(1, 'El mensaje es requerido'),
  id_insumo: z.number().int().positive('ID de insumo inválido'),
  id_deposito: z.number().int().positive('ID de depósito inválido'),
  id_usuario_asignado: z.number().int().positive().optional(),
  estado_alerta: z.enum(['ACTIVA', 'VISTA', 'RESUELTA']).default('ACTIVA')
})

// GET /api/alertas-stock - Listar alertas de stock
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const tipo = searchParams.get('tipo')
    const depositoId = searchParams.get('deposito')
    const usuarioId = searchParams.get('usuario')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}

    if (estado) {
      where.estado_alerta = estado
    }

    if (tipo) {
      where.tipo_alerta = tipo
    }

    if (depositoId) {
      where.id_deposito = parseInt(depositoId)
    }

    if (usuarioId) {
      where.id_usuario_asignado = parseInt(usuarioId)
    }

    const [alertas, total] = await Promise.all([
      prisma.alerta_stock.findMany({
        where,
        include: {
          insumo: {
            select: {
              id_insumo: true,
              nombre_insumo: true,
              categoria: {
                select: {
                  nombre_categoria: true
                }
              }
            }
          },
          deposito: {
            select: {
              id_deposito: true,
              nom_deposito: true
            }
          },
          usuario_asignado: {
            select: {
              id: true,
              email: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          fecha_alerta: 'desc'
        }
      }),
      prisma.alerta_stock.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: alertas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching alertas stock:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener alertas de stock' },
      { status: 500 }
    )
  }
}

// POST /api/alertas-stock - Crear nueva alerta de stock
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createAlertaStockSchema.parse(body)

    const nuevaAlerta = await prisma.alerta_stock.create({
      data: validatedData,
      include: {
        insumo: true,
        deposito: true,
        usuario_asignado: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: nuevaAlerta,
      message: 'Alerta creada exitosamente'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error creating alerta stock:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear alerta' },
      { status: 500 }
    )
  }
}