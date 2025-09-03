import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { z } from 'zod'

const createRoleSchema = z.object({
  name: z.string().min(1, 'El nombre del rol es requerido')
})

// GET /api/roles - Listar todos los roles
export async function GET(request: NextRequest) {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: roles
    })
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener roles' },
      { status: 500 }
    )
  }
}

// POST /api/roles - Crear nuevo rol
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createRoleSchema.parse(body)

    // Verificar que el nombre no esté duplicado
    const existingRole = await prisma.role.findUnique({
      where: { name: validatedData.name }
    })

    if (existingRole) {
      return NextResponse.json({
        success: false,
        message: 'Ya existe un rol con este nombre'
      }, { status: 400 })
    }

    const nuevoRole = await prisma.role.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: nuevoRole,
      message: 'Rol creado exitosamente'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error creating role:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear rol' },
      { status: 500 }
    )
  }
}