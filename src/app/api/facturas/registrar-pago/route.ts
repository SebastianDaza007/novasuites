import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_factura, metodo_pago, fecha_pago, monto_pagado } = body; // nota removed

    // Validaciones básicas
    if (!id_factura || !metodo_pago || !fecha_pago || monto_pagado === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: 'Faltan campos requeridos: id_factura, metodo_pago, fecha_pago, monto_pagado'
        },
        { status: 400 }
      );
    }

    // DESHABILITADO: Validar nota si existe
    // if (nota && (!nota.tipo || !nota.monto || !nota.motivo)) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: 'La nota debe incluir: tipo, monto y motivo'
    //     },
    //     { status: 400 }
    //   );
    // }

    // Verificar que la factura existe y está pendiente
    const factura = await prisma.factura_proveedor.findUnique({
      where: { id_factura: Number(id_factura) }
    });

    if (!factura) {
      return NextResponse.json(
        { success: false, message: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    if (factura.estado_factura !== 'PENDIENTE') {
      return NextResponse.json(
        {
          success: false,
          message: `No se puede registrar el pago. La factura está en estado: ${factura.estado_factura}`
        },
        { status: 400 }
      );
    }

    // Usar transacción para asegurar atomicidad
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Crear la orden de pago
      const ordenPago = await tx.ordenes_pago.create({
        data: {
          fecha: new Date(fecha_pago),
          total: monto_pagado
        }
      });

      // 2. Actualizar la factura vinculándola a la orden de pago y cambiando su estado
      const facturaActualizada = await tx.factura_proveedor.update({
        where: { id_factura: Number(id_factura) },
        data: {
          estado_factura: 'PAGADA',
          id_orden_pago: ordenPago.id_ordenes_pago
        }
      });

      // DESHABILITADO: Lógica de notas de crédito/débito
      // let notaCreada = null;

      // // 3. Si hay diferencia, crear nota de crédito/débito
      // if (nota) {
      //   // Generar número de nota correlativo
      //   const prefijo = nota.tipo === 'CREDITO' ? 'NC' : 'ND';

      //   // Buscar la última nota del tipo correspondiente
      //   let ultimaNota;
      //   if (nota.tipo === 'CREDITO') {
      //     ultimaNota = await tx.notas_credito.findFirst({
      //       orderBy: { id_notas_credito: 'desc' }
      //     });
      //   } else {
      //     ultimaNota = await tx.notas_debito.findFirst({
      //       orderBy: { id_notas_debito: 'desc' }
      //     });
      //   }

      //   const siguienteNumero = ultimaNota
      //     ? parseInt(ultimaNota.numero.split('-')[1]) + 1
      //     : 1;

      //   const numeroNota = `${prefijo}-${siguienteNumero.toString().padStart(8, '0')}`;

      //   // Crear la nota
      //   if (nota.tipo === 'CREDITO') {
      //     notaCreada = await tx.notas_credito.create({
      //       data: {
      //         numero: numeroNota,
      //         id_factura: Number(id_factura),
      //         fecha_emision: new Date(fecha_pago),
      //         monto: nota.monto,
      //         motivo: nota.motivo
      //       }
      //     });

      //     // Vincular la nota a la orden de pago
      //     await tx.detalle_orden_pago.create({
      //       data: {
      //         id_orden_pago: ordenPago.id_ordenes_pago,
      //         id_nota_credito: notaCreada.id_notas_credito
      //       }
      //     });
      //   } else {
      //     notaCreada = await tx.notas_debito.create({
      //       data: {
      //         numero: numeroNota,
      //         id_factura: Number(id_factura),
      //         fecha_emision: new Date(fecha_pago),
      //         monto: nota.monto,
      //         motivo: nota.motivo
      //       }
      //     });

      //     // Vincular la nota a la orden de pago
      //     await tx.detalle_orden_pago.create({
      //       data: {
      //         id_orden_pago: ordenPago.id_ordenes_pago,
      //         id_nota_debito: notaCreada.id_notas_debito
      //       }
      //     });
      //   }
      // }

      return {
        factura: facturaActualizada,
        ordenPago
        // nota: notaCreada ? { ...notaCreada, tipo: nota.tipo } : null
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Pago registrado exitosamente',
      data: resultado
    });

  } catch (error) {
    console.error('Error al registrar el pago:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al registrar el pago',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
