import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { z } from 'zod'

const updateOrdenCompraSchema = z.object({
  fecha_entrega_estimada: z.string().datetime().optional(),
  estado_orden: z.enum(['PENDIENTE', 'ENVIADA', 'RECIBIDA_PARCIAL', 'RECIBIDA_TOTAL', 'CANCELADA']).optional(),
  observaciones: z.string().optional()
})

// GET /api/ordenes-compra/[id] - Obtener orden de compra por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: 'ID inválido'
      }, { status: 400 })
    }

    const orden = await prisma.orden_compra.findUnique({
      where: { id_orden_compra: id },
      include: {
        proveedor: {
          select: {
            id_proveedor: true,
            nombre_proveedor: true,
            cuit_proveedor: true,
            direccion_proveedor: true,
            telefono_proveedor: true,
            correo_proveedor: true,
            contacto_responsable: true
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
              include: {
                categoria: {
                  select: {
                    id_categoria: true,
                    nombre_categoria: true
                  }
                },
                proveedor: {
                  select: {
                    nombre_proveedor: true
                  }
                }
              }
            }
          },
          orderBy: {
            insumo: { nombre_insumo: 'asc' }
          }
        },
        movimientos: {
          include: {
            tipo_movimiento: {
              select: {
                nombre_tipo: true
              }
            },
            deposito_destino: {
              select: {
                nom_deposito: true
              }
            }
          },
          orderBy: {
            fecha_movimiento: 'desc'
          }
        },
        facturas: {
          select: {
            id_factura: true,
            numero_factura: true,
            fecha_emision: true,
            monto_total: true,
            estado_factura: true
          }
        }
      }
    })

    if (!orden) {
      return NextResponse.json({
        success: false,
        message: 'Orden de compra no encontrada'
      }, { status: 404 })
    }

    // Calcular estadísticas
    const estadisticas = {
      total_items: orden.detalles.length,
      cantidad_total_solicitada: orden.detalles.reduce((sum, d) => sum + d.cantidad_solicitada, 0),
      cantidad_total_recibida: orden.detalles.reduce((sum, d) => sum + d.cantidad_recibida, 0),
      porcentaje_recibido: 0,
      items_pendientes: orden.detalles.filter(d => d.cantidad_recibida < d.cantidad_solicitada).length,
      total_movimientos: orden.movimientos.length,
      total_facturas: orden.facturas.length
    }

    if (estadisticas.cantidad_total_solicitada > 0) {
      estadisticas.porcentaje_recibido = Math.round(
        (estadisticas.cantidad_total_recibida / estadisticas.cantidad_total_solicitada) * 100
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...orden,
        estadisticas
      }
    })
  } catch (error) {
    console.error('Error fetching orden compra:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener orden de compra' },
      { status: 500 }
    )
  }
}

// PUT /api/ordenes-compra/[id] - Actualizar orden de compra
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: 'ID inválido'
      }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateOrdenCompraSchema.parse(body)

    const ordenActualizada = await prisma.orden_compra.update({
      where: { id_orden_compra: id },
      data: {
        ...validatedData,
        fecha_entrega_estimada: validatedData.fecha_entrega_estimada ? 
          new Date(validatedData.fecha_entrega_estimada) : undefined
      },
      include: {
        proveedor: {
          select: {
            nombre_proveedor: true
          }
        },
        detalles: {
          include: {
            insumo: {
              select: {
                nombre_insumo: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: ordenActualizada,
      message: 'Orden de compra actualizada exitosamente'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error updating orden compra:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar orden de compra' },
      { status: 500 }
    )
  }
}

// DELETE /api/ordenes-compra/[id] - Eliminar orden de compra (solo si está pendiente)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: 'ID inválido'
      }, { status: 400 })
    }

    const orden = await prisma.orden_compra.findUnique({
      where: { id_orden_compra: id },
      include: {
        _count: {
          select: {
            movimientos: true,
            facturas: true
          }
        }
      }
    })

    if (!orden) {
      return NextResponse.json({
        success: false,
        message: 'Orden de compra no encontrada'
      }, { status: 404 })
    }

    if (orden.estado_orden !== 'PENDIENTE') {
      return NextResponse.json({
        success: false,
        message: 'Solo se pueden eliminar órdenes pendientes'
      }, { status: 400 })
    }

    if (orden._count.movimientos > 0 || orden._count.facturas > 0) {
      return NextResponse.json({
        success: false,
        message: 'No se puede eliminar la orden porque tiene movimientos o facturas asociadas'
      }, { status: 400 })
    }

    // Eliminar en transacción (detalles se eliminan por CASCADE)
    await prisma.orden_compra.delete({
      where: { id_orden_compra: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Orden de compra eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error deleting orden compra:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar orden de compra' },
      { status: 500 }
    )
  }
}