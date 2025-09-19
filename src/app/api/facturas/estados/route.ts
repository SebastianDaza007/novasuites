import { NextResponse } from 'next/server';
import { estados_factura } from '@prisma/client';

export async function GET() {
  try {
    const estados = Object.values(estados_factura).map(estado => ({
      value: estado,
      label: getEstadoLabel(estado)
    }));

    return NextResponse.json({
      success: true,
      data: estados
    });

  } catch (error) {
    console.error('Error fetching estados factura:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}

function getEstadoLabel(estado: estados_factura): string {
  switch (estado) {
    case 'PENDIENTE':
      return 'Pendiente';
    case 'PAGADA':
      return 'Pagada';
    case 'VENCIDA':
      return 'Vencida';
    case 'ANULADA':
      return 'Anulada';
    default:
      return estado;
  }
}