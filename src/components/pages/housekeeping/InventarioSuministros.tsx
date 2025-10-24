import React from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';

const InventarioSuministros = () => {
    const suministros = [
        {
            id: 1,
            nombre: 'Toallas de baño',
            categoria: 'Baño',
            stock_actual: 150,
            stock_minimo: 100,
            stock_maximo: 300,
            unidad: 'unidades',
            ubicacion: 'Almacén A',
            estado: 'Normal'
        },
        {
            id: 2,
            nombre: 'Sábanas queen size',
            categoria: 'Habitación',
            stock_actual: 80,
            stock_minimo: 120,
            stock_maximo: 250,
            unidad: 'unidades',
            ubicacion: 'Almacén A',
            estado: 'Bajo'
        },
        {
            id: 3,
            nombre: 'Shampoo 30ml',
            categoria: 'Amenities',
            stock_actual: 450,
            stock_minimo: 200,
            stock_maximo: 600,
            unidad: 'unidades',
            ubicacion: 'Almacén B',
            estado: 'Normal'
        },
        {
            id: 4,
            nombre: 'Jabón líquido',
            categoria: 'Limpieza',
            stock_actual: 25,
            stock_minimo: 50,
            stock_maximo: 150,
            unidad: 'litros',
            ubicacion: 'Almacén C',
            estado: 'Crítico'
        },
        {
            id: 5,
            nombre: 'Papel higiénico',
            categoria: 'Baño',
            stock_actual: 800,
            stock_minimo: 500,
            stock_maximo: 1000,
            unidad: 'rollos',
            ubicacion: 'Almacén B',
            estado: 'Normal'
        },
        {
            id: 6,
            nombre: 'Almohadas',
            categoria: 'Habitación',
            stock_actual: 95,
            stock_minimo: 100,
            stock_maximo: 200,
            unidad: 'unidades',
            ubicacion: 'Almacén A',
            estado: 'Bajo'
        },
        {
            id: 7,
            nombre: 'Desinfectante multiuso',
            categoria: 'Limpieza',
            stock_actual: 40,
            stock_minimo: 30,
            stock_maximo: 100,
            unidad: 'litros',
            ubicacion: 'Almacén C',
            estado: 'Normal'
        },
        {
            id: 8,
            nombre: 'Acondicionador 30ml',
            categoria: 'Amenities',
            stock_actual: 180,
            stock_minimo: 200,
            stock_maximo: 500,
            unidad: 'unidades',
            ubicacion: 'Almacén B',
            estado: 'Bajo'
        }
    ];

    const categorias = [
        { nombre: 'Habitacion', cantidad: 2, color: 'bg-purple-500' },
        { nombre: 'Amenities', cantidad: 1, color: 'bg-pink-500' },
        { nombre: 'Limpieza', cantidad: 2, color: 'bg-blue-500' },
        { nombre: 'Baño', cantidad: 2, color: 'bg-green-500' }
    ];

    const stockTemplate = (rowData: any) => {
        const porcentaje = (rowData.stock_actual / rowData.stock_maximo) * 100;

        return (
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{rowData.stock_actual} {rowData.unidad}</span>
                    <span className="text-xs text-gray-600">{Math.round(porcentaje)}%</span>
                </div>
                <ProgressBar value={porcentaje} showValue={false} className="h-2" />
            </div>
        );
    };

    const estadoTemplate = (rowData: any) => {
        const severityMap: any = {
            'Normal': 'success',
            'Bajo': 'warning',
            'Crítico': 'danger'
        };

        const iconMap: any = {
            'Normal': 'pi-check-circle',
            'Bajo': 'pi-exclamation-triangle',
            'Crítico': 'pi-times-circle'
        };

        return (
            <Tag
                value={rowData.estado}
                severity={severityMap[rowData.estado]}
                icon={`pi ${iconMap[rowData.estado]}`}
            />
        );
    };

    const accionesTemplate = () => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-plus" rounded outlined severity="success" size="small" tooltip="Agregar stock" />
                <Button icon="pi pi-minus" rounded outlined severity="warning" size="small" tooltip="Retirar stock" />
                <Button icon="pi pi-pencil" rounded outlined severity="info" size="small" tooltip="Editar" />
            </div>
        );
    };

    const suministrosCriticos = suministros.filter(s => s.estado === 'Crítico').length;
    const suministrosBajos = suministros.filter(s => s.estado === 'Bajo').length;

    return (
        <div className="space-y-4">
            {/* Resumen general */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-semibold">Total Suministros</p>
                            <p className="text-3xl font-bold text-blue-600">{suministros.length}</p>
                        </div>
                        <i className="pi pi-box text-4xl text-blue-500"></i>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-semibold">Stock Normal</p>
                            <p className="text-3xl font-bold text-green-600">
                                {suministros.filter(s => s.estado === 'Normal').length}
                            </p>
                        </div>
                        <i className="pi pi-check-circle text-4xl text-green-500"></i>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-700 font-semibold">Stock Bajo</p>
                            <p className="text-3xl font-bold text-yellow-600">{suministrosBajos}</p>
                        </div>
                        <i className="pi pi-exclamation-triangle text-4xl text-yellow-500"></i>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-700 font-semibold">Stock Crítico</p>
                            <p className="text-3xl font-bold text-red-600">{suministrosCriticos}</p>
                        </div>
                        <i className="pi pi-times-circle text-4xl text-red-500"></i>
                    </div>
                </Card>
            </div>

            {/* Categorías */}
            <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    <i className="pi pi-th-large mr-2"></i>
                    Categorías
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categorias.map((cat, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className={`w-12 h-12 ${cat.color} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                                {cat.cantidad}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{cat.nombre}</p>
                                <p className="text-xs text-gray-600">{cat.cantidad} producto{cat.cantidad !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Tabla de inventario */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                        <i className="pi pi-list mr-2"></i>
                        Inventario Detallado
                    </h3>
                    <Button
                        label="Generar Orden de Compra"
                        icon="pi pi-shopping-cart"
                        className="p-button-sm"
                        severity="success"
                    />
                </div>
                <DataTable
                    value={suministros}
                    stripedRows
                    className="p-datatable-sm"
                    paginator
                    rows={10}
                    emptyMessage="No hay suministros registrados"
                >
                    <Column field="nombre" header="Producto" sortable />
                    <Column field="categoria" header="Categoría" sortable />
                    <Column header="Stock Actual" body={stockTemplate} sortable sortField="stock_actual" />
                    <Column
                        field="stock_minimo"
                        header="Stock Mínimo"
                        sortable
                        body={(rowData) => `${rowData.stock_minimo} ${rowData.unidad}`}
                    />
                    <Column field="ubicacion" header="Ubicación" sortable />
                    <Column header="Estado" body={estadoTemplate} sortable sortField="estado" />
                    <Column header="Acciones" body={accionesTemplate} style={{ width: '180px' }} />
                </DataTable>
            </Card>

            {/* Alertas */}
            {(suministrosCriticos > 0 || suministrosBajos > 0) && (
                <Card className="bg-orange-50 border-l-4 border-orange-500">
                    <div className="flex items-start gap-3">
                        <i className="pi pi-exclamation-triangle text-orange-600 text-xl mt-1"></i>
                        <div>
                            <p className="font-semibold text-orange-900">Atención: Productos con stock bajo</p>
                            <p className="text-sm text-orange-700 mt-1">
                                Hay {suministrosCriticos} producto{suministrosCriticos !== 1 ? 's' : ''} en estado crítico y{' '}
                                {suministrosBajos} con stock bajo. Se recomienda realizar un pedido de reposición.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Información de demo */}
            <Card className="bg-blue-50 border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                    <i className="pi pi-info-circle text-blue-600 text-xl mt-1"></i>
                    <div>
                        <p className="font-semibold text-blue-900">Módulo de Demostración</p>
                        <p className="text-sm text-blue-700">
                            Esta sección muestra una vista previa del inventario de suministros de housekeeping.
                            Los datos mostrados son ejemplos y no reflejan información real del sistema.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default InventarioSuministros;
