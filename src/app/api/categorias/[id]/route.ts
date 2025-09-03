import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { z } from 'zod'

const updateCategoriaSchema = z.object({
  nombre_categoria: z.string().min(1, 'El nombre es requerido').optional(),
  descripcion_categoria: z.string().optional(),
  estado_categoria: z.boolean().optional()
})

// GET /api/categorias/[id] - Obtener categoría por ID
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

    const { searchParams } = new URL(request.url)
    const includeInsumos = searchParams.get('includeInsumos') === 'true'

    const categoria = await prisma.categoria.findUnique({
      where: { id_categoria: id },
      include: {
        ...(includeInsumos && { insumos: true }),
        _count: {
          select: {
            insumos: true
          }
        }
      }
    })

    if (!categoria) {
      return NextResponse.json({
        success: false,
        message: 'Categoría no encontrada'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: categoria
    })
  } catch (error) {
    console.error('Error fetching categoria:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener categoría' },
      { status: 500 }
    )
  }
}

// PUT /api/categorias/[id] - Actualizar categoría
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
    const validatedData = updateCategoriaSchema.parse(body)

    const categoriaActualizada = await prisma.categoria.update({
      where: { id_categoria: id },
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: categoriaActualizada,
      message: 'Categoría actualizada exitosamente'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error updating categoria:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar categoría' },
      { status: 500 }
    )
  }
}

// DELETE /api/categorias/[id] - Eliminar categoría
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

    // Verificar si tiene insumos asociados
    const categoria = await prisma.categoria.findUnique({
      where: { id_categoria: id },
      include: {
        _count: {
          select: { insumos: true }
        }
      }
    })

    if (!categoria) {
      return NextResponse.json({
        success: false,
        message: 'Categoría no encontrada'
      }, { status: 404 })
    }

    if (categoria._count.insumos > 0) {
      return NextResponse.json({
        success: false,
        message: 'No se puede eliminar la categoría porque tiene insumos asociados'
      }, { status: 400 })
    }

    await prisma.categoria.delete({
      where: { id_categoria: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error deleting categoria:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar categoría' },
      { status: 500 }
    )
  }
}