import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateRazonSchema = z.object({
  nombre_razon: z.string().min(1, 'El nombre de la razón es requerido').optional(),
  descripcion: z.string().optional(),
  id_tipo_movimiento: z.number().int().positive('ID del tipo de movimiento es requerido').optional()
})

// GET /api/razones-movimiento/[id] - Obtener razón por ID
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

    const razon = await prisma.razon_movimiento.findUnique({
      where: { id_razon: id },
      include: {
        tipo_movimiento: {
          select: {
            id_tipo_movimiento: true,
            nombre_tipo: true,
            descripcion: true,
            afecta_stock: true
          }
        },
        movimientos: {
          select: {
            id_movimiento: true,
            fecha_movimiento: true,
            estado_movimiento: true,
            numero_comprobante: true
          },
          orderBy: {
            fecha_movimiento: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            movimientos: true
          }
        }
      }
    })

    if (!razon) {
      return NextResponse.json({
        success: false,
        message: 'Razón de movimiento no encontrada'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: razon
    })
  } catch (error) {
    console.error('Error fetching razon movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener razón de movimiento' },
      { status: 500 }
    )
  }
}

// PUT /api/razones-movimiento/[id] - Actualizar razón
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
    const validatedData = updateRazonSchema.parse(body)

    // Verificar que la razón existe
    const razonExistente = await prisma.razon_movimiento.findUnique({
      where: { id_razon: id }
    })

    if (!razonExistente) {
      return NextResponse.json({
        success: false,
        message: 'Razón de movimiento no encontrada'
      }, { status: 404 })
    }

    // Si se está actualizando el tipo de movimiento, verificar que existe
    if (validatedData.id_tipo_movimiento) {
      const tipoMovimiento = await prisma.tipo_movimiento.findUnique({
        where: { id_tipo_movimiento: validatedData.id_tipo_movimiento }
      })

      if (!tipoMovimiento) {
        return NextResponse.json({
          success: false,
          message: 'El tipo de movimiento especificado no existe'
        }, { status: 400 })
      }
    }

    // Verificar duplicados si se cambia el nombre o tipo
    if (validatedData.nombre_razon || validatedData.id_tipo_movimiento) {
      const nombreRazon = validatedData.nombre_razon || razonExistente.nombre_razon
      const tipoMovimiento = validatedData.id_tipo_movimiento || razonExistente.id_tipo_movimiento

      const existingRazon = await prisma.razon_movimiento.findFirst({
        where: {
          nombre_razon: nombreRazon,
          id_tipo_movimiento: tipoMovimiento,
          NOT: { id_razon: id }
        }
      })

      if (existingRazon) {
        return NextResponse.json({
          success: false,
          message: 'Ya existe otra razón con este nombre para este tipo de movimiento'
        }, { status: 400 })
      }
    }

    const razonActualizada = await prisma.razon_movimiento.update({
      where: { id_razon: id },
      data: validatedData,
      include: {
        tipo_movimiento: {
          select: {
            id_tipo_movimiento: true,
            nombre_tipo: true,
            afecta_stock: true
          }
        },
        _count: {
          select: {
            movimientos: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: razonActualizada,
      message: 'Razón de movimiento actualizada exitosamente'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error updating razon movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar razón de movimiento' },
      { status: 500 }
    )
  }
}

// DELETE /api/razones-movimiento/[id] - Eliminar razón
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

    // Verificar si tiene movimientos asociados
    const razon = await prisma.razon_movimiento.findUnique({
      where: { id_razon: id },
      include: {
        _count: {
          select: {
            movimientos: true
          }
        }
      }
    })

    if (!razon) {
      return NextResponse.json({
        success: false,
        message: 'Razón de movimiento no encontrada'
      }, { status: 404 })
    }

    if (razon._count.movimientos > 0) {
      return NextResponse.json({
        success: false,
        message: 'No se puede eliminar la razón porque tiene movimientos asociados'
      }, { status: 400 })
    }

    await prisma.razon_movimiento.delete({
      where: { id_razon: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Razón de movimiento eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error deleting razon movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar razón de movimiento' },
      { status: 500 }
    )
  }
}