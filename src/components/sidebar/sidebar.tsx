"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { classNames } from "primereact/utils";

type SidebarItem = {
  icon: string;
  label: string;
  path: string;
  options: { name: string; code: string; path: string }[] | null;
};

type SidebarProps = {
  title: string;
  items: SidebarItem[];
};

export default function Sidebar({ title, items }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();

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
        <button className="ml-auto" onClick={() => setCollapsed(!collapsed)}>
          <i className={classNames("pi", collapsed ? "pi-angle-right" : "pi-angle-left")}></i>
        </button>
      </div>

      {/* Lista de opciones */}
      <nav className="mt-4">
        {items.map((item, index) => {
          const hasOptions = item.options !== null && item.options.length > 0;
          const isOpen = openDropdown === item.label;

          return (
            <div key={index}>
              <div
                className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer transition-all"
                onClick={() => {
                  if (hasOptions) {
                    setOpenDropdown(isOpen ? null : item.label);
                  } else {
                    router.push(item.path);
                  }
                }}
              >
                <i className={classNames("pi", item.icon)}></i>
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && hasOptions && (
                  <i className={classNames("pi ml-auto", isOpen ? "pi-chevron-up" : "pi-chevron-down")}></i>
                )}
              </div>

              {/* Submenú si tiene opciones */}
              {!collapsed && hasOptions && isOpen && (
                <div className="ml-6">
                  {item.options!.map((option, optionIndex) => (
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
          );
        })}
      </nav>
    </aside>
  );
}
