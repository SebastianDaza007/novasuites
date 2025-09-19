"use client";

import React, { useRef, useState } from 'react';
import TablaProveedores from '@/components/pages/prov/tablaprov';
import ProveedorForm from '@/components/pages/prov/form_altaprov';
import EditProveedorForm from '@/components/pages/prov/edit/form_editprov';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import BotonCierre from '@/components/common/boton_cierre';
import { Toast } from 'primereact/toast';

export default function ProveedoresPage() {
    const [showModal, setShowModal] = useState(false);
    const [selectedProveedor, setSelectedProveedor] = useState<any>(null);
    const [refreshTick, setRefreshTick] = useState(0);
    const toast = useRef<Toast>(null);

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
                <Toast ref={toast} position="center" />
                {/* Header Section */}
                <div className="mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Proveedores</h1>
                    <div className="mt-3">
                        <Button 
                            label="Registrar nuevo proveedor" 
                            icon="pi pi-plus" 
                            className="text-white font-semibold rounded-full px-6 py-3 flex items-center gap-2"
                            style={{ backgroundColor: '#22C55E', borderColor: '#22C55E' }}
                            onClick={handleAddProveedor}
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-lg shadow-sm">
                    <TablaProveedores key={refreshTick} onEdit={handleEditProveedor} />
                </div>

                {/* Modal for Form */}
                <Dialog
                    visible={showModal}
                    onHide={handleCloseModal}
                    style={{ width: '50vw' }}
                    breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    modal
                    className="p-fluid"
                    closable={false}
                    showHeader={false}
                >
                    {selectedProveedor ? (
                        <EditProveedorForm
                            proveedorData={selectedProveedor}
                            onClose={handleCloseModal}
                            onSaved={() => {
                                setRefreshTick((t) => t + 1);
                                toast.current?.show({
                                    severity: 'success',
                                    summary: 'Éxito',
                                    detail: 'Proveedor actualizado con éxito',
                                    life: 3000,
                                });
                            }}
                        />
                    ) : (
                        <ProveedorForm
                            proveedor={null}
                            onClose={() => {
                                setRefreshTick((t) => t + 1);
                                handleCloseModal();
                            }}
                            onSaved={() => {
                                toast.current?.show({
                                    severity: 'success',
                                    summary: 'Éxito',
                                    detail: 'Proveedor registrado con éxito',
                                    life: 3000,
                                });
                            }}
                        />
                    )}
                </Dialog>
            </div>
        </div>
    );
}
