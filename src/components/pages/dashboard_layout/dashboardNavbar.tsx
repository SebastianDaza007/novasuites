"use client";

import UserMenu from "./userMenu";
import NotificationsMenu, { Notificacion } from "./notificationsMenu";
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
  if (!ruta || ruta === "") return "Dashboard";

  // Mapeo de rutas a nombres más descriptivos
  const nombresPaginas: Record<string, string> = {
    'home': 'Home',
    'insumos': 'Gestión de Insumos',
    'proveedores': 'Proveedores',
    'orden_compra': 'Órdenes de Compra',
    'reservas': 'Reservas',
    'housekeeping': 'Housekeeping',
    'reportes': 'Reportes',
    'facturas': 'Facturas'
  };

  return nombresPaginas[ruta] || ruta.charAt(0).toUpperCase() + ruta.slice(1);
}

function obtenerBreadcrumb(pathname: string): string[] {
  const segmentos = pathname.split("/").filter(Boolean);
  return segmentos.map(seg => capitalizarRuta(seg));
}

export default function DashboardNavbar({
  idUsuario,
  usuario,
  urlLogin,
  urlRegistro,
  notificaciones,
}: NavbarProps) {
  const pathname = usePathname();
  const breadcrumb = obtenerBreadcrumb(pathname);
  const tituloActual = breadcrumb[breadcrumb.length - 1] || "Dashboard";

  // Obtener la hora actual
  const now = new Date();
  const hora = now.getHours();
  let saludo = "Buenos días";
  if (hora >= 12 && hora < 19) saludo = "Buenas tardes";
  else if (hora >= 19) saludo = "Buenas noches";

  return (
    <header className="relative h-16 bg-white border-b border-slate-200 shadow-sm">
      {/* Gradiente decorativo sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30 pointer-events-none"></div>

      <div className="relative h-full flex items-center justify-between px-6">
        {/* Sección izquierda - Breadcrumb y título */}
        <div className="flex flex-col">
          {/* Breadcrumb */}
          {breadcrumb.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <i className="pi pi-home text-[10px]"></i>
              {breadcrumb.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <i className="pi pi-angle-right text-[10px]"></i>}
                  <span className={index === breadcrumb.length - 1 ? "text-blue-600 font-medium" : ""}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Título principal */}
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {tituloActual}
          </h1>
        </div>

        {/* Sección central - Saludo y fecha */}
        <div className="hidden lg:flex flex-col items-center">
          <p className="text-sm font-medium text-slate-600">
            {saludo}, {usuario?.nombre || "Usuario"}
          </p>
          <p className="text-xs text-slate-400">
            {now.toLocaleDateString('es-AR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Sección derecha - Menús */}
        <div className="flex items-center gap-3">
          {/* Notificaciones */}
          <div className="relative">
            <NotificationsMenu notificaciones={notificaciones} />
          </div>

          {/* Separador */}
          <div className="h-8 w-px bg-slate-200"></div>

          {/* Usuario */}
          <UserMenu
            usuario={usuario}
            idUsuario={idUsuario}
            urlLogin={urlLogin}
            urlRegistro={urlRegistro}
          />
        </div>
      </div>
    </header>
  );
}
