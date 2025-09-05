"use client";

import UserMenu from "../userMenu/userMenu";
import NotificationsMenu, { Notificacion } from "../notificationsMenu/notificationsMenu";
import { usePathname } from "next/navigation";
import { useState } from "react";

type User = {
  nombre: string;
};

type NavbarProps = {
  idUsuario: string | number | null;
  usuario: User | null;
  urlLogin: string;
  urlRegistro: string;
  notificaciones: Notificacion[];
  onToggleSidebar?: () => void; // nueva prop
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
  onToggleSidebar,
}: NavbarProps) {
  const pathname = usePathname();
  const segmento = pathname.split("/")[1] || "";
  const titulo = capitalizarRuta(segmento);

  const [isDark, setIsDark] = useState(
    typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark")
  );

  function toggleTheme() {
    document.documentElement.classList.toggle("dark");
    setIsDark(document.documentElement.classList.contains("dark"));
  }

  return (
    <header
      className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 shadow-sm border-b"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        borderColor: "var(--foreground)",
      }}
    >
      {/* Botón hamburguesa solo en mobile */}
      <div className="flex items-center gap-2">
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          onClick={onToggleSidebar}
          aria-label="Abrir menú"
        >
          <i className="pi pi-bars text-xl" />
        </button>

        {/* Título dinámico */}
        <h1 className="text-base sm:text-lg md:text-2xl font-bold tracking-tight truncate max-w-[50vw]">
          {titulo}
        </h1>
      </div>

      {/* Menús a la derecha */}
      <div className="flex items-center gap-2 md:gap-6">
        {/* Toggle dark/light */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          aria-label="Cambiar tema"
        >
          {isDark ? "☀️" : "🌙"}
        </button>

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
