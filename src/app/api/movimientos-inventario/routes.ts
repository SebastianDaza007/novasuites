import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { z } from 'zod'

const detalleMovimientoSchema = z.object({
  id_insumo: z.number().int().positive('ID de insumo inválido'),
  cantidad: z.number().int().positive('La cantidad debe ser positiva'),
  costo_unitario: z.number().optional(),
  lote: z.string().optional(),
  fecha_vencimiento: z.string().datetime().optional()
})

const createMovimientoInventarioSchema = z.object({
  id_deposito_origen: z.number().int().positive().optional(),
  id_deposito_destino: z.number().int().positive().optional(),
  id_tipo_movimiento: z.number().int().positive('ID de tipo de movimiento inválido'),
  id_razon_movimiento: z.number().int().positive().optional(),
  id_usuario: z.number().int().positive('ID de usuario inválido'),
  id_orden_compra: z.number().int().positive().optional(),
  numero_comprobante: z.string().optional(),
  observaciones: z.string().optional(),
  estado_movimiento: z.enum(['PENDIENTE', 'COMPLETADO', 'CANCELADO']).default('PENDIENTE'),
  detalles: z.array(detalleMovimientoSchema).min(1, 'Debe incluir al menos un detalle')
})

// GET /api/movimientos-inventario - Listar movimientos de inventario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const depositoId = searchParams.get('deposito')
    const tipoMovimientoId = searchParams.get('tipoMovimiento')
    const estado = searchParams.get('estado')
    const fechaDesde = searchParams.get('fechaDesde')
    const fechaHasta = searchParams.get('fechaHasta')

    const where: any = {}

    if (depositoId) {
      where.OR = [
        { id_deposito_origen: parseInt(depositoId) },
        { id_deposito_destino: parseInt(depositoId) }
      ]
    }

    if (tipoMovimientoId) {
      where.id_tipo_movimiento = parseInt(tipoMovimientoId)
    }

    if (estado) {
      where.estado_movimiento = estado
    }

    if (fechaDesde || fechaHasta) {
      where.fecha_movimiento = {}
      if (fechaDesde) {
        where.fecha_movimiento.gte = new Date(fechaDesde)
      }
      if (fechaHasta) {
        where.fecha_movimiento.lte = new Date(fechaHasta)
      }
    }

    const [movimientos, total] = await Promise.all([
      prisma.movimiento_inventario.findMany({
        where,
        include: {
          deposito_origen: {
            select: {
              id_deposito: true,
              nom_deposito: true
            }
          },
          deposito_destino: {
            select: {
              id_deposito: true,
              nom_deposito: true
            }
          },
          tipo_movimiento: true,
          razon_movimiento: true,
          usuario: {
            select: {
              id: true,
              email: true
            }
          },
          orden_compra: {
            select: {
              id_orden_compra: true,
              numero_orden: true
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
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          fecha_movimiento: 'desc'
        }
      }),
      prisma.movimiento_inventario.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: movimientos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching movimientos inventario:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener movimientos de inventario' },
      { status: 500 }
    )
  }
}

// POST /api/movimientos-inventario - Crear nuevo movimiento de inventario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createMovimientoInventarioSchema.parse(body)

    // Crear el movimiento con sus detalles en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const movimiento = await tx.movimiento_inventario.create({
        data: {
          id_deposito_origen: validatedData.id_deposito_origen,
          id_deposito_destino: validatedData.id_deposito_destino,
          id_tipo_movimiento: validatedData.id_tipo_movimiento,
          id_razon_movimiento: validatedData.id_razon_movimiento,
          id_usuario: validatedData.id_usuario,
          id_orden_compra: validatedData.id_orden_compra,
          numero_comprobante: validatedData.numero_comprobante,
          observaciones: validatedData.observaciones,
          estado_movimiento: validatedData.estado_movimiento
        }
      })

      const detalles = await Promise.all(
        validatedData.detalles.map(detalle =>
          tx.detalle_movimiento_inventario.create({
            data: {
              id_movimiento: movimiento.id_movimiento,
              id_insumo: detalle.id_insumo,
              cantidad: detalle.cantidad,
              costo_unitario: detalle.costo_unitario,
              lote: detalle.lote,
              fecha_vencimiento: detalle.fecha_vencimiento ? 
                new Date(detalle.fecha_vencimiento) : null
            }
          })
        )
      )

      // Si el movimiento está completado, actualizar stock
      if (validatedData.estado_movimiento === 'COMPLETADO') {
        await actualizarStock(tx, movimiento, validatedData.detalles)
      }

      return { movimiento, detalles }
    })

    return NextResponse.json({
      success: true,
      data: result.movimiento,
      message: 'Movimiento de inventario creado exitosamente'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error creating movimiento inventario:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear movimiento de inventario' },
      { status: 500 }
    )
  }
}

// Función auxiliar para actualizar stock
async function actualizarStock(tx: any, movimiento: any, detalles: any[]) {
  const tipoMovimiento = await tx.tipo_movimiento.findUnique({
    where: { id_tipo_movimiento: movimiento.id_tipo_movimiento }
  })

  for (const detalle of detalles) {
    // Actualizar stock según el tipo de movimiento
    if (tipoMovimiento.afecta_stock === 'POSITIVO') {
      // Ingreso - aumentar stock en depósito destino
      if (movimiento.id_deposito_destino) {
        await tx.stock_deposito.upsert({
          where: {
            id_deposito_id_insumo: {
              id_deposito: movimiento.id_deposito_destino,
              id_insumo: detalle.id_insumo
            }
          },
          update: {
            cantidad_actual: {
              increment: detalle.cantidad
            },
            fecha_ultimo_mov: new Date()
          },
          create: {
            id_deposito: movimiento.id_deposito_destino,
            id_insumo: detalle.id_insumo,
            cantidad_actual: detalle.cantidad,
            fecha_ultimo_mov: new Date()
          }
        })
      }
    } else if (tipoMovimiento.afecta_stock === 'NEGATIVO') {
      // Salida - disminuir stock en depósito origen
      if (movimiento.id_deposito_origen) {
        await tx.stock_deposito.updateMany({
          where: {
            id_deposito: movimiento.id_deposito_origen,
            id_insumo: detalle.id_insumo
          },
          data: {
            cantidad_actual: {
              decrement: detalle.cantidad
            },
            fecha_ultimo_mov: new Date()
          }
        })
      }
    }
    // NEUTRO no afecta el stock (ej: transferencias internas)
  }
}