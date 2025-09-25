import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

type P = { params: { id: string } };

export async function GET(_req: Request, { params }: P) {
  const id = Number(params.id);
  const item = await prisma.proveedor.findUnique({ where: { id_proveedor: id } });
  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: P) {
  try {
    const id = Number(params.id);
    const b = await req.json();
    
    // Helper function to clean CUIT format
    const cleanCuit = (cuit: string) => {
      if (!cuit) return undefined;
      return String(cuit).replace(/[\s.-]/g, "");
    };
    
    // Helper function to parse phone numbers
    const parsePhone = (phone: any) => {
      if (!phone) return null;
      const digits = String(phone).replace(/\D/g, "");
      if (!digits) return null;
      const n = Number(digits);
      if (!Number.isFinite(n)) return null;
      if (n > 2147483647) return null;
      return n;
    };
    
    // Si viene CUIT en el body y se cambió, validar que no esté en otro registro
    const nextCuit = cleanCuit(b.cuit_proveedor || b.cuitCuil);
    if (nextCuit) {
      const clash = await prisma.proveedor.findFirst({
        where: { cuit_proveedor: nextCuit, NOT: { id_proveedor: id } },
        select: { id_proveedor: true },
      });
      if (clash) {
        return NextResponse.json({ error: "CUIT ya existe" }, { status: 409 });
      }
    }

    const updated = await prisma.proveedor.update({
      where: { id_proveedor: id },
      data: {
        cuit_proveedor: cleanCuit(b.cuit_proveedor || b.cuitCuil),
        nombre_proveedor: b.nombre_proveedor || b.nombre || b.nombre_prov,
        correo_proveedor: b.correo_proveedor || b.correo || b.email,
        direccion_proveedor: b.direccion_proveedor || b.domicilio,
        telefono_proveedor: parsePhone(b.telefono_proveedor || b.telefono),
        contacto_responsable: parsePhone(b.contacto_responsable || b.telefonoResp),
        activo: b.activo !== undefined ? b.activo : true,
      },
    });
    
    // Format CUIT for response
    const fmtCuit = (raw: string) => {
      const s = raw.padStart(11, "0");
      return `${s.slice(0,2)}-${s.slice(2,10)}-${s.slice(10)}`;
    };
    
    const response = {
      ...updated,
      cuit_proveedor: updated.cuit_proveedor ? fmtCuit(updated.cuit_proveedor) : updated.cuit_proveedor,
    };
    
    return NextResponse.json(response);
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    if (e?.code === "P2002") return NextResponse.json({ error: "CUIT/CUIL o correo ya existen" }, { status: 409 });
    return NextResponse.json({ error: e?.message ?? "Error actualizando" }, { status: 400 });
  }
}

export async function PATCH(req: Request, { params }: P) {
  const id = Number(params.id);
  const { activo } = await req.json().catch(() => ({}));
  if (typeof activo !== "boolean") {
    return NextResponse.json({ error: "Falta 'activo': true|false" }, { status: 400 });
  }
  const updated = await prisma.proveedor.update({ where: { id_proveedor: id }, data: { activo } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: P) {
  try {
    const id = Number(params.id);
    await prisma.proveedor.delete({ where: { id_proveedor: id } });
    return NextResponse.json({ message: "Proveedor eliminado correctamente" });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: e?.message ?? "Error eliminando proveedor" }, { status: 400 });
  }
}
