"use client";

import React, { useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import DashboardNavbar from "@/components/dashboardNavbar/dashboardNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Estado para controlar sidebar en mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems = [
    { icon: "pi-box", label: "Depósito", path: "/deposito" },
    { icon: "pi-shopping-cart", label: "Insumos", path: "/insumos" },
    { icon: "pi-users", label: "Proveedores", path: "/proveedores" },
    { icon: "pi-chart-line", label: "Reportes", path: "/reportes" },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar en desktop */}
      <div className="hidden md:flex">
        <Sidebar title="Nova Suites" items={sidebarItems} />
      </div>

      {/* Sidebar overlay en mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Fondo semitransparente */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar title="Nova Suites" items={sidebarItems} />
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Navbar arriba con toggle de sidebar */}
        <DashboardNavbar
          idUsuario={5}
          usuario={{ nombre: "Andrea" }}
          urlLogin="/login"
          urlRegistro="/registro"
          notificaciones={[
            {
              id: 1,
              titulo: "Alerta de stock",
              contenido: "Faltan insumos",
              visto: true,
            },
            {
              id: 2,
              titulo: "Nuevo proveedor",
              contenido: "Proveedor ABC cargado",
              visto: true,
            },
          ]}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Contenido de la página */}
        <main className="flex-1 p-4 md:p-6 bg-gray-100 dark:bg-gray-900 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}
