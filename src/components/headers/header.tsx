"use client";

import React from "react";
import { Panel } from "primereact/panel";
import Button from "../botones/button";

type HeaderProps = {
    title?: string;
    children?: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({
    title = "Insumos",
    children = null,
}) => {
    return (
        <Panel header={<h2 className="text-xl font-bold">{title}</h2>}>
            {/* Texto descriptivo y botón en la misma fila */}
            <div className="flex justify-between items-center px-4 py-2">
                <div className="flex-1">
                    {children || (
                        <p className="m-0">
                            Aquí podés visualizar todos los productos disponibles en el depósito.
                        </p>
                    )}
                </div>

                <Button
                    label="Agregar Insumo"
                    icon="pi pi-plus-circle"
                    onClick={() => alert("Función agregar insumo")}
                />
            </div>
        </Panel>
    );
};

export default Header;
