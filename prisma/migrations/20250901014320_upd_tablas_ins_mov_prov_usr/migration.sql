/*
  Warnings:

  - You are about to drop the column `stock_actual_deposito` on the `deposito` table. All the data in the column will be lost.
  - You are about to drop the column `stock_max_deposito` on the `deposito` table. All the data in the column will be lost.
  - You are about to drop the column `nom_insumo` on the `insumo` table. All the data in the column will be lost.
  - You are about to drop the column `stock_actual` on the `insumo` table. All the data in the column will be lost.
  - You are about to drop the column `stock_max` on the `insumo` table. All the data in the column will be lost.
  - You are about to drop the column `stock_min` on the `insumo` table. All the data in the column will be lost.
  - The primary key for the `tipo_movimiento` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_tipo_mov` on the `tipo_movimiento` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_mov` on the `tipo_movimiento` table. All the data in the column will be lost.
  - You are about to drop the `detalle_movimiento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `insumos_por_deposito` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `movimiento_stock` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nombre_tipo]` on the table `tipo_movimiento` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `costo_unitario` to the `insumo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_actualizacion` to the `insumo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_insumo` to the `insumo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `afecta_stock` to the `tipo_movimiento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_tipo` to the `tipo_movimiento` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."detalle_movimiento" DROP CONSTRAINT "detalle_movimiento_id_insumos_deposito_fkey";

-- DropForeignKey
ALTER TABLE "public"."detalle_movimiento" DROP CONSTRAINT "detalle_movimiento_id_mov_stock_fkey";

-- DropForeignKey
ALTER TABLE "public"."insumos_por_deposito" DROP CONSTRAINT "insumos_por_deposito_id_deposito_fkey";

-- DropForeignKey
ALTER TABLE "public"."insumos_por_deposito" DROP CONSTRAINT "insumos_por_deposito_id_insumo_fkey";

-- DropForeignKey
ALTER TABLE "public"."movimiento_stock" DROP CONSTRAINT "movimiento_stock_id_deposito_fkey";

-- DropForeignKey
ALTER TABLE "public"."movimiento_stock" DROP CONSTRAINT "movimiento_stock_id_tipo_mov_fkey";

-- DropForeignKey
ALTER TABLE "public"."movimiento_stock" DROP CONSTRAINT "movimiento_stock_id_user_fkey";

-- AlterTable
ALTER TABLE "public"."deposito" DROP COLUMN "stock_actual_deposito",
DROP COLUMN "stock_max_deposito",
ADD COLUMN     "estado_deposito" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "responsable" TEXT,
ALTER COLUMN "tel_deposito" DROP NOT NULL,
ALTER COLUMN "dir_deposito" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."insumo" DROP COLUMN "nom_insumo",
DROP COLUMN "stock_actual",
DROP COLUMN "stock_max",
DROP COLUMN "stock_min",
ADD COLUMN     "costo_unitario" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "descripcion_insumo" TEXT,
ADD COLUMN     "estado_insumo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fecha_expiracion" TIMESTAMP(3),
ADD COLUMN     "id_categoria" INTEGER,
ADD COLUMN     "id_proveedor" INTEGER,
ADD COLUMN     "nombre_insumo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."tipo_movimiento" DROP CONSTRAINT "tipo_movimiento_pkey",
DROP COLUMN "id_tipo_mov",
DROP COLUMN "nombre_mov",
ADD COLUMN     "afecta_stock" TEXT NOT NULL,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "estado_tipo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "id_tipo_movimiento" SERIAL NOT NULL,
ADD COLUMN     "nombre_tipo" TEXT NOT NULL,
ADD CONSTRAINT "tipo_movimiento_pkey" PRIMARY KEY ("id_tipo_movimiento");

-- DropTable
DROP TABLE "public"."detalle_movimiento";

-- DropTable
DROP TABLE "public"."insumos_por_deposito";

-- DropTable
DROP TABLE "public"."movimiento_stock";

-- CreateTable
CREATE TABLE "public"."categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nombre_categoria" TEXT NOT NULL,
    "descripcion_categoria" TEXT,
    "estado_categoria" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "public"."proveedor" (
    "id_proveedor" SERIAL NOT NULL,
    "nombre_proveedor" TEXT NOT NULL,
    "cuit_proveedor" TEXT NOT NULL,
    "direccion_proveedor" TEXT NOT NULL,
    "telefono_proveedor" TEXT,
    "correo_proveedor" TEXT,
    "contacto_responsable" TEXT,
    "condiciones_pago" TEXT,
    "estado_proveedor" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proveedor_pkey" PRIMARY KEY ("id_proveedor")
);

-- CreateTable
CREATE TABLE "public"."stock_deposito" (
    "id_stock" SERIAL NOT NULL,
    "cantidad_actual" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 0,
    "stock_critico" INTEGER NOT NULL DEFAULT 0,
    "fecha_ultimo_mov" TIMESTAMP(3),
    "id_deposito" INTEGER NOT NULL,
    "id_insumo" INTEGER NOT NULL,

    CONSTRAINT "stock_deposito_pkey" PRIMARY KEY ("id_stock")
);

-- CreateTable
CREATE TABLE "public"."razon_movimiento" (
    "id_razon" SERIAL NOT NULL,
    "nombre_razon" TEXT NOT NULL,
    "descripcion" TEXT,
    "id_tipo_movimiento" INTEGER NOT NULL,

    CONSTRAINT "razon_movimiento_pkey" PRIMARY KEY ("id_razon")
);

-- CreateTable
CREATE TABLE "public"."movimiento_inventario" (
    "id_movimiento" SERIAL NOT NULL,
    "fecha_movimiento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numero_comprobante" TEXT,
    "observaciones" TEXT,
    "estado_movimiento" TEXT NOT NULL DEFAULT 'COMPLETADO',
    "id_deposito_origen" INTEGER,
    "id_deposito_destino" INTEGER,
    "id_tipo_movimiento" INTEGER NOT NULL,
    "id_razon_movimiento" INTEGER,
    "id_usuario" INTEGER NOT NULL,
    "id_orden_compra" INTEGER,

    CONSTRAINT "movimiento_inventario_pkey" PRIMARY KEY ("id_movimiento")
);

-- CreateTable
CREATE TABLE "public"."detalle_movimiento_inventario" (
    "id_detalle" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "costo_unitario" DECIMAL(10,2),
    "lote" TEXT,
    "fecha_vencimiento" TIMESTAMP(3),
    "id_movimiento" INTEGER NOT NULL,
    "id_insumo" INTEGER NOT NULL,

    CONSTRAINT "detalle_movimiento_inventario_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "public"."orden_compra" (
    "id_orden_compra" SERIAL NOT NULL,
    "numero_orden" TEXT NOT NULL,
    "fecha_orden" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega_estimada" TIMESTAMP(3),
    "estado_orden" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "total_orden" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "id_proveedor" INTEGER NOT NULL,
    "id_usuario_solicita" INTEGER NOT NULL,

    CONSTRAINT "orden_compra_pkey" PRIMARY KEY ("id_orden_compra")
);

-- CreateTable
CREATE TABLE "public"."detalle_orden_compra" (
    "id_detalle_orden" SERIAL NOT NULL,
    "cantidad_solicitada" INTEGER NOT NULL,
    "cantidad_recibida" INTEGER NOT NULL DEFAULT 0,
    "precio_unitario" DECIMAL(18,2) NOT NULL,
    "subtotal" DECIMAL(18,2) NOT NULL,
    "id_orden_compra" INTEGER NOT NULL,
    "id_insumo" INTEGER NOT NULL,

    CONSTRAINT "detalle_orden_compra_pkey" PRIMARY KEY ("id_detalle_orden")
);

-- CreateTable
CREATE TABLE "public"."factura_proveedor" (
    "id_factura" SERIAL NOT NULL,
    "numero_factura" TEXT NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "monto_total" DECIMAL(18,2) NOT NULL,
    "estado_factura" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "id_proveedor" INTEGER NOT NULL,
    "id_orden_compra" INTEGER,

    CONSTRAINT "factura_proveedor_pkey" PRIMARY KEY ("id_factura")
);

-- CreateTable
CREATE TABLE "public"."alerta_stock" (
    "id_alerta" SERIAL NOT NULL,
    "tipo_alerta" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fecha_alerta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_alerta" TEXT NOT NULL DEFAULT 'ACTIVA',
    "fecha_resolucion" TIMESTAMP(3),
    "id_insumo" INTEGER NOT NULL,
    "id_deposito" INTEGER NOT NULL,
    "id_usuario_asignado" INTEGER,

    CONSTRAINT "alerta_stock_pkey" PRIMARY KEY ("id_alerta")
);

-- CreateIndex
CREATE UNIQUE INDEX "proveedor_cuit_proveedor_key" ON "public"."proveedor"("cuit_proveedor");

-- CreateIndex
CREATE UNIQUE INDEX "orden_compra_numero_orden_key" ON "public"."orden_compra"("numero_orden");

-- CreateIndex
CREATE UNIQUE INDEX "factura_proveedor_numero_factura_key" ON "public"."factura_proveedor"("numero_factura");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_movimiento_nombre_tipo_key" ON "public"."tipo_movimiento"("nombre_tipo");

-- AddForeignKey
ALTER TABLE "public"."insumo" ADD CONSTRAINT "insumo_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "public"."categoria"("id_categoria") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."insumo" ADD CONSTRAINT "insumo_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "public"."proveedor"("id_proveedor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_deposito" ADD CONSTRAINT "stock_deposito_id_deposito_fkey" FOREIGN KEY ("id_deposito") REFERENCES "public"."deposito"("id_deposito") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_deposito" ADD CONSTRAINT "stock_deposito_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "public"."insumo"("id_insumo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."razon_movimiento" ADD CONSTRAINT "razon_movimiento_id_tipo_movimiento_fkey" FOREIGN KEY ("id_tipo_movimiento") REFERENCES "public"."tipo_movimiento"("id_tipo_movimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_id_deposito_origen_fkey" FOREIGN KEY ("id_deposito_origen") REFERENCES "public"."deposito"("id_deposito") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_id_deposito_destino_fkey" FOREIGN KEY ("id_deposito_destino") REFERENCES "public"."deposito"("id_deposito") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_id_tipo_movimiento_fkey" FOREIGN KEY ("id_tipo_movimiento") REFERENCES "public"."tipo_movimiento"("id_tipo_movimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_id_razon_movimiento_fkey" FOREIGN KEY ("id_razon_movimiento") REFERENCES "public"."razon_movimiento"("id_razon") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_id_orden_compra_fkey" FOREIGN KEY ("id_orden_compra") REFERENCES "public"."orden_compra"("id_orden_compra") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalle_movimiento_inventario" ADD CONSTRAINT "detalle_movimiento_inventario_id_movimiento_fkey" FOREIGN KEY ("id_movimiento") REFERENCES "public"."movimiento_inventario"("id_movimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalle_movimiento_inventario" ADD CONSTRAINT "detalle_movimiento_inventario_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "public"."insumo"("id_insumo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orden_compra" ADD CONSTRAINT "orden_compra_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "public"."proveedor"("id_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orden_compra" ADD CONSTRAINT "orden_compra_id_usuario_solicita_fkey" FOREIGN KEY ("id_usuario_solicita") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalle_orden_compra" ADD CONSTRAINT "detalle_orden_compra_id_orden_compra_fkey" FOREIGN KEY ("id_orden_compra") REFERENCES "public"."orden_compra"("id_orden_compra") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalle_orden_compra" ADD CONSTRAINT "detalle_orden_compra_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "public"."insumo"("id_insumo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."factura_proveedor" ADD CONSTRAINT "factura_proveedor_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "public"."proveedor"("id_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."factura_proveedor" ADD CONSTRAINT "factura_proveedor_id_orden_compra_fkey" FOREIGN KEY ("id_orden_compra") REFERENCES "public"."orden_compra"("id_orden_compra") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alerta_stock" ADD CONSTRAINT "alerta_stock_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "public"."insumo"("id_insumo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alerta_stock" ADD CONSTRAINT "alerta_stock_id_deposito_fkey" FOREIGN KEY ("id_deposito") REFERENCES "public"."deposito"("id_deposito") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alerta_stock" ADD CONSTRAINT "alerta_stock_id_usuario_asignado_fkey" FOREIGN KEY ("id_usuario_asignado") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
