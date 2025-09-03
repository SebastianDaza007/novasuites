import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'

const createUsuarioSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  roleId: z.number().int().positive('ID de rol inválido')
})

// GET /api/usuarios - Listar todos los usuarios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const roleId = searchParams.get('role')
    const search = searchParams.get('search') || ''

    const where: Prisma.userWhereInput = {}

    if (roleId) {
      where.roleId = parseInt(roleId)
    }

    if (search) {
      where.email = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const [usuarios, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          _count: {
            select: {
              movimientos_inventario: true,
              ordenes_compra: true,
              alertas_asignadas: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: usuarios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching usuarios:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

// POST /api/usuarios - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createUsuarioSchema.parse(body)

    // Verificar que el email no esté duplicado
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Ya existe un usuario con este email'
      }, { status: 400 })
    }

    // Verificar que el rol existe
    const role = await prisma.role.findUnique({
      where: { id: validatedData.roleId }
    })

    if (!role) {
      return NextResponse.json({
        success: false,
        message: 'Rol no encontrado'
      }, { status: 404 })
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const nuevoUsuario = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        roleId: validatedData.roleId
      },
      select: {
        id: true,
        email: true,
        created_at: true,
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
      data: nuevoUsuario,
      message: 'Usuario creado exitosamente'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.issues
      }, { status: 400 })
    }
    console.error('Error creating usuario:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}