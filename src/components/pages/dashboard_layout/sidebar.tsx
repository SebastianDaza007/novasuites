"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { classNames } from "primereact/utils";
import Image from "next/image";

type SidebarItem = {
  icon: string;
  label: string;
  path: string;
  options: { name: string; path: string }[] | null;
};

type SidebarProps = {
  title: string;
  items: SidebarItem[];
};

export default function Sidebar({ title, items }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isActiveRoute = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <aside
      className={classNames(
        "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white h-screen transition-all duration-300 shadow-2xl border-r border-slate-700/50",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Encabezado con logo */}
      <div className="relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>

        <div className={classNames(
          "relative flex items-center justify-between p-6 border-b border-slate-700/50",
          collapsed ? "flex-col gap-4" : ""
        )}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm p-1">
                <Image
                  src="/Nova suites-03.png"
                  alt="NovasuiteS"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="text-xs text-slate-400">Management System</p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm p-1">
              <Image
                src="/Nova suites-01.png"
                alt="NovasuiteS"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
          )}

          <button
            className={classNames(
              "p-2 rounded-lg hover:bg-white/10 transition-all duration-200 backdrop-blur-sm",
              collapsed ? "mt-0" : ""
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            <i className={classNames(
              "pi text-slate-300",
              collapsed ? "pi-angle-right" : "pi-angle-left"
            )}></i>
          </button>
        </div>
      </div>

      {/* Lista de opciones */}
      <nav className="mt-2 px-3 space-y-1 overflow-y-auto h-[calc(100vh-140px)] custom-scrollbar">
        {items.map((item, index) => {
          const hasOptions = item.options !== null && item.options.length > 0;
          const isOpen = openDropdown === item.label;
          const isActive = !hasOptions && isActiveRoute(item.path);

          return (
            <div key={index}>
              <div
                className={classNames(
                  "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20"
                    : "hover:bg-white/5 hover:backdrop-blur-sm"
                )}
                onClick={() => {
                  if (hasOptions) {
                    setOpenDropdown(isOpen ? null : item.label);
                  } else {
                    router.push(item.path);
                  }
                }}
              >
                {/* Efecto de brillo en hover */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full transform"></div>
                )}

                <div className={classNames(
                  "relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-white/20 shadow-inner"
                    : "group-hover:bg-white/5"
                )}>
                  <i className={classNames(
                    "pi",
                    item.icon,
                    isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                  )}></i>
                </div>

                {!collapsed && (
                  <span className={classNames(
                    "relative z-10 font-medium transition-all duration-200",
                    isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                  )}>
                    {item.label}
                  </span>
                )}

                {!collapsed && hasOptions && (
                  <i className={classNames(
                    "pi ml-auto relative z-10 transition-all duration-200 text-sm",
                    isOpen ? "pi-chevron-up" : "pi-chevron-down",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                  )}></i>
                )}
              </div>

              {/* Submenú si tiene opciones */}
              {!collapsed && hasOptions && isOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4 pb-2">
                  {item.options!.map((option, optionIndex) => {
                    const isSubActive = isActiveRoute(option.path);

                    return (
                      <div
                        key={optionIndex}
                        className={classNames(
                          "flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 group",
                          isSubActive
                            ? "bg-blue-600/20 text-blue-300 border-l-2 border-blue-400"
                            : "hover:bg-white/5 text-slate-400 hover:text-white border-l-2 border-transparent"
                        )}
                        onClick={() => router.push(option.path)}
                      >
                        <i className={classNames(
                          "pi pi-angle-right text-xs transition-transform duration-200",
                          isSubActive ? "text-blue-400" : "group-hover:translate-x-1"
                        )}></i>
                        <span className="text-sm font-medium">{option.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Estilos para el scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </aside>
  );
}
