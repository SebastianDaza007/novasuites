/*
  Warnings:

  - You are about to drop the column `fecha_creacion` on the `orden_compra` table. All the data in the column will be lost.
  - You are about to drop the column `condiciones_pago` on the `proveedor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."orden_compra" DROP COLUMN "fecha_creacion";

-- AlterTable
ALTER TABLE "public"."proveedor" DROP COLUMN "condiciones_pago";
