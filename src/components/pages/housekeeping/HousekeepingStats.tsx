import React from 'react';
import { Card } from 'primereact/card';

interface Estadisticas {
    total: number;
    disponibles: number;
    ocupadas: number;
    limpieza: number;
    mantenimiento: number;
}

interface HousekeepingStatsProps {
    estadisticas: Estadisticas;
}

const HousekeepingStats: React.FC<HousekeepingStatsProps> = ({ estadisticas }) => {
    const stats = [
        {
            label: 'Total Habitaciones',
            value: estadisticas.total,
            icon: 'pi pi-home',
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgLight: 'bg-blue-50'
        },
        {
            label: 'Disponibles',
            value: estadisticas.disponibles,
            icon: 'pi pi-check-circle',
            color: 'bg-green-500',
            textColor: 'text-green-600',
            bgLight: 'bg-green-50'
        },
        {
            label: 'Ocupadas',
            value: estadisticas.ocupadas,
            icon: 'pi pi-users',
            color: 'bg-purple-500',
            textColor: 'text-purple-600',
            bgLight: 'bg-purple-50'
        },
        {
            label: 'En Limpieza',
            value: estadisticas.limpieza,
            icon: 'pi pi-sync',
            color: 'bg-yellow-500',
            textColor: 'text-yellow-600',
            bgLight: 'bg-yellow-50'
        },
        {
            label: 'Mantenimiento',
            value: estadisticas.mantenimiento,
            icon: 'pi pi-wrench',
            color: 'bg-red-500',
            textColor: 'text-red-600',
            bgLight: 'bg-red-50'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {stats.map((stat, index) => (
                <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                            <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                        </div>
                        <div className={`${stat.bgLight} p-4 rounded-full`}>
                            <i className={`${stat.icon} text-2xl ${stat.textColor}`}></i>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default HousekeepingStats;
