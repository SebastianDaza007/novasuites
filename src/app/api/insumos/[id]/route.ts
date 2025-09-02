import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface Context {
  params: {
    id: string
  }
}

// GET /api/insumos/[id] - Obtener insumo específico
export async function GET(request: NextRequest, { params }: Context) {
  try {
    const id = parseInt(params.id)

    const insumo = await prisma.insumo.findUnique({
      where: { id_insumo: id },
      include: {
        categoria: true,
        proveedor: true,
        stock_depositos: {
          include: {
            deposito: true
          }
        },
        alertas: {
          where: {
            estado_alerta: 'ACTIVA'
          }
        }
      }
    })

    if (!insumo || !insumo.estado_insumo) {
      return NextResponse.json(
        { success: false, message: 'Insumo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: insumo
    })
  } catch (error) {
    console.error('Error fetching insumo:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener insumo' },
      { status: 500 }
    )
  }
}

// PUT /api/insumos/[id] - Actualizar insumo
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()

    const insumoActualizado = await prisma.insumo.update({
      where: { id_insumo: id },
      data: {
        ...body,
        fecha_expiracion: body.fecha_expiracion 
          ? new Date(body.fecha_expiracion) 
          : null
      },
      include: {
        categoria: true,
        proveedor: true
      }
    })

    return NextResponse.json({
      success: true,
      data: insumoActualizado,
      message: 'Insumo actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error updating insumo:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar insumo' },
      { status: 500 }
    )
  }
}

// DELETE /api/insumos/[id] - Eliminar insumo (soft delete)
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const id = parseInt(params.id)

    await prisma.insumo.update({
      where: { id_insumo: id },
      data: { estado_insumo: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Insumo eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting insumo:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar insumo' },
      { status: 500 }
    )
  }
}