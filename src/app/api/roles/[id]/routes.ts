import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { z } from 'zod'

const updateRoleSchema = z.object({
  name: z.string().min(1, 'El nombre del rol es requerido').optional()
})

// GET /api/roles/[id] - Obtener rol por ID
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

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            created_at: true
          },
          orderBy: {
            created_at: 'desc'
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    if (!role) {
      return NextResponse.json({
        success: false,
        message: 'Rol no encontrado'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: role
    })
  } catch (error) {
    console.error('Error fetching role:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener rol' },
      { status: 500 }
    )
  }
}

// PUT /api/roles/[id] - Actualizar rol
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
    const validatedData = updateRoleSchema.parse(body)

    // Si se está actualizando el nombre, verificar duplicados
    if (validatedData.name) {
      const existingRole = await prisma.role.findFirst({
        where: { 
          name: validatedData.name,
          NOT: { id }
        }
      })

      if (existingRole) {
        return NextResponse.json({
          success: false,
          message: 'Ya existe otro rol con este nombre'
        }, { status: 400 })
      }
    }

    const roleActualizado = await prisma.role.update({
      where: { id },
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
      data: roleActualizado,
      message: 'Rol actualizado exitosamente'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error updating role:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar rol' },
      { status: 500 }
    )
  }
}

// DELETE /api/roles/[id] - Eliminar rol
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

    // Verificar si tiene usuarios asociados
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    if (!role) {
      return NextResponse.json({
        success: false,
        message: 'Rol no encontrado'
      }, { status: 404 })
    }

    if (role._count.users > 0) {
      return NextResponse.json({
        success: false,
        message: 'No se puede eliminar el rol porque tiene usuarios asociados'
      }, { status: 400 })
    }

    await prisma.role.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Rol eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar rol' },
      { status: 500 }
    )
  }
}