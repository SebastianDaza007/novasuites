import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { z } from 'zod'

const createCategoriaSchema = z.object({
  nombre_categoria: z.string().min(1, 'El nombre es requerido'),
  descripcion_categoria: z.string().optional(),
  estado_categoria: z.boolean().default(true)
})

// GET /api/categorias - Listar todas las categorías
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const includeInsumos = searchParams.get('includeInsumos') === 'true'

    const where: any = {}
    if (estado !== null) {
      where.estado_categoria = estado === 'true'
    }

    const categorias = await prisma.categoria.findMany({
      where,
      include: {
        ...(includeInsumos && { insumos: true }),
        _count: {
          select: {
            insumos: true
          }
        }
      },
      orderBy: {
        nombre_categoria: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: categorias
    })
  } catch (error) {
    console.error('Error fetching categorias:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}

// POST /api/categorias - Crear nueva categoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createCategoriaSchema.parse(body)

    const nuevaCategoria = await prisma.categoria.create({
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: nuevaCategoria,
      message: 'Categoría creada exitosamente'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error creating categoria:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear categoría' },
      { status: 500 }
    )
  }
}