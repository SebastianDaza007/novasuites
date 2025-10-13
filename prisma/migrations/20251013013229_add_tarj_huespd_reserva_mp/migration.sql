/*
  Warnings:

  - You are about to drop the column `actualizado_en` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `cantidad_personas` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `creado_en` on the `reservas` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_tarjeta]` on the table `reservas` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."reservas" DROP COLUMN "actualizado_en",
DROP COLUMN "cantidad_personas",
DROP COLUMN "creado_en",
ADD COLUMN     "cantidad_adultos" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "cantidad_menores" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fecha_actualizacion" TIMESTAMP(3),
ADD COLUMN     "fecha_creacion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_metodo_pago" INTEGER,
ADD COLUMN     "id_tarjeta" INTEGER;

-- CreateTable
CREATE TABLE "public"."metodo_pago" (
    "id_metodo" SERIAL NOT NULL,
    "nombre_metodo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "metodo_pago_pkey" PRIMARY KEY ("id_metodo")
);

-- CreateTable
CREATE TABLE "public"."tarjeta_huesped" (
    "id_tarjeta" SERIAL NOT NULL,
    "id_huesped" INTEGER NOT NULL,
    "numero_tarjeta" TEXT NOT NULL,
    "titular_tarjeta" TEXT NOT NULL,
    "fecha_expiracion" DATE NOT NULL,
    "codigo_seguridad" INTEGER NOT NULL,

    CONSTRAINT "tarjeta_huesped_pkey" PRIMARY KEY ("id_tarjeta")
);

-- CreateIndex
CREATE UNIQUE INDEX "reservas_id_tarjeta_key" ON "public"."reservas"("id_tarjeta");

-- AddForeignKey
ALTER TABLE "public"."reservas" ADD CONSTRAINT "reservas_id_metodo_pago_fkey" FOREIGN KEY ("id_metodo_pago") REFERENCES "public"."metodo_pago"("id_metodo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reservas" ADD CONSTRAINT "reservas_id_tarjeta_fkey" FOREIGN KEY ("id_tarjeta") REFERENCES "public"."tarjeta_huesped"("id_tarjeta") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tarjeta_huesped" ADD CONSTRAINT "tarjeta_huesped_id_huesped_fkey" FOREIGN KEY ("id_huesped") REFERENCES "public"."huespedes"("id_huespedes") ON DELETE RESTRICT ON UPDATE CASCADE;
