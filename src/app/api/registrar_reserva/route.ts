import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

// 🧠 Prisma Client
const prisma = new PrismaClient();

/**
 * 🏨 POST /api/registrar_reserva
 * Crea una nueva reserva con:
 *  - Datos del huésped (si no existe, se crea)
 *  - Datos de la reserva
 *  - Habitaciones seleccionadas (tabla intermedia reservas_habitaciones)
 *  - Tarjeta del huésped (opcional)
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 🧩 Esperamos un JSON con esta estructura:
        // {
        //   huesped: {...},
        //   reserva: {...},
        //   tarjeta: {...?},
        //   habitaciones: [{ id_habitacion: 1, cantidad_personas: 2 }, ...]
        // }

        const { huesped, reserva, tarjeta, habitaciones } = body;

        if (!huesped || !reserva) {
        return NextResponse.json(
            { error: "Datos incompletos: faltan datos de huésped o reserva" },
            { status: 400 }
        );
        }

        // ===========================================================
        // 1️⃣ Buscar o crear huésped
        // ===========================================================
        let huespedCreado = await prisma.huespedes.findFirst({
        where: { documento: huesped.documento },
        });

        if (!huespedCreado) {
        huespedCreado = await prisma.huespedes.create({
            data: {
            nombre: huesped.nombre,
            apellido: huesped.apellido,
            documento: huesped.documento,
            telefono: huesped.telefono ?? null,
            email: huesped.email ?? null,
            },
        });
        }

        // ===========================================================
        // 2️⃣ Crear la reserva principal
        // ===========================================================
        const nuevaReserva = await prisma.reservas.create({
        data: {
            id_huesped: huespedCreado.id_huespedes,
            id_metodo_pago: reserva.id_metodo_pago ?? null,
            fecha_checkin: new Date(reserva.fecha_checkin),
            fecha_checkout: new Date(reserva.fecha_checkout),
            cantidad_adultos: reserva.cantidad_adultos ?? 1,
            cantidad_menores: reserva.cantidad_menores ?? 0,
            estado: reserva.estado ?? "RESERVADA",
            monto_total: reserva.monto_total,
        },
        });

        // ===========================================================
        // 3️⃣ (Opcional) Si se envía tarjeta, la guardamos y asociamos
        // ===========================================================
        if (tarjeta && tarjeta.numero_tarjeta) {
        const tarjetaNueva = await prisma.tarjeta_huesped.create({
            data: {
            id_huesped: huespedCreado.id_huespedes,
            numero_tarjeta: tarjeta.numero_tarjeta,
            titular_tarjeta: tarjeta.titular_tarjeta,
            fecha_expiracion: new Date(tarjeta.fecha_expiracion),
            codigo_seguridad: tarjeta.codigo_seguridad,
            },
        });

        // Asociamos la tarjeta a la reserva recién creada
        await prisma.reservas.update({
            where: { id_reservas: nuevaReserva.id_reservas },
            data: { id_tarjeta: tarjetaNueva.id_tarjeta },
        });
        }

        // ===========================================================
        // 4️⃣ Registrar habitaciones asociadas a la reserva
        // ===========================================================
        // Se espera un array como: [{ id_habitacion: 1, cantidad_personas: 2 }]
        if (habitaciones && habitaciones.length > 0) {
        for (const hab of habitaciones) {
            // Verificamos que exista la habitación antes de vincularla
            const habitacionExiste = await prisma.habitaciones.findUnique({
            where: { id_habitaciones: hab.id_habitacion },
            });

            if (!habitacionExiste) {
            console.warn(`⚠️ Habitación ${hab.id_habitacion} no encontrada, se omite.`);
            continue;
            }

            // Creamos la relación reserva ↔ habitación
            await prisma.reservas_habitaciones.create({
            data: {
                id_reserva: nuevaReserva.id_reservas,
                id_habitacion: hab.id_habitacion,
                cantidad_personas: hab.cantidad_personas ?? 1,
            },
            });

            // (Opcional) Actualizamos estado de la habitación
            await prisma.habitaciones.update({
            where: { id_habitaciones: hab.id_habitacion },
            data: { estado: "OCUPADA" }, // o "RESERVADA", según prefieras
            });
        }
        }

        // ===========================================================
        // 5️⃣ Respuesta final
        // ===========================================================
        return NextResponse.json(
        {
            message: "✅ Reserva registrada con éxito",
            reserva: nuevaReserva,
            huesped: huespedCreado,
        },
        { status: 201 }
        );
    } catch (error: unknown) {
        console.error("❌ Error al registrar reserva:", error);

        if (error instanceof Error) {
        return NextResponse.json(
            { error: "Error interno al registrar la reserva", detalle: error.message },
            { status: 500 }
        );
        }

        return NextResponse.json(
        { error: "Error interno desconocido al registrar la reserva" },
        { status: 500 }
        );
    }
}
