"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/pages/dashboard_gerente/DashboardLayout";
import DashboardCards from "@/components/pages/dashboard_gerente/DashboardCards";
import DashboardCharts from "@/components/pages/dashboard_gerente/DashboardCharts";
import { ProgressSpinner } from "primereact/progressspinner";

interface DashboardData {
    rango: {
        desde: string;
        hasta: string;
    };
    operativos: {
        ocupacion: Record<string, number>;
        ocupacionMensual: { mes: string; porcentaje: number }[];
        housekeeping: Record<string, number>;
    };
    financieros: {
        ingresosMensuales: { mes: string; monto: number }[];
        egresosMensuales: { mes: string; monto: number }[];
        balance: { mes: string; ingresos: number; egresos: number; balance: number }[];
        facturasProveedor: Record<string, number>;
    };
    clientes: {
        huespedesFrecuentes: { nombre: string; reservas: number }[];
        promedioEstadia: number;
        estadoReservas: { estado: string; _count: { _all: number } }[];
    };
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [range, setRange] = useState<[Date, Date] | null>(null);

    // ==========================
    // 🔹 Función para obtener datos del backend
    // ==========================
    const fetchData = async (desde?: Date, hasta?: Date) => {
        try {
        setLoading(true);
        const params = new URLSearchParams();

        // ✅ Enviar fechas en formato ISO completo
        if (desde) params.set("desde", desde.toISOString());
        if (hasta) params.set("hasta", hasta.toISOString());

        const response = await fetch(`/api/dashboard?${params.toString()}`);
        if (!response.ok) throw new Error("Error al obtener los datos del dashboard");

        const json: DashboardData = await response.json();
        setData(json);
        console.log("📦 Datos recibidos del backend:", `/api/dashboard?${params.toString()}`);
        } catch (error) {
        console.error("❌ Error cargando el dashboard:", error);
        } finally {
        setLoading(false);
        }
    };

    // ==========================
    // 🔹 Carga inicial: últimos 6 meses
    // ==========================
    useEffect(() => {
        const hoy = new Date();

        // 🗓️ Primer día del mes de hace 6 meses
        const hace6Meses = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);

        // 🗓️ Último día del mes actual (día 0 del mes siguiente)
        const finDeMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

        setRange([hace6Meses, finDeMes]);
        fetchData(hace6Meses, finDeMes);
    }, []);

    // ==========================
    // 🔹 Aplicar rango manualmente
    // ==========================
    const aplicarFiltro = () => {
        if (range && range[0] && range[1]) {
        fetchData(range[0], range[1]);
        }
        console.log("📅 Rango aplicado:", range?.[0]?.toISOString(), range?.[1]?.toISOString());

    };

    // ==========================
    // 🔹 Loading o sin datos
    // ==========================
    if (loading) {
        return (
        <div className="flex justify-content-center align-items-center h-screen">
            <ProgressSpinner />
        </div>
        );
    }

    if (!data) {
        return (
        <div className="flex justify-content-center align-items-center h-screen">
            <p className="text-gray-600 text-lg">
            No hay datos disponibles para mostrar el dashboard.
            </p>
        </div>
        );
    }

    // ==========================
    // 🔹 Render principal
    // ==========================
    return (
        <DashboardLayout
        range={range}
        setRange={setRange}
        onApply={aplicarFiltro}
        >
        <DashboardCards data={data} />
        <DashboardCharts data={data} />
        </DashboardLayout>
    );
}
