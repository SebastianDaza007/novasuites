import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const createDetalleSchema = z.object({
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
  costo_unitario: z.number().optional(),
  lote: z.string().optional(),
  fecha_vencimiento: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  id_movimiento: z.number().int().positive('ID del movimiento es requerido'),
  id_insumo: z.number().int().positive('ID del insumo es requerido')
})

// GET /api/detalles-movimiento - Listar detalles de movimiento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const movimientoId = searchParams.get('movimiento_id')
    const insumoId = searchParams.get('insumo_id')
    const tipoMovimiento = searchParams.get('tipoMovimiento')
    const fechaDesde = searchParams.get('fechaDesde')
    const fechaHasta = searchParams.get('fechaHasta')
    const categoriaId = searchParams.get('categoria')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const whereClause: Prisma.detalle_movimiento_inventarioWhereInput = {}
    
    if (movimientoId) {
      whereClause.id_movimiento = parseInt(movimientoId)
    }
    
    if (insumoId) {
      whereClause.id_insumo = parseInt(insumoId)
    }

    // Filtros para la página de movimientos
    if (tipoMovimiento || fechaDesde || fechaHasta) {
      whereClause.movimiento = {}
      
      if (tipoMovimiento) {
        whereClause.movimiento.id_tipo_movimiento = parseInt(tipoMovimiento)
      }
      
      if (fechaDesde || fechaHasta) {
        whereClause.movimiento.fecha_movimiento = {}
        
        if (fechaDesde) {
          whereClause.movimiento.fecha_movimiento.gte = new Date(fechaDesde + 'T00:00:00.000Z')
        }
        
        if (fechaHasta) {
          whereClause.movimiento.fecha_movimiento.lte = new Date(fechaHasta + 'T23:59:59.999Z')
        }
      }
    }

    // Filtro por categoría del insumo
    if (categoriaId) {
      whereClause.insumo = {
        ...whereClause.insumo,
        id_categoria: parseInt(categoriaId)
      }
    }

    // Filtro de búsqueda por nombre de insumo
    if (search) {
      whereClause.insumo = {
        ...whereClause.insumo,
        nombre_insumo: {
          contains: search,
          mode: 'insensitive' // Búsqueda case-insensitive
        }
      }
    }

    const [detalles, total] = await Promise.all([
      prisma.detalle_movimiento_inventario.findMany({
        where: whereClause,
        include: {
          movimiento: {
            select: {
              id_movimiento: true,
              fecha_movimiento: true,
              numero_comprobante: true,
              estado_movimiento: true,
              tipo_movimiento: {
                select: {
                  nombre_tipo: true,
                  afecta_stock: true
                }
              },
              deposito_origen: {
                select: {
                  nom_deposito: true
                }
              },
              deposito_destino: {
                select: {
                  nom_deposito: true
                }
              }
            }
          },
          insumo: {
            select: {
              id_insumo: true,
              nombre_insumo: true,
              descripcion_insumo: true,
              costo_unitario: true,
              categoria: {
                select: {
                  id_categoria: true,
                  nombre_categoria: true
                }
              }
            }
          }
        },
        orderBy: [
          { id_movimiento: 'desc' },
          { id_detalle: 'asc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.detalle_movimiento_inventario.count({
        where: whereClause
      })
    ])

    return NextResponse.json({
      success: true,
      data: detalles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching detalles movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener detalles de movimiento' },
      { status: 500 }
    )
  }
}

// POST /api/detalles-movimiento - Crear nuevo detalle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createDetalleSchema.parse(body)

    // Verificar que el movimiento existe
    const movimiento = await prisma.movimiento_inventario.findUnique({
      where: { id_movimiento: validatedData.id_movimiento }
    })

    if (!movimiento) {
      return NextResponse.json({
        success: false,
        message: 'El movimiento especificado no existe'
      }, { status: 400 })
    }

    // Verificar que el insumo existe
    const insumo = await prisma.insumo.findUnique({
      where: { id_insumo: validatedData.id_insumo }
    })

    if (!insumo) {
      return NextResponse.json({
        success: false,
        message: 'El insumo especificado no existe'
      }, { status: 400 })
    }

    // Verificar que no existe ya este detalle (mismo movimiento + insumo + lote)
    const existingDetalle = await prisma.detalle_movimiento_inventario.findFirst({
      where: {
        id_movimiento: validatedData.id_movimiento,
        id_insumo: validatedData.id_insumo,
        lote: validatedData.lote || null
      }
    })

    if (existingDetalle) {
      return NextResponse.json({
        success: false,
        message: 'Ya existe un detalle para este movimiento, insumo y lote'
      }, { status: 400 })
    }

    const nuevoDetalle = await prisma.detalle_movimiento_inventario.create({
      data: validatedData,
      include: {
        movimiento: {
          select: {
            id_movimiento: true,
            fecha_movimiento: true,
            numero_comprobante: true,
            tipo_movimiento: {
              select: {
                nombre_tipo: true,
                afecta_stock: true
              }
            }
          }
        },
        insumo: {
          select: {
            id_insumo: true,
            nombre_insumo: true,
            descripcion_insumo: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: nuevoDetalle,
      message: 'Detalle de movimiento creado exitosamente'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error creating detalle movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear detalle de movimiento' },
      { status: 500 }
    )
  }
}