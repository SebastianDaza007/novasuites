import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateDetalleSchema = z.object({
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0').optional(),
  costo_unitario: z.number().optional(),
  lote: z.string().optional(),
  fecha_vencimiento: z.string().optional().transform((val) => val ? new Date(val) : undefined)
})

// GET /api/detalles-movimiento/[id] - Obtener detalle por ID
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

    const detalle = await prisma.detalle_movimiento_inventario.findUnique({
      where: { id_detalle: id },
      include: {
        movimiento: {
          select: {
            id_movimiento: true,
            fecha_movimiento: true,
            numero_comprobante: true,
            observaciones: true,
            estado_movimiento: true,
            tipo_movimiento: {
              select: {
                nombre_tipo: true,
                descripcion: true,
                afecta_stock: true
              }
            },
            razon_movimiento: {
              select: {
                nombre_razon: true,
                descripcion: true
              }
            },
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
            usuario: {
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
            categoria: {
              select: {
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
      }
    })

    if (!detalle) {
      return NextResponse.json({
        success: false,
        message: 'Detalle de movimiento no encontrado'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: detalle
    })
  } catch (error) {
    console.error('Error fetching detalle movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener detalle de movimiento' },
      { status: 500 }
    )
  }
}

// PUT /api/detalles-movimiento/[id] - Actualizar detalle
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

    // Verificar que el detalle existe
    const detalleExistente = await prisma.detalle_movimiento_inventario.findUnique({
      where: { id_detalle: id },
      include: {
        movimiento: {
          select: {
            estado_movimiento: true
          }
        }
      }
    })

    if (!detalleExistente) {
      return NextResponse.json({
        success: false,
        message: 'Detalle de movimiento no encontrado'
      }, { status: 404 })
    }

    // Verificar que el movimiento no esté completado (opcional, según reglas de negocio)
    if (detalleExistente.movimiento.estado_movimiento === 'COMPLETADO') {
      return NextResponse.json({
        success: false,
        message: 'No se puede modificar un detalle de movimiento completado'
      }, { status: 400 })
    }

    const detalleActualizado = await prisma.detalle_movimiento_inventario.update({
      where: { id_detalle: id },
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
      data: detalleActualizado,
      message: 'Detalle de movimiento actualizado exitosamente'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error updating detalle movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar detalle de movimiento' },
      { status: 500 }
    )
  }
}

// DELETE /api/detalles-movimiento/[id] - Eliminar detalle
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

    // Verificar que el detalle existe
    const detalle = await prisma.detalle_movimiento_inventario.findUnique({
      where: { id_detalle: id },
      include: {
        movimiento: {
          select: {
            estado_movimiento: true
          }
        }
      }
    })

    if (!detalle) {
      return NextResponse.json({
        success: false,
        message: 'Detalle de movimiento no encontrado'
      }, { status: 404 })
    }

    // Verificar que el movimiento no esté completado
    if (detalle.movimiento.estado_movimiento === 'COMPLETADO') {
      return NextResponse.json({
        success: false,
        message: 'No se puede eliminar un detalle de movimiento completado'
      }, { status: 400 })
    }

    await prisma.detalle_movimiento_inventario.delete({
      where: { id_detalle: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Detalle de movimiento eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting detalle movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar detalle de movimiento' },
      { status: 500 }
    )
  }
}