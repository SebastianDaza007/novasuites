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
        "h-screen shadow-sm transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
        "bg-[var(--background)] text-[var(--foreground)] border-r"
      )}
      style={{
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Encabezado */}
      <div
        className="flex items-center justify-between px-4 py-4 md:py-6 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        {!collapsed && (
          <span className="font-bold text-lg md:text-2xl tracking-tight">
            {title}
          </span>
        )}
        <button
          className="ml-auto p-1 rounded-md transition-colors hover:bg-[var(--border)]/40"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i
            className={classNames(
              "pi",
              collapsed ? "pi-angle-right" : "pi-angle-left"
            )}
            style={{ color: "var(--foreground)" }}
          ></i>
        </button>
      </div>

      {/* Lista de opciones */}
      <nav className="mt-6 flex-1 flex flex-col gap-1">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 px-6 py-3 cursor-pointer text-base md:text-lg font-medium rounded-lg transition-colors hover:bg-[var(--border)]/20"
            style={{ color: "var(--foreground)" }}
            onClick={() => router.push(item.path)}
          >
            <i
              className={classNames("pi text-xl md:text-2xl", item.icon)}
              style={{ color: "var(--foreground)" }}
            ></i>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </div>
        ))}
      </nav>
    </aside>
  );
}
