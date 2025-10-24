import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '0');
        const limit = parseInt(searchParams.get('limit') || '20');
        const sortField = searchParams.get('sortField') || 'numero';
        const sortOrder = searchParams.get('sortOrder') || '1';
        const estado = searchParams.get('estado') || '';
        const tipo = searchParams.get('tipo') || '';
        const busqueda = searchParams.get('busqueda') || '';

        // Construir filtros
        const where: any = {};

        if (estado) {
            where.estado = estado;
        }

        if (tipo) {
            where.tipo = tipo;
        }

        if (busqueda) {
            where.numero = {
                contains: busqueda
            };
        }

        // Configurar ordenamiento
        const orderBy: any = {};
        orderBy[sortField] = sortOrder === '1' ? 'asc' : 'desc';

        // Consultar habitaciones con paginación
        const [habitaciones, total] = await Promise.all([
            prisma.habitaciones.findMany({
                where,
                orderBy,
                skip: page * limit,
                take: limit
            }),
            prisma.habitaciones.count({ where })
        ]);

        // Calcular estadísticas
        const estadisticas = await prisma.habitaciones.groupBy({
            by: ['estado'],
            _count: {
                estado: true
            }
        });

        const stats = {
            total: await prisma.habitaciones.count(),
            disponibles: estadisticas.find(e => e.estado === 'DISPONIBLE')?._count.estado || 0,
            ocupadas: estadisticas.find(e => e.estado === 'OCUPADA')?._count.estado || 0,
            limpieza: estadisticas.find(e => e.estado === 'LIMPIEZA')?._count.estado || 0,
            mantenimiento: estadisticas.find(e => e.estado === 'MANTENIMIENTO')?._count.estado || 0
        };

        return NextResponse.json({
            success: true,
            data: habitaciones,
            estadisticas: stats,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener habitaciones:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error al obtener habitaciones'
            },
            { status: 500 }
        );
    }
}
