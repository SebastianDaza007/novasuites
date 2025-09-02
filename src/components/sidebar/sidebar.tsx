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
          <div
            key={index}
            className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer transition-all"
            onClick={() => router.push(item.path)}
          >
            <i className={classNames("pi", item.icon)}></i>
            {!collapsed && <span>{item.label}</span>}
          </div>
        ))}
      </nav>
    </aside>
  );
}
