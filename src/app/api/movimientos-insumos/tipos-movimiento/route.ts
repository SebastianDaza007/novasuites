import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Obtener las razones de movimiento desde la base de datos
    const razonesMovimiento = await prisma.razon_movimiento.findMany({
      select: {
        id_razon: true,
        nombre_razon: true,
        descripcion: true,
        tipo_movimiento: true
      },
      orderBy: {
        nombre_razon: 'asc'
      }
    });

    // Extraer tipos únicos desde las razones de movimiento
    const tiposUnicos = [...new Set(razonesMovimiento.map(razon => razon.tipo_movimiento))];
    
    // Formatear tipos para el frontend
    const tiposMovimiento = tiposUnicos.map(tipo => {
      const getLabel = (tipoEnum: string) => {
        switch (tipoEnum) {
          case 'ALTA': return 'Alta';
          case 'BAJA': return 'Baja';
          case 'TRANSFERENCIA_SALIDA': return 'Transferencia Salida';
          case 'TRANSFERENCIA_ENTRADA': return 'Transferencia Entrada';
          case 'AJUSTE': return 'Ajuste';
          default: return tipoEnum;
        }
      };

      const getAfectaStock = (tipoEnum: string) => {
        switch (tipoEnum) {
          case 'ALTA':
          case 'TRANSFERENCIA_ENTRADA':
            return 'POSITIVO';
          case 'BAJA':
          case 'TRANSFERENCIA_SALIDA':
            return 'NEGATIVO';
          case 'AJUSTE':
            return 'NEUTRO';
          default:
            return 'NEUTRO';
        }
      };

      return {
        value: tipo,
        label: getLabel(tipo),
        afecta_stock: getAfectaStock(tipo)
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        tipos_movimiento: tiposMovimiento,
        razones_movimiento: razonesMovimiento
      }
    });

  } catch (error) {
    console.error('Error fetching tipos movimiento:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}