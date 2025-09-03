import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const createProveedorSchema = z.object({
  nombre_proveedor: z.string().min(1, 'El nombre es requerido'),
  cuit_proveedor: z.string()
    .min(11, 'CUIT debe tener 11 dígitos')
    .max(11, 'CUIT debe tener 11 dígitos')
    .regex(/^\d+$/, 'CUIT debe contener solo números'),
  direccion_proveedor: z.string().min(1, 'La dirección es requerida'),
  telefono_proveedor: z.string().optional(),
  correo_proveedor: z.string().email('Email inválido').optional(),
  contacto_responsable: z.string().optional(),
  condiciones_pago: z.string().optional(),
  estado_proveedor: z.boolean().default(true),
  observaciones: z.string().optional()
})

// GET /api/proveedores - Listar todos los proveedores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const estado = searchParams.get('estado')

    const where: Prisma.proveedorWhereInput = {}
    
    if (estado !== null) {
      where.estado_proveedor = estado === 'true'
    }

    if (search) {
      where.OR = [
        { nombre_proveedor: { contains: search, mode: 'insensitive' } },
        { cuit_proveedor: { contains: search } }
      ]
    }

    const [proveedores, total] = await Promise.all([
      prisma.proveedor.findMany({
        where,
        include: {
          _count: {
            select: {
              insumos: true,
              ordenes_compra: true,
              facturas: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          nombre_proveedor: 'asc'
        }
      }),
      prisma.proveedor.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: proveedores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching proveedores:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener proveedores' },
      { status: 500 }
    )
  }
}

// POST /api/proveedores - Crear nuevo proveedor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createProveedorSchema.parse(body)

    // Verificar que el CUIT no esté duplicado
    const existingProveedor = await prisma.proveedor.findUnique({
      where: { cuit_proveedor: validatedData.cuit_proveedor }
    })

    if (existingProveedor) {
      return NextResponse.json({
        success: false,
        message: 'Ya existe un proveedor con este CUIT'
      }, { status: 400 })
    }

    const nuevoProveedor = await prisma.proveedor.create({
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: nuevoProveedor,
      message: 'Proveedor creado exitosamente'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error creating proveedor:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear proveedor' },
      { status: 500 }
    )
  }
}