import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const movimiento = await prisma.movimiento_inventario.create({
      data: {
        fecha_movimiento: new Date(data.fecha),
        id_deposito_origen: data.depositoOrigen,
        id_deposito_destino: data.depositoDestino,
        id_tipo_movimiento: await getTipoMovimientoId(data.tipoMovimiento),
        observaciones: data.observaciones,
        id_usuario: 1, // TODO: reemplazar por el usuario real autenticado
        detalles: {
          create: data.detalles.map((detalle: any) => ({
            id_insumo: detalle.id_insumo,
            cantidad: detalle.cantidad,
            costo_unitario: detalle.costo_unitario ?? undefined,
            lote: detalle.lote ?? undefined,
            fecha_vencimiento: detalle.fecha_vencimiento ?? undefined
          }))
        }
      }
    })

    return NextResponse.json({ ok: true, movimiento }, { status: 201 })
  } catch (error: any) {
    console.error('Error al registrar movimiento:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

async function getTipoMovimientoId(id: number): Promise<number> {
  const tipo = await prisma.tipo_movimiento.findUnique({
    where: { id_tipo_movimiento: id }
  })
  if (!tipo) throw new Error(`Tipo de movimiento con id '${id}' no encontrado`)
  return tipo.id_tipo_movimiento
}
