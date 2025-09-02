import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { z } from 'zod'

const detalleOrdenSchema = z.object({
  id_insumo: z.number().int().positive('ID de insumo inválido'),
  cantidad_solicitada: z.number().int().positive('La cantidad debe ser positiva'),
  precio_unitario: z.number().positive('El precio debe ser positivo')
})

const createOrdenCompraSchema = z.object({
  numero_orden: z.string().min(1, 'El número de orden es requerido'),
  id_proveedor: z.number().int().positive('ID de proveedor inválido'),
  id_usuario_solicita: z.number().int().positive('ID de usuario inválido'),
  fecha_entrega_estimada: z.string().datetime().optional(),
  estado_orden: z.enum(['PENDIENTE', 'ENVIADA', 'RECIBIDA_PARCIAL', 'RECIBIDA_TOTAL', 'CANCELADA']).default('PENDIENTE'),
  observaciones: z.string().optional(),
  detalles: z.array(detalleOrdenSchema).min(1, 'Debe incluir al menos un detalle')
})

// GET /api/ordenes-compra - Listar órdenes de compra
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const estado = searchParams.get('estado')
    const proveedorId = searchParams.get('proveedor')
    const fechaDesde = searchParams.get('fechaDesde')
    const fechaHasta = searchParams.get('fechaHasta')

    const where: any = {}

    if (estado) {
      where.estado_orden = estado
    }

    if (proveedorId) {
      where.id_proveedor = parseInt(proveedorId)
    }

    if (fechaDesde || fechaHasta) {
      where.fecha_orden = {}
      if (fechaDesde) {
        where.fecha_orden.gte = new Date(fechaDesde)
      }
      if (fechaHasta) {
        where.fecha_orden.lte = new Date(fechaHasta)
      }
    }

    const [ordenes, total] = await Promise.all([
      prisma.orden_compra.findMany({
        where,
        include: {
          proveedor: {
            select: {
              id_proveedor: true,
              nombre_proveedor: true
            }
          },
          usuario_solicita: {
            select: {
              id: true,
              email: true
            }
          },
          detalles: {
            include: {
              insumo: {
                select: {
                  id_insumo: true,
                  nombre_insumo: true
                }
              }
            }
          },
          _count: {
            select: {
              movimientos: true,
              facturas: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          fecha_orden: 'desc'
        }
      }),
      prisma.orden_compra.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: ordenes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching ordenes compra:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener órdenes de compra' },
      { status: 500 }
    )
  }
}

// POST /api/ordenes-compra - Crear nueva orden de compra
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createOrdenCompraSchema.parse(body)

    // Verificar que el número de orden no esté duplicado
    const existingOrden = await prisma.orden_compra.findUnique({
      where: { numero_orden: validatedData.numero_orden }
    })

    if (existingOrden) {
      return NextResponse.json({
        success: false,
        message: 'Ya existe una orden con este número'
      }, { status: 400 })
    }

    // Calcular el total de la orden
    const total = validatedData.detalles.reduce((sum, detalle) => 
      sum + (detalle.cantidad_solicitada * detalle.precio_unitario), 0
    )

    // Crear la orden con sus detalles en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const orden = await tx.orden_compra.create({
        data: {
          numero_orden: validatedData.numero_orden,
          id_proveedor: validatedData.id_proveedor,
          id_usuario_solicita: validatedData.id_usuario_solicita,
          fecha_entrega_estimada: validatedData.fecha_entrega_estimada ? 
            new Date(validatedData.fecha_entrega_estimada) : null,
          estado_orden: validatedData.estado_orden,
          observaciones: validatedData.observaciones,
          total_orden: total
        }
      })

      // Crear los detalles
      const detalles = await Promise.all(
        validatedData.detalles.map(detalle =>
          tx.detalle_orden_compra.create({
            data: {
              id_orden_compra: orden.id_orden_compra,
              id_insumo: detalle.id_insumo,
              cantidad_solicitada: detalle.cantidad_solicitada,
              precio_unitario: detalle.precio_unitario,
              subtotal: detalle.cantidad_solicitada * detalle.precio_unitario
            }
          })
        )
      )

      return { orden, detalles }
    })

    return NextResponse.json({
      success: true,
      data: result.orden,
      message: 'Orden de compra creada exitosamente'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error creating orden compra:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear orden de compra' },
      { status: 500 }
    )
  }
}