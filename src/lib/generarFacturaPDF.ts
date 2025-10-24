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

    // Configuración de colores
    const colorPrimario = [41, 128, 185]; // Azul
    const colorSecundario = [52, 73, 94]; // Gris oscuro
    const colorExito = [39, 174, 96]; // Verde

    let yPos = 20;

    // ===== ENCABEZADO =====
    doc.setFillColor(...colorPrimario);
    doc.rect(0, 0, 210, 40, 'F');

    // Logo/Nombre del hotel
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('NOVASUITES HOTEL', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Av. Libertador 1234, Buenos Aires, Argentina', 105, 28, { align: 'center' });
    doc.text('Tel: (011) 4567-8900 | Email: info@novasuites.com', 105, 34, { align: 'center' });

    yPos = 50;

    // ===== INFORMACIÓN DE LA FACTURA =====
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA TIPO B', 14, yPos);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 8;
    doc.text(`Número: ${datos.numeroFactura}`, 14, yPos);
    yPos += 6;
    doc.text(`Fecha de Emisión: ${datos.fechaEmision.toLocaleDateString('es-AR')}`, 14, yPos);

    // Cuadro de información del cliente
    yPos += 10;
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, 182, 28, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(14, yPos, 182, 28);

    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL CLIENTE', 16, yPos);

    doc.setFont('helvetica', 'normal');
    yPos += 6;
    doc.text(`Nombre: ${datos.huesped.nombre} ${datos.huesped.apellido}`, 16, yPos);
    yPos += 5;
    doc.text(`DNI/CUIT: ${datos.huesped.documento}`, 16, yPos);

    if (datos.huesped.telefono) {
        doc.text(`Teléfono: ${datos.huesped.telefono}`, 110, yPos - 5);
    }
    if (datos.huesped.email) {
        doc.text(`Email: ${datos.huesped.email}`, 110, yPos);
    }

    // ===== DETALLES DE LA ESTADÍA =====
    yPos += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DETALLES DE LA ESTADÍA', 14, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const habitacionesStr = datos.habitaciones.map(h => `${h.numero} (${h.tipo})`).join(', ');
    doc.text(`Habitación(es): ${habitacionesStr}`, 16, yPos);
    yPos += 5;
    doc.text(`Check-in: ${new Date(datos.fechaCheckin).toLocaleDateString('es-AR')}`, 16, yPos);
    doc.text(`Check-out: ${new Date(datos.fechaCheckout).toLocaleDateString('es-AR')}`, 110, yPos);

    // Calcular noches
    const nights = Math.ceil((new Date(datos.fechaCheckout).getTime() - new Date(datos.fechaCheckin).getTime()) / (1000 * 60 * 60 * 24));
    yPos += 5;
    doc.text(`Duración: ${nights} noche${nights !== 1 ? 's' : ''}`, 16, yPos);

    // ===== TABLA DE HOSPEDAJE =====
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('HOSPEDAJE', 14, yPos);

    yPos += 2;
    autoTable(doc, {
        startY: yPos,
        head: [['Descripción', 'Cant.', 'P. Unitario', 'Subtotal']],
        body: [[
            `Hospedaje - ${habitacionesStr}`,
            '1',
            `$${datos.montoHospedaje.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
            `$${datos.montoHospedaje.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
        ]],
        theme: 'striped',
        headStyles: {
            fillColor: colorPrimario,
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9
        },
        bodyStyles: {
            fontSize: 9
        },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' }
        },
        margin: { left: 14, right: 14 }
    });

    // ===== TABLA DE CONSUMOS =====
    yPos = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('CONSUMOS ADICIONALES', 14, yPos);

    yPos += 2;
    const consumosData = datos.consumos.map(c => [
        c.descripcion,
        c.cantidad.toString(),
        `$${c.precio_unitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
        `$${c.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Descripción', 'Cant.', 'P. Unitario', 'Subtotal']],
        body: consumosData,
        theme: 'striped',
        headStyles: {
            fillColor: colorExito,
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9
        },
        bodyStyles: {
            fontSize: 8
        },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' }
        },
        margin: { left: 14, right: 14 }
    });

    // ===== TOTALES =====
    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Cuadro de totales
    const boxX = 120;
    const boxWidth = 76;

    doc.setFillColor(250, 250, 250);
    doc.rect(boxX, yPos, boxWidth, 30, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(boxX, yPos, boxWidth, 30);

    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Subtotal Hospedaje:', boxX + 4, yPos);
    doc.text(`$${datos.montoHospedaje.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, boxX + boxWidth - 4, yPos, { align: 'right' });

    yPos += 6;
    doc.text('Subtotal Consumos:', boxX + 4, yPos);
    doc.text(`$${datos.totalConsumos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, boxX + boxWidth - 4, yPos, { align: 'right' });

    // Línea separadora
    yPos += 3;
    doc.setDrawColor(...colorPrimario);
    doc.setLineWidth(0.5);
    doc.line(boxX + 4, yPos, boxX + boxWidth - 4, yPos);

    // Total
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...colorExito);
    doc.text('TOTAL:', boxX + 4, yPos);
    doc.text(`$${datos.totalFinal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, boxX + boxWidth - 4, yPos, { align: 'right' });

    // Método de pago
    if (datos.metodoPago) {
        yPos += 8;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Método de Pago: ${datos.metodoPago}`, boxX + 4, yPos);
    }

    // ===== PIE DE PÁGINA =====
    const pageHeight = doc.internal.pageSize.height;
    yPos = pageHeight - 30;

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('¡Gracias por su estadía en NovasuiteS Hotel!', 105, yPos, { align: 'center' });
    yPos += 5;
    doc.text('Esperamos volver a recibirlo pronto.', 105, yPos, { align: 'center' });

    // Línea final
    yPos += 8;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(14, yPos, 196, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.text('Este documento es una factura válida. Conserve para futuras referencias.', 105, yPos, { align: 'center' });

    // Guardar PDF
    const nombreArchivo = `Factura_${datos.numeroFactura}_${datos.huesped.apellido}.pdf`;
    doc.save(nombreArchivo);
}
