"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import Image from 'next/image';

export default function DashboardHome() {
    const router = useRouter();

    const quickActions = [
        {
            title: 'Reservas',
            description: 'Gestiona las reservas del hotel',
            icon: 'pi-calendar-plus',
            gradient: 'from-blue-500 to-blue-700',
            actions: [
                { label: 'Nueva Reserva', path: '/reservas', icon: 'pi-plus' },
                { label: 'Ver Reservas', path: '/reservas/ver_reservas', icon: 'pi-list' },
                { label: 'Check-in', path: '/reservas/checkin', icon: 'pi-sign-in' },
                { label: 'Check-out', path: '/reservas/checkout', icon: 'pi-sign-out' }
            ]
        },
        {
            title: 'Housekeeping',
            description: 'Control de habitaciones y limpieza',
            icon: 'pi-home',
            gradient: 'from-purple-500 to-purple-700',
            actions: [
                { label: 'Gestión de Habitaciones', path: '/housekeeping', icon: 'pi-th-large' }
            ]
        },
        {
            title: 'Insumos',
            description: 'Administración de inventario',
            icon: 'pi-shopping-cart',
            gradient: 'from-green-500 to-green-700',
            actions: [
                { label: 'Ver Insumos', path: '/insumos', icon: 'pi-box' },
                { label: 'Registrar Movimiento', path: '/insumos/movimientos/registrar', icon: 'pi-plus-circle' },
                { label: 'Ver Movimientos', path: '/insumos/movimientos/movimientos-insumos', icon: 'pi-history' }
            ]
        },
        {
            title: 'Proveedores',
            description: 'Gestión de proveedores y facturas',
            icon: 'pi-users',
            gradient: 'from-orange-500 to-orange-700',
            actions: [
                { label: 'Ver Proveedores', path: '/proveedores', icon: 'pi-users' },
                { label: 'Facturas', path: '/facturas', icon: 'pi-file' }
            ]
        },
        {
            title: 'Órdenes de Compra',
            description: 'Administra tus órdenes de compra',
            icon: 'pi-copy',
            gradient: 'from-cyan-500 to-cyan-700',
            actions: [
                { label: 'Ver Órdenes', path: '/orden_compra', icon: 'pi-list' }
            ]
        },
        {
            title: 'Reportes',
            description: 'Análisis y estadísticas',
            icon: 'pi-chart-line',
            gradient: 'from-pink-500 to-pink-700',
            actions: [
                { label: 'Financieros', path: '/reportes/financieros', icon: 'pi-dollar' },
                { label: 'Operativos', path: '/reportes/operativos', icon: 'pi-cog' },
                { label: 'Reservas', path: '/reportes/reservas', icon: 'pi-calendar' }
            ]
        }
    ];

    const stats = [
        { label: 'Reservas Hoy', value: '12', icon: 'pi-calendar', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Check-ins Pendientes', value: '5', icon: 'pi-sign-in', color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Habitaciones Ocupadas', value: '28/40', icon: 'pi-home', color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'En Limpieza', value: '8', icon: 'pi-sync', color: 'text-orange-600', bg: 'bg-orange-50' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 p-8">
            {/* Hero Section */}
            <div className="mb-8">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1">
                    <div className="bg-slate-900 rounded-2xl p-8 md:p-12">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm p-2">
                                        <Image
                                            src="/Nova suites-03.png"
                                            alt="NovasuiteS"
                                            width={60}
                                            height={60}
                                            className="object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-bold text-white">
                                            Bienvenido a Novasuites
                                        </h1>
                                        <p className="text-blue-200 text-sm mt-1">Sistema de Gestión Hotelera</p>
                                    </div>
                                </div>
                                <p className="text-slate-300 text-lg">
                                    Gestiona todas las operaciones de tu hotel desde un solo lugar
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => router.push('/reservas')}
                                    className="px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    <i className="pi pi-plus"></i>
                                    Nueva Reserva
                                </button>
                                <button
                                    onClick={() => router.push('/housekeeping')}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    <i className="pi pi-home"></i>
                                    Housekeeping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-all duration-200 cursor-default">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                            <div className={`${stat.bg} p-4 rounded-xl`}>
                                <i className={`pi ${stat.icon} text-2xl ${stat.color}`}></i>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Acciones Rápidas */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <i className="pi pi-bolt text-yellow-500"></i>
                    Accesos Rápidos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quickActions.map((module, index) => (
                        <Card
                            key={index}
                            className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                        >
                            <div className="relative">
                                {/* Encabezado con gradiente */}
                                <div className={`bg-gradient-to-r ${module.gradient} p-6 mb-4 -m-6 mb-6`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                            <i className={`pi ${module.icon} text-2xl text-white`}></i>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{module.title}</h3>
                                            <p className="text-white/80 text-sm">{module.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="space-y-2">
                                    {module.actions.map((action, actionIndex) => (
                                        <button
                                            key={actionIndex}
                                            onClick={() => router.push(action.path)}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all duration-200 group"
                                        >
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                                                <i className={`pi ${action.icon} text-slate-600 group-hover:text-slate-800`}></i>
                                            </div>
                                            <span className="font-medium text-slate-700 group-hover:text-slate-900 flex-1 text-left">
                                                {action.label}
                                            </span>
                                            <i className="pi pi-arrow-right text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200"></i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Información adicional */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <i className="pi pi-info-circle text-blue-600"></i>
                        Información del Sistema
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                            <span className="text-slate-600">Versión</span>
                            <span className="font-semibold text-slate-800">1.0.0</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                            <span className="text-slate-600">Última actualización</span>
                            <span className="font-semibold text-slate-800">24/10/2025</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                            <span className="text-slate-600">Estado</span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="font-semibold text-green-600">Operativo</span>
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <i className="pi pi-question-circle text-purple-600"></i>
                        Ayuda Rápida
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                            <p className="text-sm text-slate-600 mb-2">
                                <strong className="text-slate-800">¿Necesitas ayuda?</strong>
                            </p>
                            <p className="text-xs text-slate-500">
                                Consulta la documentación del sistema o contacta al soporte técnico.
                            </p>
                        </div>
                        <button className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 font-medium flex items-center justify-center gap-2">
                            <i className="pi pi-book"></i>
                            Ver Documentación
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
