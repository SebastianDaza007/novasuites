"use client";

import React, { useState } from "react";
import Button from "@/components/common/button";
import Header from "@/components/common/header";

const HomeExample: React.FC = () => {
const [sidebarVisible, setSidebarVisible] = useState(false);

return (
<div className="min-h-screen bg-gray-50">

    {/* Botón flotante para abrir sidebar */}
    <div className="p-4">
    <Button
        label="" // necesario para tu ButtonProps
        icon="pi pi-bars"
        className="p-button-rounded p-button-text"
        onClick={() => setSidebarVisible(true)}
    />
    </div>


    {/* Contenedor principal */}
    <div className="p-8 flex flex-col gap-6">
    <Header title="Bienvenido a mi App" />

    <div className="flex flex-wrap gap-4">
        <Button label="Primario" onClick={() => alert("Botón primario")} />
        <Button label="Peligro" severity="danger" icon="pi pi-times" />
        <Button label="Deshabilitado" severity="secondary" disabled />
        <Button label="Ayuda" severity="help" icon="pi pi-question" />
        <Button label="Info" severity="info" icon="pi pi-info-circle" />
    </div>
    </div>
</div>
);
};

export default HomeExample;
