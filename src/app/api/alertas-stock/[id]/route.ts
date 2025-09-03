import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { z } from 'zod'

const updateAlertaSchema = z.object({
  estado_alerta: z.enum(['ACTIVA', 'VISTA', 'RESUELTA']).optional(),
  id_usuario_asignado: z.number().int().positive().optional(),
  fecha_resolucion: z.string().datetime().optional()
})

// GET /api/alertas-stock/[id] - Obtener alerta por ID
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

    const alerta = await prisma.alerta_stock.findUnique({
      where: { id_alerta: id },
      include: {
        insumo: {
          select: {
            id_insumo: true,
            nombre_insumo: true,
            costo_unitario: true,
            categoria: {
              select: {
                id_categoria: true,
                nombre_categoria: true
              }
            },
            proveedor: {
              select: {
                id_proveedor: true,
                nombre_proveedor: true,
                telefono_proveedor: true
              }
            }
          }
        },
        deposito: {
          select: {
            id_deposito: true,
            nom_deposito: true,
            responsable: true
          }
        },
        usuario_asignado: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (!alerta) {
      return NextResponse.json({
        success: false,
        message: 'Alerta no encontrada'
      }, { status: 404 })
    }

    // Obtener stock actual para contexto
    const stockActual = await prisma.stock_deposito.findFirst({
      where: {
        id_insumo: alerta.id_insumo,
        id_deposito: alerta.id_deposito
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...alerta,
        stock_actual: stockActual
      }
    })
  } catch (error) {
    console.error('Error fetching alerta:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener alerta' },
      { status: 500 }
    )
  }
}

// PUT /api/alertas-stock/[id] - Actualizar alerta
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
    const validatedData = updateAlertaSchema.parse(body)

    // Si se está resolviendo la alerta, agregar fecha de resolución
    if (validatedData.estado_alerta === 'RESUELTA' && !validatedData.fecha_resolucion) {
      validatedData.fecha_resolucion = new Date().toISOString()
    }

    const alertaActualizada = await prisma.alerta_stock.update({
      where: { id_alerta: id },
      data: {
        ...validatedData,
        fecha_resolucion: validatedData.fecha_resolucion ? 
          new Date(validatedData.fecha_resolucion) : null
      },
      include: {
        insumo: {
          select: {
            nombre_insumo: true
          }
        },
        deposito: {
          select: {
            nom_deposito: true
          }
        },
        usuario_asignado: {
          select: {
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: alertaActualizada,
      message: 'Alerta actualizada exitosamente'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error updating alerta:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar alerta' },
      { status: 500 }
    )
  }
}

// DELETE /api/alertas-stock/[id] - Eliminar alerta
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

    const alerta = await prisma.alerta_stock.findUnique({
      where: { id_alerta: id }
    })

    if (!alerta) {
      return NextResponse.json({
        success: false,
        message: 'Alerta no encontrada'
      }, { status: 404 })
    }

    await prisma.alerta_stock.delete({
      where: { id_alerta: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Alerta eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error deleting alerta:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar alerta' },
      { status: 500 }
    )
  }
}