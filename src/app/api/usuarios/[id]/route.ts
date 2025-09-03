import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const updateUsuarioSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  roleId: z.number().int().positive('ID de rol inválido').optional()
})

// GET /api/usuarios/[id] - Obtener usuario por ID
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

    const usuario = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        created_at: true,
        updated_at: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true
          }
        },
        movimientos_inventario: {
          select: {
            id_movimiento: true,
            fecha_movimiento: true,
            tipo_movimiento: {
              select: {
                nombre_tipo: true
              }
            }
          },
          take: 10,
          orderBy: {
            fecha_movimiento: 'desc'
          }
        },
        ordenes_compra: {
          select: {
            id_orden_compra: true,
            numero_orden: true,
            fecha_orden: true,
            estado_orden: true
          },
          take: 10,
          orderBy: {
            fecha_orden: 'desc'
          }
        },
        alertas_asignadas: {
          where: {
            estado_alerta: 'ACTIVA'
          },
          select: {
            id_alerta: true,
            tipo_alerta: true,
            mensaje: true,
            insumo: {
              select: {
                nombre_insumo: true
              }
            },
            deposito: {
              select: {
                nom_deposito: true
              }
            }
          }
        },
        _count: {
          select: {
            movimientos_inventario: true,
            ordenes_compra: true,
            alertas_asignadas: true
          }
        }
      }
    })

    if (!usuario) {
      return NextResponse.json({
        success: false,
        message: 'Usuario no encontrado'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: usuario
    })
  } catch (error) {
    console.error('Error fetching usuario:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener usuario' },
      { status: 500 }
    )
  }
}

// PUT /api/usuarios/[id] - Actualizar usuario
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
    const validatedData = updateUsuarioSchema.parse(body)

    // Si se está actualizando el email, verificar duplicados
    if (validatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          email: validatedData.email,
          NOT: { id }
        }
      })

      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: 'Ya existe otro usuario con este email'
        }, { status: 400 })
      }
    }

    // Preparar datos para actualización
    const updateData: any = {}
    
    if (validatedData.email) {
      updateData.email = validatedData.email
    }
    
    if (validatedData.roleId) {
      updateData.roleId = validatedData.roleId
    }
    
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 10)
    }

    const usuarioActualizado = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        updated_at: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: usuarioActualizado,
      message: 'Usuario actualizado exitosamente'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error updating usuario:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

// DELETE /api/usuarios/[id] - Eliminar usuario
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

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting usuario:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}