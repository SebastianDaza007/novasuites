import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * NOTA IMPORTANTE PARA EL DBA:
 *
 * Este endpoint requiere las siguientes modificaciones en la base de datos:
 *
 * 1. Agregar campos a la tabla factura_proveedor:
 *    - fecha_pago: DateTime? @db.Timestamp(6)
 *    - metodo_pago: String?
 *    - monto_pagado: Decimal? @db.Decimal(10,2)
 *
 * 2. Crear nueva tabla nota_credito_debito:
 *    - id_nota: Int @id @default(autoincrement())
 *    - numero_nota: String @unique
 *    - tipo_nota: Enum('CREDITO', 'DEBITO')
 *    - fecha_emision: DateTime @db.Timestamp(6)
 *    - monto: Decimal @db.Decimal(10,2)
 *    - motivo: String
 *    - observaciones: String?
 *    - id_factura: Int (FK a factura_proveedor)
 *    - id_usuario: Int? (FK a user - quien generó la nota)
 *    - fecha_creacion: DateTime @default(now())
 *
 * 3. Crear enum tipo_nota:
 *    enum tipo_nota {
 *      CREDITO
 *      DEBITO
 *    }
 *
 * Una vez realizados estos cambios, descomentar las líneas marcadas con "DESCOMENTAR"
 * y comentar/eliminar el código TEMPORAL.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_factura, metodo_pago, fecha_pago, monto_pagado, nota } = body;

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

    // Validar nota si existe
    if (nota && (!nota.tipo || !nota.monto || !nota.motivo)) {
      return NextResponse.json(
        {
          success: false,
          message: 'La nota debe incluir: tipo, monto y motivo'
        },
        { status: 400 }
      );
    }

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

    // TEMPORAL: Solo actualiza el estado hasta que se agreguen los campos necesarios
    const facturaActualizada = await prisma.factura_proveedor.update({
      where: { id_factura: Number(id_factura) },
      data: {
        estado_factura: 'PAGADA'
      }
    });

    // Si hay nota, loguear la información (temporal hasta que exista la tabla)
    if (nota) {
      console.log('===== NOTA DE CRÉDITO/DÉBITO =====');
      console.log('Tipo:', nota.tipo);
      console.log('Monto:', nota.monto);
      console.log('Motivo:', nota.motivo);
      console.log('Factura asociada:', factura.numero_factura);
      console.log('Fecha:', new Date().toISOString());
      console.log('==================================');
    }

    return NextResponse.json({
      success: true,
      message: nota
        ? `Pago registrado exitosamente con Nota de ${nota.tipo === 'CREDITO' ? 'Crédito' : 'Débito'}`
        : 'Pago registrado exitosamente',
      data: {
        factura: facturaActualizada,
        nota: nota ? {
          tipo: nota.tipo,
          monto: nota.monto,
          motivo: nota.motivo,
          mensaje: 'Nota registrada en consola (pendiente creación de tabla en BD)'
        } : null
      }
    });

    /* DESCOMENTAR cuando se agreguen los campos y tabla en la BD:

    // Usar transacción para asegurar atomicidad
    const resultado = await prisma.$transaction(async (tx) => {
      // Actualizar factura con datos de pago
      const facturaActualizada = await tx.factura_proveedor.update({
        where: { id_factura: Number(id_factura) },
        data: {
          estado_factura: 'PAGADA',
          fecha_pago: new Date(fecha_pago),
          metodo_pago: metodo_pago,
          monto_pagado: monto_pagado
        }
      });

      let notaCreada = null;

      // Si hay diferencia, crear nota de crédito/débito
      if (nota) {
        // Generar número de nota correlativo
        const ultimaNota = await tx.nota_credito_debito.findFirst({
          where: { tipo_nota: nota.tipo },
          orderBy: { id_nota: 'desc' }
        });

        const siguienteNumero = ultimaNota
          ? parseInt(ultimaNota.numero_nota.split('-')[1]) + 1
          : 1;

        const numeroNota = `${nota.tipo === 'CREDITO' ? 'NC' : 'ND'}-${siguienteNumero.toString().padStart(8, '0')}`;

        // Crear la nota
        notaCreada = await tx.nota_credito_debito.create({
          data: {
            numero_nota: numeroNota,
            tipo_nota: nota.tipo,
            fecha_emision: new Date(fecha_pago),
            monto: nota.monto,
            motivo: nota.motivo,
            observaciones: nota.observaciones || null,
            id_factura: Number(id_factura),
            // id_usuario: obtener del contexto de sesión
          }
        });
      }

      return { factura: facturaActualizada, nota: notaCreada };
    });

    return NextResponse.json({
      success: true,
      message: resultado.nota
        ? `Pago registrado exitosamente. Nota de ${resultado.nota.tipo_nota === 'CREDITO' ? 'Crédito' : 'Débito'} Nro ${resultado.nota.numero_nota} generada.`
        : 'Pago registrado exitosamente',
      data: resultado
    });
    */

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
