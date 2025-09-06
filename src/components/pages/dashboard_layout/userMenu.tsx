"use client";

import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { useRef } from "react";
import { useRouter } from "next/navigation";

type User = {
  nombre: string;
};

type UserMenuProps = {
  usuario: User | null;
  idUsuario?: string | number | null;
  urlLogin: string;
  urlRegistro: string;
};

export default function UserMenu({ idUsuario, usuario, urlLogin, urlRegistro }: UserMenuProps) {
  const menu = useRef<Menu>(null);
  const router = useRouter();

  // Botón que muestra la inicial o el ícono
  const avatar = (
    <button
      className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold"
      onClick={(e) => menu.current?.toggle(e)}
    >
      {usuario ? usuario.nombre.charAt(0).toUpperCase() : <i className="pi pi-user text-xl" />}
    </button>
  );

  // Opciones del menú
  const items: MenuItem[] = usuario
    ? [
        {
          label: usuario.nombre,
          className: "font-semibold pointer-events-none opacity-100",
        },
        {
          label: "Mi perfil",
          icon: "pi pi-user-edit",
          command: () => router.push(`/user/${idUsuario}`),
        },
        {
          label: "Cerrar sesión",
          icon: "pi pi-sign-out",
          command: () => {
            // Podés manejar el logout real desde fuera, o disparar un evento aquí
            console.log("Cerrar sesión");
          },
        },
      ]
    : [
        {
          label: "Iniciar sesión",
          icon: "pi pi-sign-in",
          command: () => router.push(urlLogin),
        },
        {
          label: "Registrarse",
          icon: "pi pi-user-plus",
          command: () => router.push(urlRegistro),
        },
      ];

  return (
    <div className="relative">
      <Menu model={items} popup ref={menu} className="w-48"/>
      {avatar}
    </div>
  );
}
