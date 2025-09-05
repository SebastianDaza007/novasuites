// src/app/(dashboard)/layout.tsx
"use client"
import React from "react";
import Sidebar from "@/components/sidebar/sidebar";
import DashboardNavbar from "@/components/dashboardNavbar/dashboardNavbar";



export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarItems = [
    { icon: "pi-box", label: "Depósito", path: "/deposito" },
    { icon: "pi-shopping-cart", label: "Insumos", path: "/insumos" },
    { icon: "pi-users", label: "Proveedores", path: "/proveedores" },
    { icon: "pi-chart-line", label: "Reportes", path: "/reportes" },
  ];


  return (
    <div className="flex min-h-screen">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar title="Nova Suites" items={sidebarItems} />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Navbar arriba */}
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
        />

        {/* Contenido de la página */}
        <main className="flex-1 p-6 bg-gray-100">{children}</main>
      </div>
    </div>
  );
}
