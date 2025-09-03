import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const createFacturaSchema = z.object({
  numero_factura: z.string().min(1, 'El número de factura es requerido'),
  fecha_emision: z.string().datetime('Fecha de emisión inválida'),
  fecha_vencimiento: z.string().datetime('Fecha de vencimiento inválida'),
  monto_total: z.number().positive('El monto debe ser positivo'),
  id_proveedor: z.number().int().positive('ID de proveedor inválido'),
  id_orden_compra: z.number().int().positive().optional(),
  estado_factura: z.enum(['PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA']).default('PENDIENTE'),
  observaciones: z.string().optional()
})

// GET /api/facturas - Listar todas las facturas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const estado = searchParams.get('estado')
    const proveedorId = searchParams.get('proveedor')
    const fechaDesde = searchParams.get('fechaDesde')
    const fechaHasta = searchParams.get('fechaHasta')
    const vencidas = searchParams.get('vencidas') === 'true'

    const where: Prisma.factura_proveedorWhereInput = {}

    if (estado) {
      where.estado_factura = estado
    }

    if (proveedorId) {
      where.id_proveedor = parseInt(proveedorId)
    }

    if (fechaDesde || fechaHasta) {
      where.fecha_emision = {}
      if (fechaDesde) {
        where.fecha_emision.gte = new Date(fechaDesde)
      }
      if (fechaHasta) {
        where.fecha_emision.lte = new Date(fechaHasta)
      }
    }

    if (vencidas) {
      where.fecha_vencimiento = {
        lt: new Date()
      }
      where.estado_factura = 'PENDIENTE'
    }

    const [facturas, total] = await Promise.all([
      prisma.factura_proveedor.findMany({
        where,
        include: {
          proveedor: {
            select: {
              id_proveedor: true,
              nombre_proveedor: true,
              cuit_proveedor: true
            }
          },
          orden_compra: {
            select: {
              id_orden_compra: true,
              numero_orden: true,
              total_orden: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          fecha_emision: 'desc'
        }
      }),
      prisma.factura_proveedor.count({ where })
    ])

    // Agregar información calculada
    const facturasConInfo = facturas.map(factura => {
      const fechaVencimiento = new Date(factura.fecha_vencimiento)
      const hoy = new Date()
      const diasParaVencimiento = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        ...factura,
        dias_para_vencimiento: diasParaVencimiento,
        esta_vencida: diasParaVencimiento < 0 && factura.estado_factura === 'PENDIENTE',
        esta_por_vencer: diasParaVencimiento <= 7 && diasParaVencimiento >= 0 && factura.estado_factura === 'PENDIENTE'
      }
    })

    return NextResponse.json({
      success: true,
      data: facturasConInfo,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching facturas:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener facturas' },
      { status: 500 }
    )
  }
}

// POST /api/facturas - Crear nueva factura
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createFacturaSchema.parse(body)

    // Verificar que el número de factura no esté duplicado para el mismo proveedor
    const existingFactura = await prisma.factura_proveedor.findFirst({
      where: { 
        numero_factura: validatedData.numero_factura,
        id_proveedor: validatedData.id_proveedor
      }
    })

    if (existingFactura) {
      return NextResponse.json({
        success: false,
        message: 'Ya existe una factura con este número para el proveedor'
      }, { status: 400 })
    }

    const nuevaFactura = await prisma.factura_proveedor.create({
      data: {
        ...validatedData,
        fecha_emision: new Date(validatedData.fecha_emision),
        fecha_vencimiento: new Date(validatedData.fecha_vencimiento)
      },
      include: {
        proveedor: {
          select: {
            nombre_proveedor: true
          }
        },
        orden_compra: {
          select: {
            numero_orden: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: nuevaFactura,
      message: 'Factura creada exitosamente'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error creating factura:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear factura' },
      { status: 500 }
    )
  }
}