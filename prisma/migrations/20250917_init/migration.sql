-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."estados_factura" AS ENUM ('PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA');

-- CreateEnum
CREATE TYPE "public"."estados_orden" AS ENUM ('PENDIENTE', 'APROBADA', 'RECIBIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "public"."tipo_factura" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "public"."tipos_movimiento" AS ENUM ('ALTA', 'BAJA', 'TRANSFERENCIA_SALIDA', 'TRANSFERENCIA_ENTRADA', 'AJUSTE');

-- CreateTable
CREATE TABLE "public"."categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nombre_categoria" TEXT NOT NULL,
    "descripcion_categoria" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "public"."insumo" (
    "id_insumo" SERIAL NOT NULL,
    "nombre_insumo" TEXT NOT NULL,
    "descripcion_insumo" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_actualizacion" TIMESTAMP(6),
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "id_categoria" INTEGER NOT NULL,

    CONSTRAINT "insumo_pkey" PRIMARY KEY ("id_insumo")
);

-- CreateTable
CREATE TABLE "public"."proveedor" (
    "id_proveedor" SERIAL NOT NULL,
    "nombre_proveedor" TEXT NOT NULL,
    "cuit_proveedor" DECIMAL(11,0) NOT NULL,
    "direccion_proveedor" TEXT NOT NULL,
    "telefono_proveedor" INTEGER,
    "correo_proveedor" TEXT,
    "nombre_responsable" TEXT,
    "contacto_responsable" INTEGER,
    "condiciones_pago" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(6),

    CONSTRAINT "proveedor_pkey" PRIMARY KEY ("id_proveedor")
);

-- CreateTable
CREATE TABLE "public"."deposito" (
    "id_deposito" SERIAL NOT NULL,
    "nombre_deposito" TEXT NOT NULL,
    "telefono_deposito" INTEGER,
    "direccion_deposito" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "id_responsable" INTEGER,

    CONSTRAINT "deposito_pkey" PRIMARY KEY ("id_deposito")
);

-- CreateTable
CREATE TABLE "public"."stock_deposito" (
    "id_stock" SERIAL NOT NULL,
    "cantidad_actual" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 0,
    "stock_critico" INTEGER NOT NULL DEFAULT 0,
    "stock_maximo" INTEGER NOT NULL DEFAULT 0,
    "fecha_ultimo_mov" TIMESTAMP(6),
    "id_deposito" INTEGER NOT NULL,
    "id_insumo" INTEGER NOT NULL,

    CONSTRAINT "stock_deposito_pkey" PRIMARY KEY ("id_stock")
);

-- CreateTable
CREATE TABLE "public"."razon_movimiento" (
    "id_razon" SERIAL NOT NULL,
    "nombre_razon" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo_movimiento" "public"."tipos_movimiento" NOT NULL,

    CONSTRAINT "razon_movimiento_pkey" PRIMARY KEY ("id_razon")
);

-- CreateTable
CREATE TABLE "public"."movimiento_inventario" (
    "id_movimiento" SERIAL NOT NULL,
    "fecha_movimiento" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "numero_comprobante" TEXT,
    "observaciones" TEXT,
    "id_deposito" INTEGER,
    "id_orden_compra" INTEGER,
    "id_razon_movimiento" INTEGER,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "movimiento_inventario_pkey" PRIMARY KEY ("id_movimiento")
);

-- CreateTable
CREATE TABLE "public"."detalle_movimiento_inventario" (
    "id_detalle" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "costo_unitario" DECIMAL(10,2),
    "lote" TEXT,
    "fecha_vencimiento" TIMESTAMP(6),
    "id_movimiento" INTEGER NOT NULL,
    "id_insumo" INTEGER NOT NULL,

    CONSTRAINT "detalle_movimiento_inventario_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "public"."orden_compra" (
    "id_orden_compra" SERIAL NOT NULL,
    "numero_orden" TEXT NOT NULL,
    "fecha_orden" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega_estimada" TIMESTAMP(6),
    "estado_orden" "public"."estados_orden" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(6),
    "id_proveedor" INTEGER NOT NULL,
    "id_usuario_solicita" INTEGER NOT NULL,

    CONSTRAINT "orden_compra_pkey" PRIMARY KEY ("id_orden_compra")
);

-- CreateTable
CREATE TABLE "public"."detalle_orden_compra" (
    "id_detalle_orden" SERIAL NOT NULL,
    "cantidad_solicitada" INTEGER NOT NULL,
    "id_orden_compra" INTEGER NOT NULL,
    "id_insumo" INTEGER NOT NULL,

    CONSTRAINT "detalle_orden_compra_pkey" PRIMARY KEY ("id_detalle_orden")
);

-- CreateTable
CREATE TABLE "public"."factura_proveedor" (
    "id_factura" SERIAL NOT NULL,
    "numero_factura" TEXT NOT NULL,
    "tipo" "public"."tipo_factura" NOT NULL,
    "fecha_emision" TIMESTAMP(6) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(6) NOT NULL,
    "estado_factura" "public"."estados_factura" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(6),
    "id_proveedor" INTEGER NOT NULL,
    "id_orden_compra" INTEGER,

    CONSTRAINT "factura_proveedor_pkey" PRIMARY KEY ("id_factura")
);

-- CreateTable
CREATE TABLE "public"."detalle_factura_proveedor" (
    "id_detalle_factura" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "id_factura" INTEGER NOT NULL,
    "id_insumo" INTEGER NOT NULL,

    CONSTRAINT "detalle_factura_proveedor_pkey" PRIMARY KEY ("id_detalle_factura")
);

-- CreateTable
CREATE TABLE "public"."insumo_proveedor" (
    "id_insumo_proveedor" SERIAL NOT NULL,
    "id_insumo" INTEGER,
    "id_proveedor" INTEGER,

    CONSTRAINT "insumo_proveedor_pkey" PRIMARY KEY ("id_insumo_proveedor")
);

-- CreateTable
CREATE TABLE "public"."rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(6),
    "id_rol" INTEGER NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proveedor_cuit_proveedor_key" ON "public"."proveedor"("cuit_proveedor");

-- CreateIndex
CREATE UNIQUE INDEX "stock_deposito_id_deposito_id_insumo_idx" ON "public"."stock_deposito"("id_deposito", "id_insumo");

-- CreateIndex
CREATE UNIQUE INDEX "orden_compra_numero_orden_key" ON "public"."orden_compra"("numero_orden");

-- CreateIndex
CREATE UNIQUE INDEX "factura_proveedor_numero_factura_key" ON "public"."factura_proveedor"("numero_factura");

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_key" ON "public"."rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "public"."usuario"("email");

-- AddForeignKey
ALTER TABLE "public"."insumo" ADD CONSTRAINT "insumo_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "public"."categoria"("id_categoria") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."deposito" ADD CONSTRAINT "deposito_id_responsable_fkey" FOREIGN KEY ("id_responsable") REFERENCES "public"."usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."stock_deposito" ADD CONSTRAINT "stock_deposito_id_deposito_fkey" FOREIGN KEY ("id_deposito") REFERENCES "public"."deposito"("id_deposito") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."stock_deposito" ADD CONSTRAINT "stock_deposito_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "public"."insumo"("id_insumo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_id_deposito_fkey" FOREIGN KEY ("id_deposito") REFERENCES "public"."deposito"("id_deposito") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_id_orden_compra_fkey" FOREIGN KEY ("id_orden_compra") REFERENCES "public"."orden_compra"("id_orden_compra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_id_razon_movimiento_fkey" FOREIGN KEY ("id_razon_movimiento") REFERENCES "public"."razon_movimiento"("id_razon") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."detalle_movimiento_inventario" ADD CONSTRAINT "detalle_movimiento_inventario_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "public"."insumo"("id_insumo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."detalle_movimiento_inventario" ADD CONSTRAINT "detalle_movimiento_inventario_id_movimiento_fkey" FOREIGN KEY ("id_movimiento") REFERENCES "public"."movimiento_inventario"("id_movimiento") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."orden_compra" ADD CONSTRAINT "orden_compra_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "public"."proveedor"("id_proveedor") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."orden_compra" ADD CONSTRAINT "orden_compra_id_usuario_solicita_fkey" FOREIGN KEY ("id_usuario_solicita") REFERENCES "public"."usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."detalle_orden_compra" ADD CONSTRAINT "detalle_orden_compra_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "public"."insumo"("id_insumo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."detalle_orden_compra" ADD CONSTRAINT "detalle_orden_compra_id_orden_compra_fkey" FOREIGN KEY ("id_orden_compra") REFERENCES "public"."orden_compra"("id_orden_compra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."factura_proveedor" ADD CONSTRAINT "factura_proveedor_id_orden_compra_fkey" FOREIGN KEY ("id_orden_compra") REFERENCES "public"."orden_compra"("id_orden_compra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."factura_proveedor" ADD CONSTRAINT "factura_proveedor_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "public"."proveedor"("id_proveedor") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."detalle_factura_proveedor" ADD CONSTRAINT "detalle_factura_proveedor_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "public"."factura_proveedor"("id_factura") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."detalle_factura_proveedor" ADD CONSTRAINT "detalle_factura_proveedor_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "public"."insumo"("id_insumo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."insumo_proveedor" ADD CONSTRAINT "insumo_proveedor_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "public"."insumo"("id_insumo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."insumo_proveedor" ADD CONSTRAINT "insumo_proveedor_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "public"."proveedor"("id_proveedor") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."usuario" ADD CONSTRAINT "usuario_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "public"."rol"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

