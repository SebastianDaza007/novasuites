import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { z } from 'zod'

const updateDepositoSchema = z.object({
  nom_deposito: z.string().min(1, 'El nombre es requerido').optional(),
  tel_deposito: z.string().optional(),
  dir_deposito: z.string().optional(),
  responsable: z.string().optional(),
  estado_deposito: z.boolean().optional()
})

// GET /api/depositos/[id] - Obtener depósito por ID
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

    const deposito = await prisma.deposito.findUnique({
      where: { id_deposito: id },
      include: {
        stock_depositos: {
          include: {
            insumo: {
              select: {
                id_insumo: true,
                nombre_insumo: true,
                categoria: {
                  select: {
                    nombre_categoria: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            stock_depositos: true,
            alertas: true,
            movimientos_origen: true,
            movimientos_destino: true
          }
        }
      }
    })

    if (!deposito) {
      return NextResponse.json({
        success: false,
        message: 'Depósito no encontrado'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: deposito
    })
  } catch (error) {
    console.error('Error fetching deposito:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener depósito' },
      { status: 500 }
    )
  }
}

// PUT /api/depositos/[id] - Actualizar depósito
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
    const validatedData = updateDepositoSchema.parse(body)

    const depositoActualizado = await prisma.deposito.update({
      where: { id_deposito: id },
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: depositoActualizado,
      message: 'Depósito actualizado exitosamente'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error updating deposito:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar depósito' },
      { status: 500 }
    )
  }
}

// DELETE /api/depositos/[id] - Eliminar depósito
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

    // Verificar si tiene stock o movimientos asociados
    const deposito = await prisma.deposito.findUnique({
      where: { id_deposito: id },
      include: {
        _count: {
          select: {
            stock_depositos: true,
            movimientos_origen: true,
            movimientos_destino: true
          }
        }
      }
    })

    if (!deposito) {
      return NextResponse.json({
        success: false,
        message: 'Depósito no encontrado'
      }, { status: 404 })
    }

    if (deposito._count.stock_depositos > 0 || 
        deposito._count.movimientos_origen > 0 || 
        deposito._count.movimientos_destino > 0) {
      return NextResponse.json({
        success: false,
        message: 'No se puede eliminar el depósito porque tiene registros asociados'
      }, { status: 400 })
    }

    await prisma.deposito.delete({
      where: { id_deposito: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Depósito eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting deposito:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar depósito' },
      { status: 500 }
    )
  }
}