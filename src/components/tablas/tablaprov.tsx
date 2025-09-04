import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

interface Proveedor {
    id: number;
    nombre: string;
    cuit: string;
    email: string;
    telefono: string;
    direccion: string;
}

const TablaProveedores = () => {
    const [globalFilter, setGlobalFilter] = useState('');
    
    const header = (
        <div className="flex justify-content-end">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText 
                    value={globalFilter} 
                    onChange={(e) => setGlobalFilter(e.target.value)} 
                    placeholder="Buscar..." 
                    className="p-inputtext-sm"
                />
            </span>
        </div>
    );
    const proveedores: Proveedor[] = [
        {
            id: 1,
            nombre: 'rodrigo',
            cuit: '30-12345678-9',
            email: 'hola@proveedor1.com',
            telefono: '11-1234-5678',
            direccion: 'Av. holas'
        },
        {
            id: 2,
            nombre: 'pepe',
            cuit: '30-87654321-0',
            email: 'info@lola.com',
            telefono: '11-8765-4321',
            direccion: 'Calle Falsa '
        },
        
    ];

    const handleEditar = (proveedor: Proveedor) => {
        console.log('Editar proveedor:', proveedor);
    };

    const handleEliminar = (proveedor: Proveedor) => {
        if (window.confirm(`¿Está seguro que desea eliminar a ${proveedor.nombre}?`)) {
            console.log('Eliminar proveedor:', proveedor.id);
            
        }
    };

    const accionesBodyTemplate = (rowData: Proveedor) => {
        return (
            <div className="flex gap-2">
                <Button 
                    icon="pi pi-pencil" 
                    className="p-button-warning p-button-sm"
                    onClick={() => handleEditar(rowData)}
                    tooltip="Editar"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button 
                    icon="pi pi-trash" 
                    className="p-button-danger p-button-sm"
                    onClick={() => handleEliminar(rowData)}
                    tooltip="Eliminar"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <DataTable 
                value={proveedores}
                stripedRows
                showGridlines
                size="small"
                responsiveLayout="scroll"
                className="p-datatable-sm"
                emptyMessage="No se encontraron proveedores"
                globalFilter={globalFilter}
                header={header}
                paginator 
                rows={10}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} proveedores"
            >
                <Column 
                    field="nombre" 
                    header="Nombre del Proveedor" 
                    sortable 
                    style={{ minWidth: '200px' }} 
                />
                <Column 
                    field="cuit" 
                    header="CUIT" 
                    sortable 
                    style={{ minWidth: '150px' }} 
                />
                <Column 
                    field="email" 
                    header="Email" 
                    sortable 
                    style={{ minWidth: '200px' }} 
                />
                <Column 
                    field="telefono" 
                    header="Teléfono" 
                    sortable 
                    style={{ minWidth: '150px' }} 
                />
                <Column 
                    field="direccion" 
                    header="Dirección" 
                    sortable 
                    style={{ minWidth: '250px' }} 
                />
                <Column 
                    body={accionesBodyTemplate} 
                    header="Acciones" 
                    style={{ width: '120px', textAlign: 'center' }}
                    bodyStyle={{ textAlign: 'center' }}
                />
            </DataTable>
        </div>
    );
};

export default TablaProveedores;