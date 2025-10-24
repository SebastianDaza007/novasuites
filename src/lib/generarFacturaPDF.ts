import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Consumo {
    id: number;
    categoria: string;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    fecha: Date;
}

interface DatosFactura {
    numeroFactura: string;
    fechaEmision: Date;
    huesped: {
        nombre: string;
        apellido: string;
        documento: string;
        telefono?: string;
        email?: string;
    };
    habitaciones: Array<{
        numero: string;
        tipo: string;
    }>;
    fechaCheckin: Date;
    fechaCheckout: Date;
    montoHospedaje: number;
    consumos: Consumo[];
    totalConsumos: number;
    totalFinal: number;
    metodoPago?: string;
}

export function generarFacturaPDF(datos: DatosFactura) {
    const doc = new jsPDF();

    // Paleta de colores moderna (basada en el nuevo diseño)
    const slate900 = [15, 23, 42];
    const slate800 = [30, 41, 59];
    const slate700 = [51, 65, 85];
    const slate600 = [71, 85, 105];
    const blue600 = [37, 99, 235];
    const purple600 = [147, 51, 234];
    const white = [255, 255, 255];
    const slate50 = [248, 250, 252];

    let yPos = 0;

    // ===== ENCABEZADO MODERNO CON GRADIENTE =====
    // Fondo oscuro principal
    doc.setFillColor(...slate900);
    doc.rect(0, 0, 210, 55, 'F');

    // Borde superior con gradiente (simulado con líneas)
    doc.setFillColor(...blue600);
    doc.rect(0, 0, 210, 2, 'F');

    // Logo/Marca
    doc.setTextColor(...white);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('NovasuiteS', 14, 22);

    // Subtítulo
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('HOTEL & SUITES', 14, 29);

    // Información de contacto a la derecha
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    const contactX = 196;
    doc.text('Mitre 1600', contactX, 18, { align: 'right' });
    doc.text('Salta, Argentina', contactX, 23, { align: 'right' });
    doc.text('(0387) 431-0000', contactX, 28, { align: 'right' });
    doc.text('info@novasuites.com', contactX, 33, { align: 'right' });

    // Línea decorativa
    doc.setDrawColor(...blue600);
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);

    // Badge "Factura Tipo B"
    doc.setFillColor(...blue600);
    doc.roundedRect(14, 42, 35, 8, 2, 2, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA TIPO B', 31.5, 47.5, { align: 'center' });

    // Número de factura destacado
    doc.setFontSize(10);
    doc.setTextColor(...slate800);
    doc.text(`N° ${datos.numeroFactura}`, 196, 47.5, { align: 'right' });

    yPos = 62;

    // ===== INFORMACIÓN DEL CLIENTE =====
    // Card con sombra sutil
    doc.setFillColor(...slate50);
    doc.roundedRect(14, yPos, 90, 32, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.roundedRect(14, yPos, 90, 32, 2, 2, 'S');

    yPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...slate700);
    doc.text('CLIENTE', 16, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...slate800);
    doc.text(`${datos.huesped.nombre} ${datos.huesped.apellido}`, 16, yPos);

    yPos += 5;
    doc.setFontSize(8);
    doc.setTextColor(...slate600);
    doc.text(`DNI/CUIT: ${datos.huesped.documento}`, 16, yPos);

    if (datos.huesped.telefono) {
        yPos += 4;
        doc.text(`Tel: ${datos.huesped.telefono}`, 16, yPos);
    }
    if (datos.huesped.email) {
        yPos += 4;
        doc.text(`Email: ${datos.huesped.email}`, 16, yPos);
    }

    // ===== DETALLES DE LA ESTADÍA =====
    yPos = 62;
    doc.setFillColor(...slate50);
    doc.roundedRect(106, yPos, 90, 32, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(106, yPos, 90, 32, 2, 2, 'S');

    yPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...slate700);
    doc.text('ESTADÍA', 108, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...slate600);
    const habitacionesStr = datos.habitaciones.map(h => `${h.numero} (${h.tipo})`).join(', ');
    doc.text(`Habitación: ${habitacionesStr}`, 108, yPos);

    yPos += 4;
    doc.text(`Check-in: ${new Date(datos.fechaCheckin).toLocaleDateString('es-AR')}`, 108, yPos);

    yPos += 4;
    doc.text(`Check-out: ${new Date(datos.fechaCheckout).toLocaleDateString('es-AR')}`, 108, yPos);

    const nights = Math.ceil((new Date(datos.fechaCheckout).getTime() - new Date(datos.fechaCheckin).getTime()) / (1000 * 60 * 60 * 24));
    yPos += 4;
    doc.text(`Duración: ${nights} noche${nights !== 1 ? 's' : ''}`, 108, yPos);

    yPos += 4;
    doc.setTextColor(...slate800);
    doc.setFont('helvetica', 'bold');
    doc.text(`Fecha: ${datos.fechaEmision.toLocaleDateString('es-AR')}`, 108, yPos);

    yPos += 12;

    // ===== TABLA DE HOSPEDAJE =====
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...slate800);
    doc.text('Hospedaje', 14, yPos);

    yPos += 2;
    autoTable(doc, {
        startY: yPos,
        head: [['Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
        body: [[
            `Alojamiento - ${habitacionesStr}`,
            '1',
            `$${datos.montoHospedaje.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
            `$${datos.montoHospedaje.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
        ]],
        theme: 'plain',
        headStyles: {
            fillColor: slate800,
            textColor: white,
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: 4
        },
        bodyStyles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: slate800
        },
        alternateRowStyles: {
            fillColor: slate50
        },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 }
    });

    // ===== TABLA DE CONSUMOS =====
    yPos = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...slate800);
    doc.text('Consumos Adicionales', 14, yPos);

    yPos += 2;
    const consumosData = datos.consumos.map(c => [
        c.descripcion,
        c.cantidad.toString(),
        `$${c.precio_unitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
        `$${c.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
        body: consumosData,
        theme: 'plain',
        headStyles: {
            fillColor: purple600,
            textColor: white,
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: 4
        },
        bodyStyles: {
            fontSize: 8,
            cellPadding: 3,
            textColor: slate800
        },
        alternateRowStyles: {
            fillColor: slate50
        },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 }
    });

    // ===== TOTALES MODERNOS =====
    yPos = (doc as any).lastAutoTable.finalY + 12;

    const boxX = 120;
    const boxWidth = 76;

    // Card de totales con borde sutil
    doc.setFillColor(...slate50);
    doc.roundedRect(boxX, yPos, boxWidth, 38, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(boxX, yPos, boxWidth, 38, 2, 2, 'S');

    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...slate600);
    doc.text('Subtotal Hospedaje:', boxX + 4, yPos);
    doc.setTextColor(...slate800);
    doc.text(`$${datos.montoHospedaje.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, boxX + boxWidth - 4, yPos, { align: 'right' });

    yPos += 6;
    doc.setTextColor(...slate600);
    doc.text('Subtotal Consumos:', boxX + 4, yPos);
    doc.setTextColor(...slate800);
    doc.text(`$${datos.totalConsumos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, boxX + boxWidth - 4, yPos, { align: 'right' });

    // Línea separadora con gradiente (usando línea gruesa)
    yPos += 4;
    doc.setDrawColor(...blue600);
    doc.setLineWidth(1);
    doc.line(boxX + 4, yPos, boxX + boxWidth - 4, yPos);

    // Total destacado
    yPos += 8;
    doc.setFillColor(...blue600);
    doc.roundedRect(boxX + 2, yPos - 6, boxWidth - 4, 12, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...white);
    doc.text('TOTAL:', boxX + 6, yPos);
    doc.setFontSize(14);
    doc.text(`$${datos.totalFinal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, boxX + boxWidth - 6, yPos, { align: 'right' });

    // Método de pago
    if (datos.metodoPago) {
        yPos += 12;
        doc.setFontSize(8);
        doc.setTextColor(...slate600);
        doc.text(`Método de Pago: ${datos.metodoPago}`, boxX + 4, yPos);
    }

    // ===== PIE DE PÁGINA MINIMALISTA =====
    const pageHeight = doc.internal.pageSize.height;
    yPos = pageHeight - 25;

    // Línea decorativa
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, yPos, 196, yPos);

    yPos += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...slate600);
    doc.text('¡Gracias por su estadía en NovasuiteS!', 105, yPos, { align: 'center' });

    yPos += 5;
    doc.setFontSize(7);
    doc.setTextColor(...slate600);
    doc.text('Esperamos volver a recibirlo pronto.', 105, yPos, { align: 'center' });

    yPos += 6;
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Este documento es una factura válida. Conserve para futuras referencias.', 105, yPos, { align: 'center' });

    // Guardar PDF
    const nombreArchivo = `Factura_${datos.numeroFactura}_${datos.huesped.apellido}.pdf`;
    doc.save(nombreArchivo);
}
