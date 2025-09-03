import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const createDetalleSchema = z.object({
  cantidad_solicitada: z.number().int().positive('La cantidad solicitada debe ser mayor a 0'),
  cantidad_recibida: z.number().int().min(0, 'La cantidad recibida no puede ser negativa').optional().default(0),
  precio_unitario: z.number().positive('El precio unitario debe ser mayor a 0'),
  id_orden_compra: z.number().int().positive('ID de la orden de compra es requerido'),
  id_insumo: z.number().int().positive('ID del insumo es requerido')
}).transform((data) => ({
  ...data,
  subtotal: data.precio_unitario * data.cantidad_solicitada
}))

// GET /api/detalles-orden-compra - Listar detalles de órdenes de compra
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ordenCompraId = searchParams.get('orden_compra_id')
    const insumoId = searchParams.get('insumo_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const whereClause: Prisma.detalle_orden_compraWhereInput = {}
    
    if (ordenCompraId) {
      whereClause.id_orden_compra = parseInt(ordenCompraId)
    }
    
    if (insumoId) {
      whereClause.id_insumo = parseInt(insumoId)
    }

    const [detalles, total] = await Promise.all([
      prisma.detalle_orden_compra.findMany({
        where: whereClause,
        include: {
          orden_compra: {
            select: {
              id_orden_compra: true,
              numero_orden: true,
              fecha_orden: true,
              fecha_entrega_estimada: true,
              estado_orden: true,
              total_orden: true,
              proveedor: {
                select: {
                  nombre_proveedor: true,
                  cuit_proveedor: true
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
                  nombre_categoria: true
                }
              }
            }
          }
        },
        orderBy: [
          { id_orden_compra: 'desc' },
          { id_detalle_orden: 'asc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.detalle_orden_compra.count({
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
    console.error('Error fetching detalles orden compra:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener detalles de órdenes de compra' },
      { status: 500 }
    )
  }
}

// POST /api/detalles-orden-compra - Crear nuevo detalle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createDetalleSchema.parse(body)

    // Verificar que la orden de compra existe y no esté en estado final
    const ordenCompra = await prisma.orden_compra.findUnique({
      where: { id_orden_compra: validatedData.id_orden_compra }
    })

    if (!ordenCompra) {
      return NextResponse.json({
        success: false,
        message: 'La orden de compra especificada no existe'
      }, { status: 400 })
    }

    if (['RECIBIDA_TOTAL', 'CANCELADA'].includes(ordenCompra.estado_orden)) {
      return NextResponse.json({
        success: false,
        message: 'No se pueden agregar detalles a una orden completada o cancelada'
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

    // Verificar que no existe ya este detalle (misma orden + insumo)
    const existingDetalle = await prisma.detalle_orden_compra.findFirst({
      where: {
        id_orden_compra: validatedData.id_orden_compra,
        id_insumo: validatedData.id_insumo
      }
    })

    if (existingDetalle) {
      return NextResponse.json({
        success: false,
        message: 'Ya existe un detalle para esta orden y este insumo'
      }, { status: 400 })
    }

    // Crear el detalle y actualizar el total de la orden
    const result = await prisma.$transaction(async (tx) => {
      const nuevoDetalle = await tx.detalle_orden_compra.create({
        data: validatedData,
        include: {
          orden_compra: {
            select: {
              id_orden_compra: true,
              numero_orden: true,
              estado_orden: true,
              proveedor: {
                select: {
                  nombre_proveedor: true
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

      // Actualizar el total de la orden
      const totalOrden = await tx.detalle_orden_compra.aggregate({
        where: { id_orden_compra: validatedData.id_orden_compra },
        _sum: { subtotal: true }
      })

      await tx.orden_compra.update({
        where: { id_orden_compra: validatedData.id_orden_compra },
        data: { total_orden: totalOrden._sum.subtotal || 0 }
      })

      return nuevoDetalle
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Detalle de orden de compra creado exitosamente'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error creating detalle orden compra:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear detalle de orden de compra' },
      { status: 500 }
    )
  }
}