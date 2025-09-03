import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { z } from 'zod'

const updateTipoMovimientoSchema = z.object({
  nombre_tipo: z.string().min(1, 'El nombre es requerido').optional(),
  descripcion: z.string().optional(),
  afecta_stock: z.enum(['POSITIVO', 'NEGATIVO', 'NEUTRO']).optional(),
  estado_tipo: z.boolean().optional()
})

// GET /api/tipos-movimiento/[id] - Obtener tipo de movimiento por ID
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

    const tipoMovimiento = await prisma.tipo_movimiento.findUnique({
      where: { id_tipo_movimiento: id },
      include: {
        razones: {
          orderBy: {
            nombre_razon: 'asc'
          }
        },
        _count: {
          select: {
            movimientos: true
          }
        }
      }
    })

    if (!tipoMovimiento) {
      return NextResponse.json({
        success: false,
        message: 'Tipo de movimiento no encontrado'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: tipoMovimiento
    })
  } catch (error) {
    console.error('Error fetching tipo movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener tipo de movimiento' },
      { status: 500 }
    )
  }
}

// PUT /api/tipos-movimiento/[id] - Actualizar tipo de movimiento
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
    const validatedData = updateTipoMovimientoSchema.parse(body)

    // Si se está actualizando el nombre, verificar que no esté duplicado
    if (validatedData.nombre_tipo) {
      const existingTipo = await prisma.tipo_movimiento.findFirst({
        where: { 
          nombre_tipo: validatedData.nombre_tipo,
          NOT: { id_tipo_movimiento: id }
        }
      })

      if (existingTipo) {
        return NextResponse.json({
          success: false,
          message: 'Ya existe otro tipo de movimiento con este nombre'
        }, { status: 400 })
      }
    }

    const tipoActualizado = await prisma.tipo_movimiento.update({
      where: { id_tipo_movimiento: id },
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: tipoActualizado,
      message: 'Tipo de movimiento actualizado exitosamente'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error updating tipo movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar tipo de movimiento' },
      { status: 500 }
    )
  }
}

// DELETE /api/tipos-movimiento/[id] - Eliminar tipo de movimiento
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
    const tipoMovimiento = await prisma.tipo_movimiento.findUnique({
      where: { id_tipo_movimiento: id },
      include: {
        _count: {
          select: {
            movimientos: true
          }
        }
      }
    })

    if (!tipoMovimiento) {
      return NextResponse.json({
        success: false,
        message: 'Tipo de movimiento no encontrado'
      }, { status: 404 })
    }

    if (tipoMovimiento._count.movimientos > 0) {
      return NextResponse.json({
        success: false,
        message: 'No se puede eliminar el tipo de movimiento porque tiene movimientos asociados'
      }, { status: 400 })
    }

    await prisma.tipo_movimiento.delete({
      where: { id_tipo_movimiento: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Tipo de movimiento eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting tipo movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar tipo de movimiento' },
      { status: 500 }
    )
  }
}