"use client";

import React from "react";
import { Panel } from "primereact/panel";

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
            {/* Texto descriptivo */}
            <div className="px-4 py-2">
                {children || (
                    <p className="m-0">
                        Aquí podés visualizar todos los productos disponibles en el depósito.
                    </p>
                )}
            </div>
        </Panel>
    );
};

export default Header;
