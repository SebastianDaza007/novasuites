import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id_habitacion, nuevo_estado, observaciones } = body;

        // Validaciones
        if (!id_habitacion) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'El ID de la habitación es requerido'
                },
                { status: 400 }
            );
        }

        if (!nuevo_estado) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'El nuevo estado es requerido'
                },
                { status: 400 }
            );
        }

        // Validar que el estado sea válido
        const estadosValidos = ['DISPONIBLE', 'OCUPADA', 'LIMPIEZA', 'MANTENIMIENTO'];
        if (!estadosValidos.includes(nuevo_estado)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Estado no válido'
                },
                { status: 400 }
            );
        }

        // Verificar que la habitación existe
        const habitacion = await prisma.habitaciones.findUnique({
            where: {
                id_habitaciones: id_habitacion
            }
        });

        if (!habitacion) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Habitación no encontrada'
                },
                { status: 404 }
            );
        }

        // Actualizar el estado de la habitación
        const habitacionActualizada = await prisma.habitaciones.update({
            where: {
                id_habitaciones: id_habitacion
            },
            data: {
                estado: nuevo_estado
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Estado actualizado correctamente',
            data: habitacionActualizada
        });

    } catch (error) {
        console.error('Error al cambiar estado de habitación:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error al cambiar estado de habitación'
            },
            { status: 500 }
        );
    }
}
