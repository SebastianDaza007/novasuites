"use client";

import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { classNames } from "primereact/utils";

export type Notificacion = {
  id: string | number;
  titulo: string;
  contenido: string;
  visto: boolean;
};

type NotificationsMenuProps = {
  notificaciones: Notificacion[];
};

export default function NotificationsMenu({ notificaciones }: NotificationsMenuProps) {
  const menu = useRef<Menu>(null);
  const router = useRouter();

  const noVistas = notificaciones.filter((n) => !n.visto);
  const vistas = notificaciones.filter((n) => n.visto);
  const hayNoVistas = noVistas.length > 0;

  const renderItem = (n: Notificacion) => ({
    label: n.titulo,
    command: () => router.push(`/notification/${n.id}`),
    template: () => (
      <div className={classNames("p-2 rounded-sm cursor-pointer", !n.visto ? "bg-purple-100" : "")}>
        <div className="font-semibold">{n.titulo}</div>
        <div className="text-sm text-gray-600">{n.contenido}</div>
      </div>
    ),
  });

  const items: MenuItem[] = [...noVistas.map(renderItem), ...vistas.map(renderItem)];

  return (
    <div className="relative">
      <Menu model={items} popup ref={menu} className="w-80" />
      <button
        onClick={(e) => menu.current?.toggle(e)}
        className="relative w-10 h-10 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center"
      >
        <i className="pi pi-bell text-xl" />
        {hayNoVistas && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
}
