import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma, estados_factura, tipo_factura } from '@prisma/client';

const prisma = new PrismaClient();

// Función helper para validar estados de factura
function isValidEstadoFactura(estado: string): estado is estados_factura {
  return Object.values(estados_factura).includes(estado as estados_factura);
}

// Función helper para validar tipos de factura
function isValidTipoFactura(tipo: string): tipo is tipo_factura {
  return Object.values(tipo_factura).includes(tipo as tipo_factura);
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
    const estadoFactura = searchParams.get('estadoFactura');
    const tipoFactura = searchParams.get('tipoFactura');
    const proveedor = searchParams.get('proveedor');
    const search = searchParams.get('search');
    const numeroFactura = searchParams.get('numeroFactura');
    const ordenCompra = searchParams.get('ordenCompra');
    const sortField = searchParams.get('sortField') || 'fecha_creacion';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construir filtros WHERE
    const whereConditions: Prisma.factura_proveedorWhereInput = {};

    // Filtros de fecha
    if (fechaDesde || fechaHasta) {
      const fechaEmision: Prisma.DateTimeFilter = {};

      if (fechaDesde) {
        const fechaInicio = new Date(fechaDesde + 'T00:00:00.000');
        const offsetMinutes = fechaInicio.getTimezoneOffset();
        fechaInicio.setMinutes(fechaInicio.getMinutes() - offsetMinutes);
        fechaEmision.gte = fechaInicio;
      }
      if (fechaHasta) {
        const fechaFin = new Date(fechaHasta + 'T23:59:59.999');
        const offsetMinutes = fechaFin.getTimezoneOffset();
        fechaFin.setMinutes(fechaFin.getMinutes() - offsetMinutes);
        fechaEmision.lte = fechaFin;
      }

      whereConditions.fecha_emision = fechaEmision;
    }

    // Filtro por estado
    if (estadoFactura && isValidEstadoFactura(estadoFactura)) {
      whereConditions.estado_factura = estadoFactura;
    }

    // Filtro por tipo
    if (tipoFactura && isValidTipoFactura(tipoFactura)) {
      whereConditions.tipo = tipoFactura;
    }

    // Filtro por proveedor
    if (proveedor) {
      whereConditions.id_proveedor = parseInt(proveedor);
    }

    // Filtro por número de factura
    if (numeroFactura) {
      whereConditions.numero_factura = {
        contains: numeroFactura,
        mode: 'insensitive'
      };
    }

    // Filtro por orden de compra
    if (ordenCompra) {
      whereConditions.id_orden_compra = parseInt(ordenCompra);
    }

    // Búsqueda general
    if (search) {
      const searchTerms = search.trim().toLowerCase();
      whereConditions.OR = [
        {
          numero_factura: {
            contains: searchTerms,
            mode: 'insensitive'
          }
        },
        {
          proveedor: {
            nombre_proveedor: {
              contains: searchTerms,
              mode: 'insensitive'
            }
          }
        },
        {
          observaciones: {
            contains: searchTerms,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Configurar ordenamiento
    const orderBy: Prisma.factura_proveedorOrderByWithRelationInput = {};
    if (sortField === 'fecha_emision') {
      orderBy.fecha_emision = sortOrder as Prisma.SortOrder;
    } else if (sortField === 'fecha_vencimiento') {
      orderBy.fecha_vencimiento = sortOrder as Prisma.SortOrder;
    } else if (sortField === 'numero_factura') {
      orderBy.numero_factura = sortOrder as Prisma.SortOrder;
    } else if (sortField === 'proveedor.nombre_proveedor') {
      orderBy.proveedor = { nombre_proveedor: sortOrder as Prisma.SortOrder };
    } else {
      orderBy.fecha_creacion = 'desc';
    }

    // Obtener datos con paginación
    const [facturas, totalCount] = await Promise.all([
      prisma.factura_proveedor.findMany({
        where: whereConditions,
        include: {
          proveedor: {
            select: {
              id_proveedor: true,
              nombre_proveedor: true,
              cuit_proveedor: true
            }
          },
          orden_compra: {
            select: {
              id_orden_compra: true,
              numero_orden: true
            }
          },
          detalle_factura_proveedor: {
            include: {
              insumo: {
                select: {
                  id_insumo: true,
                  nombre_insumo: true,
                  categoria: {
                    select: {
                      nombre_categoria: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.factura_proveedor.count({
        where: whereConditions
      })
    ]);

    // Formatear datos para el frontend
    const formattedData = facturas.map(factura => {
      // Calcular costo total estimado basado en los detalles
      const costoTotal = factura.detalle_factura_proveedor.reduce((sum, detalle) => {
        // En una implementación real, esto vendría de un campo precio_unitario en detalle_factura_proveedor
        // Por ahora usamos un valor estimado de $1000 por unidad
        return sum + (detalle.cantidad * 1000);
      }, 0);

      return {
        id_factura: factura.id_factura,
        numero_factura: factura.numero_factura,
        tipo: factura.tipo,
        fecha_emision: factura.fecha_emision.toISOString(),
        fecha_vencimiento: factura.fecha_vencimiento.toISOString(),
        fecha_carga: factura.fecha_creacion?.toISOString(),
        estado_factura: factura.estado_factura,
        observaciones: factura.observaciones,
        costo_total: costoTotal,
        proveedor: {
          id_proveedor: factura.proveedor.id_proveedor,
          nombre_proveedor: factura.proveedor.nombre_proveedor,
          cuit_proveedor: Number(factura.proveedor.cuit_proveedor)
        },
        orden_compra: factura.orden_compra ? {
          id_orden_compra: factura.orden_compra.id_orden_compra,
          numero_orden: factura.orden_compra.numero_orden
        } : null,
        detalles: factura.detalle_factura_proveedor.map(detalle => ({
          id_detalle_factura: detalle.id_detalle_factura,
          cantidad: detalle.cantidad,
          insumo: {
            id_insumo: detalle.insumo.id_insumo,
            nombre_insumo: detalle.insumo.nombre_insumo,
            categoria: detalle.insumo.categoria ? {
              nombre_categoria: detalle.insumo.categoria.nombre_categoria
            } : null
          }
        }))
      };
    });

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
    console.error('Error fetching facturas:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}