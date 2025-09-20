export const dynamic = "force-dynamic";    // 👈 desactiva cache de ruta
export const revalidate = 0;

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const toInt = (v: string | null, d: number) => {
  const n = v ? Number.parseInt(v) : d;
  return Number.isFinite(n) && n > 0 ? n : d;
};

const onlyDigits = (v: unknown) => String(v ?? "").replace(/\D/g, "");
const is11 = (s: string) => /^\d{11}$/.test(s);
const fmtCuit = (raw: string | null | any) => {
  if (!raw) return raw;
  const s = String(raw).padStart(11, "0");
  return `${s.slice(0,2)}-${s.slice(2,10)}-${s.slice(10)}`;
};
const phoneInt = (v: unknown): number | null => {
  const digits = onlyDigits(v);
  if (!digits) return null;
  const n = Number(digits);
  if (!Number.isFinite(n)) throw new Error("telefono inválido");
  if (n > 2147483647) throw new Error("telefono excede INT4 (2147483647)");
  return n;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = toInt(searchParams.get("page"), 1);
  const pageSize = Math.min(toInt(searchParams.get("pageSize"), 10), 100);
  const q = searchParams.get("q") || undefined;
  const cuit = searchParams.get("cuit") || undefined;
  const estado = searchParams.get("estado") as "activo" | "inactivo" | null;

  const where: any = {};
  if (q) where.nombre_proveedor = { contains: q, mode: "insensitive" };
  if (cuit) {
    const digits = onlyDigits(cuit);
    if (digits) where.cuit_proveedor = { contains: digits }; // ahora es String 🎉
  }
  if (estado === "activo") where.activo = true;
  if (estado === "inactivo") where.activo = false;

  const [items, total] = await Promise.all([
    prisma.proveedor.findMany({
      where,
      orderBy: { fecha_actualizacion: "desc" }, // existe en tu schema
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.proveedor.count({ where }),
  ]);

  // formateamos CUIT con puntos para la UI
  const itemsFmt = items.map(p => ({
    ...p,
    cuit_proveedor: p.cuit_proveedor ? fmtCuit(p.cuit_proveedor) : p.cuit_proveedor,
  }));

  return NextResponse.json(
    {
      items: itemsFmt,
      page, pageSize, total, totalPages: Math.ceil(total / pageSize),
    },
    { headers: { "Cache-Control": "no-store" } }   // 👈 cabecera anti-caché
  );
}

export async function POST(req: Request) {
  try {
    const b = await req.json();

    const nombre = b.nombre ?? b.nombre_prov ?? b.nombre_proveedor;
    const direccion = b.direccion_proveedor ?? b.domicilio;
    const cuitDigits = onlyDigits(b.cuit_proveedor ?? b.cuitCuil);

    if (!nombre) throw new Error("nombre_proveedor es requerido");
    if (!direccion) throw new Error("direccion_proveedor es requerido");
    if (!is11(cuitDigits)) throw new Error("cuit_proveedor debe tener 11 dígitos");

    const created = await prisma.proveedor.create({
      data: {
        nombre_proveedor: nombre,
        direccion_proveedor: direccion,
        cuit_proveedor: cuitDigits, // guardamos solo dígitos
        telefono_proveedor: phoneInt(b.telefono ?? b.telefono_proveedor),
        contacto_responsable: phoneInt(b.telefonoResp ?? b.contacto_responsable),
        correo_proveedor: b.correo ?? b.email ?? b.correo_proveedor ?? null,
        condiciones_pago: b.condiciones_pago ?? null,
        observaciones: b.observaciones ?? null,
        activo: b.activo ?? true,
      },
    });

    // devolver formateado para la UI
    return NextResponse.json(
      { ...created, cuit_proveedor: fmtCuit(created.cuit_proveedor) },
      { status: 201 }
    );
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "CUIT ya existe" }, { status: 409 });
    }
    return NextResponse.json({ error: e?.message ?? "Error creando" }, { status: 400 });
  }
}

