import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { z } from 'zod'

const updateProveedorSchema = z.object({
  nombre_proveedor: z.string().min(1, 'El nombre es requerido').optional(),
  cuit_proveedor: z.string()
    .min(11, 'CUIT debe tener 11 dígitos')
    .max(11, 'CUIT debe tener 11 dígitos')
    .regex(/^\d+$/, 'CUIT debe contener solo números').optional(),
  direccion_proveedor: z.string().min(1, 'La dirección es requerida').optional(),
  telefono_proveedor: z.string().optional(),
  correo_proveedor: z.string().email('Email inválido').optional(),
  contacto_responsable: z.string().optional(),
  condiciones_pago: z.string().optional(),
  estado_proveedor: z.boolean().optional(),
  observaciones: z.string().optional()
})

// GET /api/proveedores/[id] - Obtener proveedor por ID
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

    const proveedor = await prisma.proveedor.findUnique({
      where: { id_proveedor: id },
      include: {
        insumos: {
          select: {
            id_insumo: true,
            nombre_insumo: true,
            costo_unitario: true
          }
        },
        ordenes_compra: {
          select: {
            id_orden_compra: true,
            numero_orden: true,
            fecha_orden: true,
            total_orden: true,
            estado_orden: true
          },
          take: 10,
          orderBy: { fecha_orden: 'desc' }
        },
        _count: {
          select: {
            insumos: true,
            ordenes_compra: true,
            facturas: true
          }
        }
      }
    })

    if (!proveedor) {
      return NextResponse.json({
        success: false,
        message: 'Proveedor no encontrado'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: proveedor
    })
  } catch (error) {
    console.error('Error fetching proveedor:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener proveedor' },
      { status: 500 }
    )
  }
}

// PUT /api/proveedores/[id] - Actualizar proveedor
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
    const validatedData = updateProveedorSchema.parse(body)

    // Si se está actualizando el CUIT, verificar que no esté duplicado
    if (validatedData.cuit_proveedor) {
      const existingProveedor = await prisma.proveedor.findFirst({
        where: { 
          cuit_proveedor: validatedData.cuit_proveedor,
          NOT: { id_proveedor: id }
        }
      })

      if (existingProveedor) {
        return NextResponse.json({
          success: false,
          message: 'Ya existe otro proveedor con este CUIT'
        }, { status: 400 })
      }
    }

    const proveedorActualizado = await prisma.proveedor.update({
      where: { id_proveedor: id },
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: proveedorActualizado,
      message: 'Proveedor actualizado exitosamente'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error updating proveedor:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar proveedor' },
      { status: 500 }
    )
  }
}