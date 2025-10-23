-- CreateTable
CREATE TABLE "public"."acompanante" (
    "id_acompanante" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "id_reserva" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acompanante_pkey" PRIMARY KEY ("id_acompanante")
);

-- AddForeignKey
ALTER TABLE "public"."acompanante" ADD CONSTRAINT "acompanante_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "public"."reservas"("id_reservas") ON DELETE CASCADE ON UPDATE CASCADE;
