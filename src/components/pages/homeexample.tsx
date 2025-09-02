"use client";

import React from "react";
import Button from "@/components/botones/button";

const HomeExample: React.FC = () => {
    return (
    <div className="p-8 flex gap-4 bg-white">
        <Button 
        label="Primario" 
        onClick={() => alert("Botón primario")} // sin severity → usa el estilo por defecto
        />
        <Button 
        label="Peligro" 
        severity="danger" 
        icon="pi pi-times" 
        />
        <Button 
        label="Deshabilitado" 
        severity="secondary" 
        disabled 
        />
    </div>
    );
};

export default HomeExample;
