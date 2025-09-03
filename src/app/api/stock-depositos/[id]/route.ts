import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateStockSchema = z.object({
  cantidad_actual: z.number().int().min(0, 'La cantidad actual no puede ser negativa').optional(),
  stock_minimo: z.number().int().min(0, 'El stock mínimo no puede ser negativo').optional(),
  stock_critico: z.number().int().min(0, 'El stock crítico no puede ser negativo').optional(),
  fecha_ultimo_mov: z.string().optional().transform((val) => val ? new Date(val) : undefined)
}).refine((data) => {
  if (data.stock_minimo !== undefined && data.stock_critico !== undefined) {
    return data.stock_critico <= data.stock_minimo
  }
  return true
}, {
  message: "El stock crítico debe ser menor o igual al stock mínimo",
  path: ["stock_critico"]
})

// GET /api/stock-depositos/[id] - Obtener stock por ID
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

    const stock = await prisma.stock_deposito.findUnique({
      where: { id_stock: id },
      include: {
        deposito: {
          select: {
            id_deposito: true,
            nom_deposito: true,
            dir_deposito: true,
            responsable: true,
            estado_deposito: true
          }
        },
        insumo: {
          select: {
            id_insumo: true,
            nombre_insumo: true,
            descripcion_insumo: true,
            costo_unitario: true,
            fecha_expiracion: true,
            estado_insumo: true,
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
            }
          }
        }
      }
    })

    if (!stock) {
      return NextResponse.json({
        success: false,
        message: 'Stock no encontrado'
      }, { status: 404 })
    }

    // Agregar información calculada sobre el estado del stock
    const stockInfo = {
      ...stock,
      estado_stock: stock.cantidad_actual <= stock.stock_critico ? 'CRITICO' :
                   stock.cantidad_actual <= stock.stock_minimo ? 'BAJO' : 'NORMAL',
      porcentaje_stock: stock.stock_minimo > 0 
        ? Math.round((stock.cantidad_actual / stock.stock_minimo) * 100)
        : 0,
      necesita_reposicion: stock.cantidad_actual <= stock.stock_minimo
    }

    return NextResponse.json({
      success: true,
      data: stockInfo
    })
  } catch (error) {
    console.error('Error fetching stock:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener stock' },
      { status: 500 }
    )
  }
}

// PUT /api/stock-depositos/[id] - Actualizar stock
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
    const validatedData = updateStockSchema.parse(body)

    // Verificar que el stock existe
    const stockExistente = await prisma.stock_deposito.findUnique({
      where: { id_stock: id },
      include: {
        deposito: { select: { nom_deposito: true } },
        insumo: { select: { nombre_insumo: true } }
      }
    })

    if (!stockExistente) {
      return NextResponse.json({
        success: false,
        message: 'Stock no encontrado'
      }, { status: 404 })
    }

    // Validación adicional: verificar stock crítico vs mínimo con valores existentes
    const stockMinimo = validatedData.stock_minimo ?? stockExistente.stock_minimo
    const stockCritico = validatedData.stock_critico ?? stockExistente.stock_critico

    if (stockCritico > stockMinimo) {
      return NextResponse.json({
        success: false,
        message: 'El stock crítico debe ser menor o igual al stock mínimo'
      }, { status: 400 })
    }

    const stockActualizado = await prisma.stock_deposito.update({
      where: { id_stock: id },
      data: validatedData,
      include: {
        deposito: {
          select: {
            id_deposito: true,
            nom_deposito: true
          }
        },
        insumo: {
          select: {
            id_insumo: true,
            nombre_insumo: true,
            descripcion_insumo: true
          }
        }
      }
    })

    // Si se actualizó la cantidad actual, verificar si necesita generar alertas
    if (validatedData.cantidad_actual !== undefined) {
      const cantidadActual = validatedData.cantidad_actual
      const stockMin = stockActualizado.stock_minimo
      const stockCrit = stockActualizado.stock_critico

      // Generar alerta si está en stock crítico o mínimo
      if (cantidadActual <= stockCrit || cantidadActual <= stockMin) {
        const tipoAlerta = cantidadActual <= stockCrit ? 'STOCK_CRITICO' : 'STOCK_MINIMO'
        const mensaje = cantidadActual <= stockCrit 
          ? `Stock crítico: ${stockActualizado.insumo.nombre_insumo} en ${stockActualizado.deposito.nom_deposito} (${cantidadActual} unidades)`
          : `Stock mínimo: ${stockActualizado.insumo.nombre_insumo} en ${stockActualizado.deposito.nom_deposito} (${cantidadActual} unidades)`

        // Verificar si ya existe una alerta activa para evitar duplicados
        const alertaExistente = await prisma.alerta_stock.findFirst({
          where: {
            id_insumo: stockActualizado.id_insumo,
            id_deposito: stockActualizado.id_deposito,
            tipo_alerta: tipoAlerta,
            estado_alerta: 'ACTIVA'
          }
        })

        if (!alertaExistente) {
          await prisma.alerta_stock.create({
            data: {
              tipo_alerta: tipoAlerta,
              mensaje,
              id_insumo: stockActualizado.id_insumo,
              id_deposito: stockActualizado.id_deposito
            }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: stockActualizado,
      message: 'Stock actualizado exitosamente'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error updating stock:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar stock' },
      { status: 500 }
    )
  }
}

// DELETE /api/stock-depositos/[id] - Eliminar stock
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

    // Verificar que el stock existe
    const stock = await prisma.stock_deposito.findUnique({
      where: { id_stock: id },
      include: {
        deposito: { select: { nom_deposito: true } },
        insumo: { select: { nombre_insumo: true } }
      }
    })

    if (!stock) {
      return NextResponse.json({
        success: false,
        message: 'Stock no encontrado'
      }, { status: 404 })
    }

    // Verificar que la cantidad actual sea 0 antes de eliminar
    if (stock.cantidad_actual > 0) {
      return NextResponse.json({
        success: false,
        message: 'No se puede eliminar un stock con cantidad mayor a 0'
      }, { status: 400 })
    }

    // Eliminar dentro de transacción para limpiar alertas relacionadas
    await prisma.$transaction(async (tx) => {
      // Eliminar alertas relacionadas a este stock
      await tx.alerta_stock.deleteMany({
        where: {
          id_insumo: stock.id_insumo,
          id_deposito: stock.id_deposito
        }
      })

      // Eliminar el stock
      await tx.stock_deposito.delete({
        where: { id_stock: id }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Stock eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting stock:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar stock' },
      { status: 500 }
    )
  }
}