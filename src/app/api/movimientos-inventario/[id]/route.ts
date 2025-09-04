import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { z } from 'zod'

const updateMovimientoSchema = z.object({
  numero_comprobante: z.string().optional(),
  observaciones: z.string().optional(),
  estado_movimiento: z.enum(['PENDIENTE', 'COMPLETADO', 'CANCELADO']).optional()
})

// GET /api/movimientos-inventario/[id] - Obtener movimiento por ID
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

    const movimiento = await prisma.movimiento_inventario.findUnique({
      where: { id_movimiento: id },
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
            numero_orden: true,
            proveedor: {
              select: {
                nombre_proveedor: true
              }
            }
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
                    id_proveedor: true,
                    nombre_proveedor: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!movimiento) {
      return NextResponse.json({
        success: false,
        message: 'Movimiento no encontrado'
      }, { status: 404 })
    }

    // Agregar información calculada
    const movimientoConInfo = {
      ...movimiento,
      total_insumos: movimiento.detalles.length,
      total_cantidad: movimiento.detalles.reduce((sum, detalle) => sum + detalle.cantidad, 0),
      costo_total: movimiento.detalles.reduce((sum, detalle) => 
        sum + (detalle.cantidad * Number(detalle.costo_unitario || 0)), 0)
    }

    return NextResponse.json({
      success: true,
      data: movimientoConInfo
    })
  } catch (error) {
    console.error('Error fetching movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener movimiento' },
      { status: 500 }
    )
  }
}

// PUT /api/movimientos-inventario/[id] - Actualizar movimiento
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
    const validatedData = updateMovimientoSchema.parse(body)

    // Verificar que el movimiento existe
    const movimientoExistente = await prisma.movimiento_inventario.findUnique({
      where: { id_movimiento: id },
      include: {
        tipo_movimiento: true,
        detalles: true
      }
    })

    if (!movimientoExistente) {
      return NextResponse.json({
        success: false,
        message: 'Movimiento no encontrado'
      }, { status: 404 })
    }

    // Si se está cambiando el estado a COMPLETADO y antes no lo estaba, actualizar stock
    const actualizarStock = validatedData.estado_movimiento === 'COMPLETADO' && 
                           movimientoExistente.estado_movimiento !== 'COMPLETADO'

    const result = await prisma.$transaction(async (tx) => {
      const movimientoActualizado = await tx.movimiento_inventario.update({
        where: { id_movimiento: id },
        data: validatedData,
        include: {
          deposito_origen: true,
          deposito_destino: true,
          tipo_movimiento: true,
          detalles: {
            include: {
              insumo: true
            }
          }
        }
      })

      // Actualizar stock si es necesario
      if (actualizarStock) {
        for (const detalle of movimientoActualizado.detalles) {
          if (movimientoActualizado.tipo_movimiento.afecta_stock === 'POSITIVO' && 
              movimientoActualizado.id_deposito_destino) {
            // Incrementar stock en depósito destino
            await tx.stock_deposito.upsert({
              where: {
                id_deposito_id_insumo: {
                  id_deposito: movimientoActualizado.id_deposito_destino,
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
                id_deposito: movimientoActualizado.id_deposito_destino,
                id_insumo: detalle.id_insumo,
                cantidad_actual: detalle.cantidad,
                fecha_ultimo_mov: new Date()
              }
            })
          } else if (movimientoActualizado.tipo_movimiento.afecta_stock === 'NEGATIVO' && 
                     movimientoActualizado.id_deposito_origen) {
            // Decrementar stock en depósito origen
            await tx.stock_deposito.updateMany({
              where: {
                id_deposito: movimientoActualizado.id_deposito_origen,
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
      }

      return movimientoActualizado
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Movimiento actualizado exitosamente'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error updating movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar movimiento' },
      { status: 500 }
    )
  }
}

// DELETE /api/movimientos-inventario/[id] - Eliminar movimiento (solo si está pendiente)
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

    const movimiento = await prisma.movimiento_inventario.findUnique({
      where: { id_movimiento: id }
    })

    if (!movimiento) {
      return NextResponse.json({
        success: false,
        message: 'Movimiento no encontrado'
      }, { status: 404 })
    }

    if (movimiento.estado_movimiento === 'COMPLETADO') {
      return NextResponse.json({
        success: false,
        message: 'No se puede eliminar un movimiento completado'
      }, { status: 400 })
    }

    // Eliminar en transacción (detalles se eliminan por CASCADE)
    await prisma.movimiento_inventario.delete({
      where: { id_movimiento: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Movimiento eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar movimiento' },
      { status: 500 }
    )
  }
}