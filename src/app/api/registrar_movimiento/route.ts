// app/api/insumos/route.ts
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

// 🧠 Prisma Client (singleton simple para este file)
const prisma = new PrismaClient();

/**
 * 🔎 GET /api/insumos
 * - Lista todos los insumos, o filtra por id/nombre si hay query params.
 * - Siempre devuelve filas con categoría + stock (por depósito).
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const nombre = searchParams.get("insumo");
        const categoriaId = searchParams.get("categoriaId"); 
        const depositoId = searchParams.get("depositoId");  
        const fechaDesde = searchParams.get("fechaDesde"); // YYYY-MM-DD
        const fechaHasta = searchParams.get("fechaHasta"); // YYYY-MM-DD

        // 📌 Condiciones dinámicas para el WHERE (tipado seguro)
        const where: Prisma.insumoWhereInput = {};
        if (id) {
        where.id_insumo = Number(id);
        }
        if (nombre) {
        where.nombre_insumo = { contains: nombre, mode: "insensitive" };
        }
        if (categoriaId){
            where.id_categoria = Number(categoriaId);
        }
        if (depositoId){
            where.stock_depositos = { some: { id_deposito: Number(depositoId) } };
        }
            // 📅 Lógica de fechas
        if (fechaDesde || fechaHasta) {
            where.fecha_creacion = {};
        if (fechaDesde) {
            const [y, m, d] = fechaDesde.split("-").map(Number);
            const desdeDate = new Date(y, m - 1, d, 0, 0, 0, 0); // 👈 en hora local
            (where.fecha_creacion as Prisma.DateTimeFilter).gte = desdeDate;
        }
        if (fechaHasta) {
            const [y, m, d] = fechaHasta.split("-").map(Number);
            const hastaDate = new Date(y, m - 1, d, 23, 59, 59, 999); // 👈 incluye todo el día
            (where.fecha_creacion as Prisma.DateTimeFilter).lte = hastaDate;
        }
        }
        // 📦 Traer datos de la BD
        const insumos = await prisma.insumo.findMany({
        where,
        include: {
            categoria: true,
            stock_depositos: {
            include: { deposito: true },
            },
        },
        });

        // 🔁 Transformar datos al formato del front
        const data = insumos.flatMap((i) => {
          // Si hay filtro de depósito, mostrar solo ese depósito
        const stockFiltrado = depositoId
        ? i.stock_depositos.filter((sd) => sd.id_deposito === Number(depositoId))
        : i.stock_depositos;
        if (stockFiltrado.length === 0) {
            return [
            {
                id: i.id_insumo,
                nombre: i.nombre_insumo,
                descripcion: i.descripcion_insumo,
                categoria: i.categoria?.nombre_categoria || "Sin categoría",
                stock: 0,
                deposito: "Sin depósito",
                estado: i.activo,
                fechaAlta: i.fecha_creacion?.toISOString().split("T")[0] || null,
                ultimaActualizacion:
                i.fecha_actualizacion?.toISOString().split("T")[0] || null,
            },
            ];
        }

        return stockFiltrado.map((sd) => ({
            id: i.id_insumo,
            nombre: i.nombre_insumo,
            descripcion: i.descripcion_insumo,
            categoria: i.categoria?.nombre_categoria || "Sin categoría",
            stock: sd.cantidad_actual,
            deposito: sd.deposito.nombre_deposito,
            estado: i.activo,
            fechaAlta: i.fecha_creacion?.toISOString().split("T")[0] || null,
            ultimaActualizacion:
            i.fecha_actualizacion?.toISOString().split("T")[0] || null,
        }));
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("❌ Error al traer insumos:", error);
        return NextResponse.json(
        { error: "Error al traer insumos" },
        { status: 500 }
        );
    }
}

/**
 * 📝 POST /api/insumos
 * Crea un nuevo insumo.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const nombre = (body?.nombre_insumo ?? "").trim();
        const idCategoria = Number(body?.id_categoria);
        const activo = Boolean(body?.activo);
        const descripcion = body?.descripcion_insumo ?? null;

        // ✅ Validaciones básicas
        if (!nombre) {
        return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
        }
        if (!idCategoria || Number.isNaN(idCategoria)) {
        return NextResponse.json({ error: "id_categoria inválido." }, { status: 400 });
        }

        // 💾 Crear insumo
        const creado = await prisma.insumo.create({
        data: {
            nombre_insumo: nombre,
            descripcion_insumo: descripcion,
            id_categoria: idCategoria,
            activo,
            // fecha_creacion y fecha_actualizacion se manejan con defaults/@updatedAt
        },
        include: {
            categoria: true,
            stock_depositos: { include: { deposito: true } }, // (aún vacío)
        },
        });

        // 🔁 Devolvemos el formato que usa tu tabla (placeholder si no hay stock)
        const responseRow = {
        id: creado.id_insumo,
        nombre: creado.nombre_insumo,
        descripcion: creado.descripcion_insumo,
        categoria: creado.categoria?.nombre_categoria || "Sin categoría",
        stock: 0,                       // 👉 recién creado => 0
        deposito: "Sin depósito",       // 👉 hasta HU-04
        estado: creado.activo,
        fechaAlta: creado.fecha_creacion?.toISOString().split("T")[0] || null,
        ultimaActualizacion: creado.fecha_actualizacion?.toISOString().split("T")[0] || null,
        };

        return NextResponse.json(responseRow, { status: 201 });
    } catch (error: unknown) {
        if (error instanceof Error){
            console.error("❌ Error al crear insumo:", error.message);
            return NextResponse.json(
                { error: "Error al crear insumo", detalle: error.message },
                { status: 500 }
            );
        }

        console.error("❌ Error al crear insumo:", error);
        return NextResponse.json(
        { error: "Error al crear insumo", detalle: String(error) },
        { status: 500 }
        );
    }
}