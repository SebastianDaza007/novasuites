import { NextResponse } from 'next/server';
import { tipo_factura } from '@prisma/client';

export async function GET() {
  try {
    const tipos = Object.values(tipo_factura).map(tipo => ({
      value: tipo,
      label: getTipoLabel(tipo)
    }));

    return NextResponse.json({
      success: true,
      data: tipos
    });

  } catch (error) {
    console.error('Error fetching tipos factura:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}

function getTipoLabel(tipo: tipo_factura): string {
  switch (tipo) {
    case 'A':
      return 'Factura A';
    case 'B':
      return 'Factura B';
    case 'C':
      return 'Factura C';
    default:
      return `Factura ${tipo}`;
  }
}