"use client";

import React, { useState } from 'react';
import TablaProveedores from '@/components/pages/prov/tablaprov';
import ProveedorForm from '@/components/pages/prov/form_altaprov';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

export default function ProveedoresPage() {
    const [showModal, setShowModal] = useState(false);
    const [selectedProveedor, setSelectedProveedor] = useState(null);

    const handleEditProveedor = (proveedor: any) => {
        setSelectedProveedor(proveedor);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProveedor(null);
    };

    const handleAddProveedor = () => {
        setSelectedProveedor(null);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Gestión de Proveedores
                            </h1>
                            <p className="text-gray-600">
                                Administra y gestiona todos los proveedores de tu empresa
                            </p>
                        </div>
                        <Button
                            label="Nuevo Proveedor"
                            icon="pi pi-plus"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                            onClick={handleAddProveedor}
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-lg shadow-sm">
                    <TablaProveedores onEdit={handleEditProveedor} />
                </div>

                {/* Modal for Form */}
                <Dialog
                    header={selectedProveedor ? "Editar Proveedor" : "Nuevo Proveedor"}
                    visible={showModal}
                    onHide={handleCloseModal}
                    style={{ width: '50vw' }}
                    breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    modal
                    className="p-fluid"
                >
                    <ProveedorForm 
                        proveedor={selectedProveedor}
                        onClose={handleCloseModal}
                    />
                </Dialog>
            </div>
        </div>
    );
}
