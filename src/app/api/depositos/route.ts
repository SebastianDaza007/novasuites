import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { z } from 'zod'

const createDepositoSchema = z.object({
  nom_deposito: z.string().min(1, 'El nombre es requerido'),
  tel_deposito: z.string().optional(),
  dir_deposito: z.string().optional(),
  responsable: z.string().optional(),
  estado_deposito: z.boolean().default(true)
})

// GET /api/depositos - Listar todos los depósitos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const includeStock = searchParams.get('includeStock') === 'true'
    const includeAlertas = searchParams.get('includeAlertas') === 'true'

    const where: any = {}
    if (estado !== null) {
      where.estado_deposito = estado === 'true'
    }

    const depositos = await prisma.deposito.findMany({
      where,
      include: {
        ...(includeStock && {
          stock_depositos: {
            include: {
              insumo: {
                select: {
                  id_insumo: true,
                  nombre_insumo: true
                }
              }
            }
          }
        }),
        ...(includeAlertas && {
          alertas: {
            where: {
              estado_alerta: 'ACTIVA'
            },
            include: {
              insumo: {
                select: {
                  id_insumo: true,
                  nombre_insumo: true
                }
              }
            }
          }
        }),
        _count: {
          select: {
            stock_depositos: true,
            alertas: true
          }
        }
      },
      orderBy: {
        nom_deposito: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: depositos
    })
  } catch (error) {
    console.error('Error fetching depositos:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener depósitos' },
      { status: 500 }
    )
  }
}

// POST /api/depositos - Crear nuevo depósito
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createDepositoSchema.parse(body)

    const nuevoDeposito = await prisma.deposito.create({
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: nuevoDeposito,
      message: 'Depósito creado exitosamente'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error creating deposito:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear depósito' },
      { status: 500 }
    )
  }
}