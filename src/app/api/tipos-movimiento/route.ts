import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const createTipoMovimientoSchema = z.object({
  nombre_tipo: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  afecta_stock: z.enum(['POSITIVO', 'NEGATIVO', 'NEUTRO']),
  estado_tipo: z.boolean().default(true)
})

// GET /api/tipos-movimiento - Listar tipos de movimiento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')

    const where: Prisma.tipo_movimientoWhereInput = {}
    if (estado !== null) {
      where.estado_tipo = estado === 'true'
    }

    const tiposMovimiento = await prisma.tipo_movimiento.findMany({
      where,
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
      },
      orderBy: {
        nombre_tipo: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: tiposMovimiento
    })
  } catch (error) {
    console.error('Error fetching tipos movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener tipos de movimiento' },
      { status: 500 }
    )
  }
}

// POST /api/tipos-movimiento - Crear nuevo tipo de movimiento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTipoMovimientoSchema.parse(body)

    // Verificar que el nombre no esté duplicado
    const existingTipo = await prisma.tipo_movimiento.findUnique({
      where: { nombre_tipo: validatedData.nombre_tipo }
    })

    if (existingTipo) {
      return NextResponse.json({
        success: false,
        message: 'Ya existe un tipo de movimiento con este nombre'
      }, { status: 400 })
    }

    const nuevoTipo = await prisma.tipo_movimiento.create({
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: nuevoTipo,
      message: 'Tipo de movimiento creado exitosamente'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error creating tipo movimiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear tipo de movimiento' },
      { status: 500 }
    )
  }
}

// PUT /api/tipos-movimiento/:id - Actualizar tipo de movimiento
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const id = Number(searchParams.get('id'))

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID de tipo de movimiento requerido'
      }, { status: 400 })
    }

    const validatedData = createTipoMovimientoSchema.parse(body)

    // Verificar que el tipo de movimiento existe
    const existingTipo = await prisma.tipo_movimiento.findUnique({
      where: { id_tipo_movimiento: id }
    })

    if (!existingTipo) {
      return NextResponse.json({
        success: false,
        message: 'Tipo de movimiento no encontrado'
      }, { status: 404 })
    }

    // Verificar que el nuevo nombre no esté duplicado
    if (validatedData.nombre_tipo !== existingTipo.nombre_tipo) {
      const duplicateName = await prisma.tipo_movimiento.findUnique({
        where: { nombre_tipo: validatedData.nombre_tipo }
      })

      if (duplicateName) {
        return NextResponse.json({
          success: false,
          message: 'Ya existe un tipo de movimiento con este nombre'
        }, { status: 400 })
      }
    }

    const updatedTipo = await prisma.tipo_movimiento.update({
      where: { id_tipo_movimiento: id },
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: updatedTipo,
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

// DELETE /api/tipos-movimiento/:id - Eliminar tipo de movimiento
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = Number(searchParams.get('id'))

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID de tipo de movimiento requerido'
      }, { status: 400 })
    }

    // Verificar si tiene movimientos asociados
    const tipoWithRelations = await prisma.tipo_movimiento.findUnique({
      where: { id_tipo_movimiento: id },
      include: {
        _count: {
          select: {
            movimientos: true,
            razones: true
          }
        }
      }
    })

    if (!tipoWithRelations) {
      return NextResponse.json({
        success: false,
        message: 'Tipo de movimiento no encontrado'
      }, { status: 404 })
    }

    if (tipoWithRelations._count.movimientos > 0) {
      // Si tiene movimientos, hacer borrado lógico
      await prisma.tipo_movimiento.update({
        where: { id_tipo_movimiento: id },
        data: { estado_tipo: false }
      })

      return NextResponse.json({
        success: true,
        message: 'Tipo de movimiento desactivado exitosamente'
      })
    }

    // Si no tiene movimientos, hacer borrado físico
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