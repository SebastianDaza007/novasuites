"use client";

import UserMenu from "../userMenu/userMenu";
import NotificationsMenu, { Notificacion } from "../notificationsMenu/notificationsMenu";
import { usePathname } from "next/navigation";

type User = {
  nombre: string;
};

type NavbarProps = {
  idUsuario: string | number | null;
  usuario: User | null;
  urlLogin: string;
  urlRegistro: string;
  notificaciones: Notificacion[];
};

function capitalizarRuta(ruta: string): string {
  if (!ruta || ruta === "") return "Inicio";
  return ruta.charAt(0).toUpperCase() + ruta.slice(1);
}

export default function DashboardNavbar({
  idUsuario,
  usuario,
  urlLogin,
  urlRegistro,
  notificaciones,
}: NavbarProps) {
  const pathname = usePathname();
  const segmento = pathname.split("/")[1] || "";
  const titulo = capitalizarRuta(segmento);

  return (
    <header className="h-16 bg-purple-600 text-white flex items-center justify-between px-6 shadow">
      {/* Título dinámico */}
      <h1 className="text-xl font-bold">{titulo}</h1>

      {/* Menús a la derecha */}
      <div className="flex items-center gap-4">
        <NotificationsMenu notificaciones={notificaciones} />
        <UserMenu
          usuario={usuario}
          idUsuario={idUsuario}
          urlLogin={urlLogin}
          urlRegistro={urlRegistro}
        />
      </div>
    </header>
  );
}
