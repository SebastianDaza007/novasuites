-- CreateTable
CREATE TABLE "public"."insumo" (
    "id_insumo" SERIAL NOT NULL,
    "nom_insumo" TEXT NOT NULL,
    "stock_min" INTEGER NOT NULL,
    "stock_max" INTEGER NOT NULL,
    "stock_actual" INTEGER NOT NULL,

    CONSTRAINT "insumo_pkey" PRIMARY KEY ("id_insumo")
);

-- CreateTable
CREATE TABLE "public"."deposito" (
    "id_deposito" SERIAL NOT NULL,
    "nom_deposito" TEXT NOT NULL,
    "tel_deposito" TEXT NOT NULL,
    "dir_deposito" TEXT NOT NULL,
    "stock_max_deposito" INTEGER NOT NULL,
    "stock_actual_deposito" INTEGER NOT NULL,

    CONSTRAINT "deposito_pkey" PRIMARY KEY ("id_deposito")
);

-- CreateTable
CREATE TABLE "public"."insumos_por_deposito" (
    "id_insumos_deposito" SERIAL NOT NULL,
    "id_insumo" INTEGER NOT NULL,
    "id_deposito" INTEGER NOT NULL,
    "stock_insumo" INTEGER NOT NULL,

    CONSTRAINT "insumos_por_deposito_pkey" PRIMARY KEY ("id_insumos_deposito")
);

-- CreateTable
CREATE TABLE "public"."detalle_movimiento" (
    "id_detalle_mov" SERIAL NOT NULL,
    "id_insumos_deposito" INTEGER NOT NULL,
    "id_mov_stock" INTEGER NOT NULL,
    "cantidad_mov" INTEGER NOT NULL,

    CONSTRAINT "detalle_movimiento_pkey" PRIMARY KEY ("id_detalle_mov")
);

-- CreateTable
CREATE TABLE "public"."movimiento_stock" (
    "id_mov_stock" SERIAL NOT NULL,
    "id_deposito" INTEGER NOT NULL,
    "id_tipo_mov" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimiento_stock_pkey" PRIMARY KEY ("id_mov_stock")
);

-- CreateTable
CREATE TABLE "public"."tipo_movimiento" (
    "id_tipo_mov" SERIAL NOT NULL,
    "nombre_mov" TEXT NOT NULL,

    CONSTRAINT "tipo_movimiento_pkey" PRIMARY KEY ("id_tipo_mov")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" SERIAL NOT NULL,
    "email_proveedor" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_proveedor_key" ON "public"."user"("email_proveedor");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "public"."role"("name");

-- AddForeignKey
ALTER TABLE "public"."insumos_por_deposito" ADD CONSTRAINT "insumos_por_deposito_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "public"."insumo"("id_insumo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."insumos_por_deposito" ADD CONSTRAINT "insumos_por_deposito_id_deposito_fkey" FOREIGN KEY ("id_deposito") REFERENCES "public"."deposito"("id_deposito") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalle_movimiento" ADD CONSTRAINT "detalle_movimiento_id_insumos_deposito_fkey" FOREIGN KEY ("id_insumos_deposito") REFERENCES "public"."insumos_por_deposito"("id_insumos_deposito") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalle_movimiento" ADD CONSTRAINT "detalle_movimiento_id_mov_stock_fkey" FOREIGN KEY ("id_mov_stock") REFERENCES "public"."movimiento_stock"("id_mov_stock") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movimiento_stock" ADD CONSTRAINT "movimiento_stock_id_deposito_fkey" FOREIGN KEY ("id_deposito") REFERENCES "public"."deposito"("id_deposito") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movimiento_stock" ADD CONSTRAINT "movimiento_stock_id_tipo_mov_fkey" FOREIGN KEY ("id_tipo_mov") REFERENCES "public"."tipo_movimiento"("id_tipo_mov") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movimiento_stock" ADD CONSTRAINT "movimiento_stock_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
