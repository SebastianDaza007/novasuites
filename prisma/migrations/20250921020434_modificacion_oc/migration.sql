/*
  Warnings:

  - Made the column `fecha_orden` on table `orden_compra` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fecha_entrega_estimada` on table `orden_compra` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."orden_compra" ALTER COLUMN "fecha_orden" SET NOT NULL,
ALTER COLUMN "fecha_entrega_estimada" SET NOT NULL;
