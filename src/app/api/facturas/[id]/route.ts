import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { z } from 'zod'

const updateFacturaSchema = z.object({
  numero_factura: z.string().min(1, 'El número de factura es requerido').optional(),
  fecha_emision: z.string().datetime('Fecha de emisión inválida').optional(),
  fecha_vencimiento: z.string().datetime('Fecha de vencimiento inválida').optional(),
  monto_total: z.number().positive('El monto debe ser positivo').optional(),
  estado_factura: z.enum(['PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA']).optional(),
  observaciones: z.string().optional()
})

// GET /api/facturas/[id] - Obtener factura por ID
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

    const factura = await prisma.factura_proveedor.findUnique({
      where: { id_factura: id },
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
        orden_compra: {
          include: {
            detalles: {
              include: {
                insumo: {
                  select: {
                    nombre_insumo: true,
                    categoria: {
                      select: {
                        nombre_categoria: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!factura) {
      return NextResponse.json({
        success: false,
        message: 'Factura no encontrada'
      }, { status: 404 })
    }

    // Agregar información calculada
    const fechaVencimiento = new Date(factura.fecha_vencimiento)
    const hoy = new Date()
    const diasParaVencimiento = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

    const facturaConInfo = {
      ...factura,
      dias_para_vencimiento: diasParaVencimiento,
      esta_vencida: diasParaVencimiento < 0 && factura.estado_factura === 'PENDIENTE',
      esta_por_vencer: diasParaVencimiento <= 7 && diasParaVencimiento >= 0 && factura.estado_factura === 'PENDIENTE'
    }

    return NextResponse.json({
      success: true,
      data: facturaConInfo
    })
  } catch (error) {
    console.error('Error fetching factura:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener factura' },
      { status: 500 }
    )
  }
}

// PUT /api/facturas/[id] - Actualizar factura
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
    const validatedData = updateFacturaSchema.parse(body)

    // Si se está actualizando el número de factura, verificar duplicados
    if (validatedData.numero_factura) {
      const facturaActual = await prisma.factura_proveedor.findUnique({
        where: { id_factura: id }
      })

      if (!facturaActual) {
        return NextResponse.json({
          success: false,
          message: 'Factura no encontrada'
        }, { status: 404 })
      }

      const existingFactura = await prisma.factura_proveedor.findFirst({
        where: { 
          numero_factura: validatedData.numero_factura,
          id_proveedor: facturaActual.id_proveedor,
          NOT: { id_factura: id }
        }
      })

      if (existingFactura) {
        return NextResponse.json({
          success: false,
          message: 'Ya existe otra factura con este número para el proveedor'
        }, { status: 400 })
      }
    }

    const facturaActualizada = await prisma.factura_proveedor.update({
      where: { id_factura: id },
      data: {
        ...validatedData,
        fecha_emision: validatedData.fecha_emision ? 
          new Date(validatedData.fecha_emision) : undefined,
        fecha_vencimiento: validatedData.fecha_vencimiento ? 
          new Date(validatedData.fecha_vencimiento) : undefined
      },
      include: {
        proveedor: {
          select: {
            nombre_proveedor: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: facturaActualizada,
      message: 'Factura actualizada exitosamente'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error updating factura:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar factura' },
      { status: 500 }
    )
  }
}

// DELETE /api/facturas/[id] - Eliminar factura
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

    const factura = await prisma.factura_proveedor.findUnique({
      where: { id_factura: id }
    })

    if (!factura) {
      return NextResponse.json({
        success: false,
        message: 'Factura no encontrada'
      }, { status: 404 })
    }

    if (factura.estado_factura === 'PAGADA') {
      return NextResponse.json({
        success: false,
        message: 'No se puede eliminar una factura pagada'
      }, { status: 400 })
    }

    await prisma.factura_proveedor.delete({
      where: { id_factura: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Factura eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error deleting factura:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar factura' },
      { status: 500 }
    )
  }
}