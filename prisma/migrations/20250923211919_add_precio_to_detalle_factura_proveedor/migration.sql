/*
  Warnings:

  - You are about to drop the column `costo_unitario` on the `detalle_movimiento_inventario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."detalle_factura_proveedor" ADD COLUMN     "precio" DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE "public"."detalle_movimiento_inventario" DROP COLUMN "costo_unitario";
