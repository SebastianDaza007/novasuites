import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma, tipos_movimiento } from '@prisma/client';

const prisma = new PrismaClient();

// Función helper para validar tipos de movimiento
function isValidTipoMovimiento(tipo: string): tipo is tipos_movimiento {
  return Object.values(tipos_movimiento).includes(tipo as tipos_movimiento);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Parámetros de filtro
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    const tipoMovimiento = searchParams.get('tipoMovimiento');
    const categoria = searchParams.get('categoria');
    const deposito = searchParams.get('deposito');
    const search = searchParams.get('search');
    const numeroMovimiento = searchParams.get('numeroMovimiento');
    const insumo = searchParams.get('insumo');
    const lote = searchParams.get('lote');
    const sortField = searchParams.get('sortField') || 'fecha_movimiento';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construir filtros WHERE
    const whereConditions: Prisma.detalle_movimiento_inventarioWhereInput = {};

    // Filtros de movimiento
    const movimientoFilters: Prisma.movimiento_inventarioWhereInput = {};

    if (fechaDesde || fechaHasta) {
      const fechaMovimiento: Prisma.DateTimeFilter = {};

      if (fechaDesde) {
        // Crear fecha compensando la zona horaria
        const fechaInicio = new Date(fechaDesde + 'T00:00:00.000');
        // Ajustar por offset de zona horaria
        const offsetMinutes = fechaInicio.getTimezoneOffset();
        fechaInicio.setMinutes(fechaInicio.getMinutes() - offsetMinutes);
        fechaMovimiento.gte = fechaInicio;
      }
      if (fechaHasta) {
        // Crear fecha compensando la zona horaria
        const fechaFin = new Date(fechaHasta + 'T23:59:59.999');
        // Ajustar por offset de zona horaria
        const offsetMinutes = fechaFin.getTimezoneOffset();
        fechaFin.setMinutes(fechaFin.getMinutes() - offsetMinutes);
        fechaMovimiento.lte = fechaFin;
      }

      movimientoFilters.fecha_movimiento = fechaMovimiento;
    }

    if (tipoMovimiento && isValidTipoMovimiento(tipoMovimiento)) {
      movimientoFilters.razon_movimiento = {
        tipo_movimiento: tipoMovimiento
      };
    }

    if (deposito) {
      movimientoFilters.id_deposito = parseInt(deposito);
    }

    // Filtro específico por número de movimiento
    if (numeroMovimiento) {
      movimientoFilters.id_movimiento = parseInt(numeroMovimiento);
    }

    // Aplicar filtros de movimiento si existen
    if (Object.keys(movimientoFilters).length > 0) {
      whereConditions.movimiento = movimientoFilters;
    }

    // Filtros de insumo
    const insumoFilters: Prisma.insumoWhereInput = {};

    if (categoria) {
      insumoFilters.id_categoria = parseInt(categoria);
    }

    // Filtro específico por insumo
    if (insumo) {
      insumoFilters.id_insumo = parseInt(insumo);
    }

    // Aplicar filtros de insumo si existen
    if (Object.keys(insumoFilters).length > 0) {
      whereConditions.insumo = insumoFilters;
    }

    // Filtro específico por lote
    if (lote) {
      whereConditions.lote = {
        equals: lote,
        mode: 'insensitive'
      };
    }

    if (search) {
      const searchTerms = search.trim().toLowerCase();
      whereConditions.OR = [
        {
          insumo: {
            nombre_insumo: {
              contains: searchTerms,
              mode: 'insensitive'
            }
          }
        },
        {
          insumo: {
            descripcion_insumo: {
              contains: searchTerms,
              mode: 'insensitive'
            }
          }
        },
        {
          movimiento: {
            numero_comprobante: {
              contains: searchTerms,
              mode: 'insensitive'
            }
          }
        },
        {
          lote: {
            contains: searchTerms,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Configurar ordenamiento
    const orderBy: Prisma.detalle_movimiento_inventarioOrderByWithRelationInput = {};
    if (sortField === 'movimiento.fecha_movimiento') {
      orderBy.movimiento = { fecha_movimiento: sortOrder as Prisma.SortOrder };
    } else if (sortField === 'movimiento.id_movimiento') {
      orderBy.movimiento = { id_movimiento: sortOrder as Prisma.SortOrder };
    } else if (sortField === 'insumo.nombre_insumo') {
      orderBy.insumo = { nombre_insumo: sortOrder as Prisma.SortOrder };
    } else if (sortField === 'cantidad') {
      orderBy.cantidad = sortOrder as Prisma.SortOrder;
    } else if (sortField === 'fecha_vencimiento') {
      orderBy.fecha_vencimiento = sortOrder as Prisma.SortOrder;
    } else {
      orderBy.movimiento = { fecha_movimiento: 'desc' };
    }

    // Obtener datos con paginación
    const [detallesMovimiento, totalCount] = await Promise.all([
      prisma.detalle_movimiento_inventario.findMany({
        where: whereConditions,
        include: {
          movimiento: {
            include: {
              deposito: true,
              razon_movimiento: true,
              usuario: {
                select: {
                  id: true,
                  email: true
                }
              }
            }
          },
          insumo: {
            include: {
              categoria: true
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.detalle_movimiento_inventario.count({
        where: whereConditions
      })
    ]);

    // Formatear datos para el frontend
    const formattedData = detallesMovimiento.map(detalle => ({
      id_detalle: detalle.id_detalle,
      cantidad: detalle.cantidad,
      costo_unitario: detalle.costo_unitario ? Number(detalle.costo_unitario) : null,
      lote: detalle.lote,
      fecha_vencimiento: detalle.fecha_vencimiento?.toISOString(),
      movimiento: {
        id_movimiento: detalle.movimiento.id_movimiento,
        fecha_movimiento: detalle.movimiento.fecha_movimiento?.toISOString(),
        numero_comprobante: detalle.movimiento.numero_comprobante,
        observaciones: detalle.movimiento.observaciones,
        deposito: detalle.movimiento.deposito ? {
          id_deposito: detalle.movimiento.deposito.id_deposito,
          nombre_deposito: detalle.movimiento.deposito.nombre_deposito
        } : null,
        razon_movimiento: detalle.movimiento.razon_movimiento ? {
          id_razon: detalle.movimiento.razon_movimiento.id_razon,
          nombre_razon: detalle.movimiento.razon_movimiento.nombre_razon,
          tipo_movimiento: detalle.movimiento.razon_movimiento.tipo_movimiento
        } : null,
        usuario: {
          id: detalle.movimiento.usuario.id,
          email: detalle.movimiento.usuario.email
        }
      },
      insumo: {
        id_insumo: detalle.insumo.id_insumo,
        nombre_insumo: detalle.insumo.nombre_insumo,
        descripcion_insumo: detalle.insumo.descripcion_insumo,
        categoria: {
          id_categoria: detalle.insumo.categoria.id_categoria,
          nombre_categoria: detalle.insumo.categoria.nombre_categoria
        }
      }
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching movimientos:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}