/*
  Warnings:

  - A unique constraint covering the columns `[id_deposito,id_insumo]` on the table `stock_deposito` will be added. If there are existing duplicate values, this will fail.
  - Made the column `id_categoria` on table `insumo` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."insumo" DROP CONSTRAINT "insumo_id_categoria_fkey";

-- AlterTable
ALTER TABLE "public"."insumo" ALTER COLUMN "id_categoria" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "stock_deposito_id_deposito_id_insumo_key" ON "public"."stock_deposito"("id_deposito", "id_insumo");

-- AddForeignKey
ALTER TABLE "public"."insumo" ADD CONSTRAINT "insumo_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "public"."categoria"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;
