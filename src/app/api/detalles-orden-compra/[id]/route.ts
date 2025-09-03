import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateDetalleSchema = z.object({
  cantidad_solicitada: z.number().int().positive('La cantidad solicitada debe ser mayor a 0').optional(),
  cantidad_recibida: z.number().int().min(0, 'La cantidad recibida no puede ser negativa').optional(),
  precio_unitario: z.number().positive('El precio unitario debe ser mayor a 0').optional()
}).transform((data, ctx) => {
  // Recalcular subtotal si se cambia cantidad o precio
  if (data.cantidad_solicitada !== undefined || data.precio_unitario !== undefined) {
    // Si no tenemos ambos valores, necesitamos obtenerlos de la BD en el endpoint
    return data
  }
  return data
})

// GET /api/detalles-orden-compra/[id] - Obtener detalle por ID
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

    const detalle = await prisma.detalle_orden_compra.findUnique({
      where: { id_detalle_orden: id },
      include: {
        orden_compra: {
          select: {
            id_orden_compra: true,
            numero_orden: true,
            fecha_orden: true,
            fecha_entrega_estimada: true,
            estado_orden: true,
            total_orden: true,
            observaciones: true,
            proveedor: {
              select: {
                id_proveedor: true,
                nombre_proveedor: true,
                cuit_proveedor: true,
                direccion_proveedor: true,
                telefono_proveedor: true,
                correo_proveedor: true
              }
            },
            usuario_solicita: {
              select: {
                id: true,
                email: true
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
            fecha_expiracion: true,
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
    })

    if (!detalle) {
      return NextResponse.json({
        success: false,
        message: 'Detalle de orden de compra no encontrado'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: detalle
    })
  } catch (error) {
    console.error('Error fetching detalle orden compra:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener detalle de orden de compra' },
      { status: 500 }
    )
  }
}

// PUT /api/detalles-orden-compra/[id] - Actualizar detalle
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
    const validatedData = updateDetalleSchema.parse(body)

    // Obtener el detalle actual
    const detalleExistente = await prisma.detalle_orden_compra.findUnique({
      where: { id_detalle_orden: id },
      include: {
        orden_compra: {
          select: {
            estado_orden: true,
            id_orden_compra: true
          }
        }
      }
    })

    if (!detalleExistente) {
      return NextResponse.json({
        success: false,
        message: 'Detalle de orden de compra no encontrado'
      }, { status: 404 })
    }

    // Verificar que la orden no esté en estado final
    if (['RECIBIDA_TOTAL', 'CANCELADA'].includes(detalleExistente.orden_compra.estado_orden)) {
      return NextResponse.json({
        success: false,
        message: 'No se puede modificar un detalle de orden completada o cancelada'
      }, { status: 400 })
    }

    // Validar cantidad recibida no mayor a solicitada
    const cantidadSolicitada = validatedData.cantidad_solicitada || detalleExistente.cantidad_solicitada
    const cantidadRecibida = validatedData.cantidad_recibida !== undefined 
      ? validatedData.cantidad_recibida 
      : detalleExistente.cantidad_recibida

    if (cantidadRecibida > cantidadSolicitada) {
      return NextResponse.json({
        success: false,
        message: 'La cantidad recibida no puede ser mayor a la solicitada'
      }, { status: 400 })
    }

    // Calcular subtotal
    const precioUnitario = validatedData.precio_unitario || detalleExistente.precio_unitario
    const subtotal = precioUnitario * cantidadSolicitada

    const dataToUpdate = {
      ...validatedData,
      subtotal
    }

    // Actualizar dentro de una transacción para recalcular total de orden
    const result = await prisma.$transaction(async (tx) => {
      const detalleActualizado = await tx.detalle_orden_compra.update({
        where: { id_detalle_orden: id },
        data: dataToUpdate,
        include: {
          orden_compra: {
            select: {
              id_orden_compra: true,
              numero_orden: true,
              estado_orden: true
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

      // Recalcular total de la orden
      const totalOrden = await tx.detalle_orden_compra.aggregate({
        where: { id_orden_compra: detalleExistente.orden_compra.id_orden_compra },
        _sum: { subtotal: true }
      })

      await tx.orden_compra.update({
        where: { id_orden_compra: detalleExistente.orden_compra.id_orden_compra },
        data: { total_orden: totalOrden._sum.subtotal || 0 }
      })

      return detalleActualizado
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Detalle de orden de compra actualizado exitosamente'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error updating detalle orden compra:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar detalle de orden de compra' },
      { status: 500 }
    )
  }
}

// DELETE /api/detalles-orden-compra/[id] - Eliminar detalle
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

    // Obtener el detalle y verificar estado
    const detalle = await prisma.detalle_orden_compra.findUnique({
      where: { id_detalle_orden: id },
      include: {
        orden_compra: {
          select: {
            estado_orden: true,
            id_orden_compra: true
          }
        }
      }
    })

    if (!detalle) {
      return NextResponse.json({
        success: false,
        message: 'Detalle de orden de compra no encontrado'
      }, { status: 404 })
    }

    // Verificar que la orden no esté en estado final
    if (['RECIBIDA_TOTAL', 'CANCELADA'].includes(detalle.orden_compra.estado_orden)) {
      return NextResponse.json({
        success: false,
        message: 'No se puede eliminar un detalle de orden completada o cancelada'
      }, { status: 400 })
    }

    // Eliminar y recalcular total
    await prisma.$transaction(async (tx) => {
      await tx.detalle_orden_compra.delete({
        where: { id_detalle_orden: id }
      })

      // Recalcular total de la orden
      const totalOrden = await tx.detalle_orden_compra.aggregate({
        where: { id_orden_compra: detalle.orden_compra.id_orden_compra },
        _sum: { subtotal: true }
      })

      await tx.orden_compra.update({
        where: { id_orden_compra: detalle.orden_compra.id_orden_compra },
        data: { total_orden: totalOrden._sum.subtotal || 0 }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Detalle de orden de compra eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting detalle orden compra:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar detalle de orden de compra' },
      { status: 500 }
    )
  }
}