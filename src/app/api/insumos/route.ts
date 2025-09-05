import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const createInsumoSchema = z.object({
  nombre_insumo: z.string().min(1, 'El nombre es requerido'),
  descripcion_insumo: z.string().optional(),
  costo_unitario: z.number().positive('El costo debe ser positivo'),
  fecha_expiracion: z.string().datetime().optional(),
  id_categoria: z.number().int().positive('La categoría es requerida'),
  id_proveedor: z.number().optional(),
})

// GET /api/insumos - Listar todos los insumos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const categoria = searchParams.get('categoria')

    const where: Prisma.insumoWhereInput = {
      estado_insumo: true,
    }

    if (search) {
      where.nombre_insumo = {
        contains: search,
        mode: 'insensitive'
      }
    }

    if (categoria) {
      where.id_categoria = parseInt(categoria)
    }

    const [insumos, total] = await Promise.all([
      prisma.insumo.findMany({
        where,
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
          },
          stock_depositos: {
            include: {
              deposito: {
                select: {
                  id_deposito: true,
                  nom_deposito: true
                }
              }
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          fecha_creacion: 'desc'
        }
      }),
      prisma.insumo.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: insumos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching insumos:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener insumos' },
      { status: 500 }
    )
  }
}

// POST /api/insumos - Crear nuevo insumo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Body recibido:', body)
    
    const validatedData = createInsumoSchema.parse(body)
    console.log('Datos validados:', validatedData)

    // Verificar que la categoría existe
    if (validatedData.id_categoria) {
      const categoriaExiste = await prisma.categoria.findUnique({
        where: { id_categoria: validatedData.id_categoria }
      })
      
      if (!categoriaExiste) {
        return NextResponse.json({
          success: false,
          message: `La categoría con ID ${validatedData.id_categoria} no existe`
        }, { status: 400 })
      }
    }

    // Crear el insumo (el trigger se encarga automáticamente del movimiento)
    const nuevoInsumo = await prisma.insumo.create({
      data: {
        ...validatedData,
        fecha_expiracion: validatedData.fecha_expiracion 
          ? new Date(validatedData.fecha_expiracion) 
          : null
      },
      include: {
        categoria: true,
        proveedor: true
      }
    })

    return NextResponse.json({
      success: true,
      data: nuevoInsumo,
      message: 'Insumo creado exitosamente (movimiento registrado automáticamente)'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error de validación Zod:', error.issues)
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }

    // Log detallado del error para debugging
    console.error('Error creating insumo - Full error:', error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Error más específico basado en el tipo de error de Prisma
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({
          success: false,
          message: 'Error de relación: verifique que la categoría seleccionada existe'
        }, { status: 400 })
      }
      
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({
          success: false,
          message: 'Ya existe un insumo con ese nombre'
        }, { status: 400 })
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor al crear insumo',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}