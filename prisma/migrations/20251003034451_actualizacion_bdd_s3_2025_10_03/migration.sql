-- CreateEnum
CREATE TYPE "public"."tipo_habitacion" AS ENUM ('single', 'doble', 'suite');

-- CreateEnum
CREATE TYPE "public"."estado_habitacion" AS ENUM ('DISPONIBLE', 'OCUPADA', 'LIMPIEZA', 'MANTENIMIENTO');

-- CreateEnum
CREATE TYPE "public"."estado_reservacion" AS ENUM ('RESERVADA', 'CHECKIN', 'CHECKOUT', 'CANCELADA');

-- AlterTable
ALTER TABLE "public"."factura_proveedor" ADD COLUMN     "id_orden_pago" INTEGER;

-- CreateTable
CREATE TABLE "public"."huespedes" (
    "id_huespedes" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,

    CONSTRAINT "huespedes_pkey" PRIMARY KEY ("id_huespedes")
);

-- CreateTable
CREATE TABLE "public"."habitaciones" (
    "id_habitaciones" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "public"."tipo_habitacion" NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "precio_base" DECIMAL(12,2) NOT NULL,
    "estado" "public"."estado_habitacion" NOT NULL,

    CONSTRAINT "habitaciones_pkey" PRIMARY KEY ("id_habitaciones")
);

-- CreateTable
CREATE TABLE "public"."reservas" (
    "id_reservas" SERIAL NOT NULL,
    "id_huesped" INTEGER NOT NULL,
    "fecha_checkin" DATE NOT NULL,
    "fecha_checkout" DATE NOT NULL,
    "cantidad_personas" INTEGER NOT NULL,
    "estado" "public"."estado_reservacion" NOT NULL,
    "monto_total" DECIMAL(12,2) NOT NULL,
    "creado_en" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3),

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id_reservas")
);

-- CreateTable
CREATE TABLE "public"."reservas_habitaciones" (
    "id_reservas_habitaciones" SERIAL NOT NULL,
    "id_reserva" INTEGER NOT NULL,
    "id_habitacion" INTEGER NOT NULL,
    "cantidad_personas" INTEGER NOT NULL,

    CONSTRAINT "reservas_habitaciones_pkey" PRIMARY KEY ("id_reservas_habitaciones")
);

-- CreateTable
CREATE TABLE "public"."housekeeping" (
    "id_housekeeping" SERIAL NOT NULL,
    "id_habitacion" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "tarea" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "observaciones" TEXT,
    "asignado_a" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "housekeeping_pkey" PRIMARY KEY ("id_housekeeping")
);

-- CreateTable
CREATE TABLE "public"."facturas_ventas" (
    "id_facturas_ventas" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "id_reserva" INTEGER NOT NULL,
    "fecha_emision" DATE NOT NULL,
    "fecha_vencimiento" DATE NOT NULL,
    "monto_total" DECIMAL(12,2) NOT NULL,
    "estado" "public"."estados_factura" NOT NULL,
    "creado_en" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3),

    CONSTRAINT "facturas_ventas_pkey" PRIMARY KEY ("id_facturas_ventas")
);

-- CreateTable
CREATE TABLE "public"."detalle_facturas_ventas" (
    "id_detalle_facturas_ventas" SERIAL NOT NULL,
    "id_factura" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "detalle_facturas_ventas_pkey" PRIMARY KEY ("id_detalle_facturas_ventas")
);

-- CreateTable
CREATE TABLE "public"."notas_credito" (
    "id_notas_credito" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "id_factura" INTEGER NOT NULL,
    "fecha_emision" DATE NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "motivo" TEXT,

    CONSTRAINT "notas_credito_pkey" PRIMARY KEY ("id_notas_credito")
);

-- CreateTable
CREATE TABLE "public"."notas_debito" (
    "id_notas_debito" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "id_factura" INTEGER NOT NULL,
    "fecha_emision" DATE NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "motivo" TEXT,

    CONSTRAINT "notas_debito_pkey" PRIMARY KEY ("id_notas_debito")
);

-- CreateTable
CREATE TABLE "public"."ordenes_pago" (
    "id_ordenes_pago" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ordenes_pago_pkey" PRIMARY KEY ("id_ordenes_pago")
);

-- CreateTable
CREATE TABLE "public"."detalle_orden_pago" (
    "id_detalles_orden_pago" SERIAL NOT NULL,
    "id_orden_pago" INTEGER NOT NULL,
    "id_nota_credito" INTEGER,
    "id_nota_debito" INTEGER,

    CONSTRAINT "detalle_orden_pago_pkey" PRIMARY KEY ("id_detalles_orden_pago")
);

-- CreateIndex
CREATE UNIQUE INDEX "habitaciones_numero_key" ON "public"."habitaciones"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "reservas_habitaciones_id_reserva_id_habitacion_key" ON "public"."reservas_habitaciones"("id_reserva", "id_habitacion");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_ventas_numero_key" ON "public"."facturas_ventas"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "notas_credito_numero_key" ON "public"."notas_credito"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "notas_debito_numero_key" ON "public"."notas_debito"("numero");

-- AddForeignKey
ALTER TABLE "public"."factura_proveedor" ADD CONSTRAINT "factura_proveedor_id_orden_pago_fkey" FOREIGN KEY ("id_orden_pago") REFERENCES "public"."ordenes_pago"("id_ordenes_pago") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."reservas" ADD CONSTRAINT "reservas_id_huesped_fkey" FOREIGN KEY ("id_huesped") REFERENCES "public"."huespedes"("id_huespedes") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reservas_habitaciones" ADD CONSTRAINT "reservas_habitaciones_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "public"."reservas"("id_reservas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reservas_habitaciones" ADD CONSTRAINT "reservas_habitaciones_id_habitacion_fkey" FOREIGN KEY ("id_habitacion") REFERENCES "public"."habitaciones"("id_habitaciones") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."housekeeping" ADD CONSTRAINT "housekeeping_id_habitacion_fkey" FOREIGN KEY ("id_habitacion") REFERENCES "public"."habitaciones"("id_habitaciones") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."housekeeping" ADD CONSTRAINT "housekeeping_asignado_a_fkey" FOREIGN KEY ("asignado_a") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facturas_ventas" ADD CONSTRAINT "facturas_ventas_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "public"."reservas"("id_reservas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalle_facturas_ventas" ADD CONSTRAINT "detalle_facturas_ventas_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "public"."facturas_ventas"("id_facturas_ventas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notas_credito" ADD CONSTRAINT "notas_credito_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "public"."factura_proveedor"("id_factura") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notas_debito" ADD CONSTRAINT "notas_debito_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "public"."factura_proveedor"("id_factura") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalle_orden_pago" ADD CONSTRAINT "detalle_orden_pago_id_orden_pago_fkey" FOREIGN KEY ("id_orden_pago") REFERENCES "public"."ordenes_pago"("id_ordenes_pago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalle_orden_pago" ADD CONSTRAINT "detalle_orden_pago_id_nota_credito_fkey" FOREIGN KEY ("id_nota_credito") REFERENCES "public"."notas_credito"("id_notas_credito") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalle_orden_pago" ADD CONSTRAINT "detalle_orden_pago_id_nota_debito_fkey" FOREIGN KEY ("id_nota_debito") REFERENCES "public"."notas_debito"("id_notas_debito") ON DELETE SET NULL ON UPDATE CASCADE;
