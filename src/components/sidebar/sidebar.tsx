"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { classNames } from "primereact/utils";

type SidebarItem = {
  icon: string;
  label: string;
  path: string;
};

type SidebarProps = {
  title: string;
  items: SidebarItem[];
};

export default function Sidebar({ title, items }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showProveedorDropdown, setShowProveedorDropdown] = useState(false);
  const router = useRouter();

  const proveedorOptions = [
    { name: 'Registrar/Editar Proveedor', code: 'EDIT', path: '/proveedores' },
    { name: 'Cargar Facturas', code: 'INVOICE', path: '/facturas' }
  ];

  return (
    <aside
      className={classNames(
        "bg-gray-900 text-white h-screen transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Encabezado */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && <span className="font-bold text-lg">{title}</span>}
        <button
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className={classNames("pi", collapsed ? "pi-angle-right" : "pi-angle-left")}></i>
        </button>
      </div>

      {/* Lista de opciones */}
      <nav className="mt-4">
        {items.map((item, index) => (
          <div key={index}>
            <div
              className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer transition-all"
              onClick={() => {
                if (item.label === "Proveedores") {
                  setShowProveedorDropdown(!showProveedorDropdown);
                } else {
                  router.push(item.path);
                }
              }}
            >
              <i className={classNames("pi", item.icon)}></i>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.label === "Proveedores" && (
                <i className={classNames("pi ml-auto", showProveedorDropdown ? "pi-chevron-up" : "pi-chevron-down")}></i>
              )}
            </div>
            
            {/* Submenu para Proveedores */}
            {!collapsed && item.label === "Proveedores" && showProveedorDropdown && (
              <div className="ml-6">
                {proveedorOptions.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="flex items-center gap-3 p-2 pl-4 hover:bg-gray-700 cursor-pointer transition-all text-sm text-gray-300"
                    onClick={() => router.push(option.path)}
                  >
                    <i className="pi pi-circle text-xs"></i>
                    <span>{option.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
