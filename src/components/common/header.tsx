"use client";

import React from "react";

import { Panel } from 'primereact/panel';
        
type HeaderProps = {
  title?: string;          // Texto del header
  children?: React.ReactNode; // Contenido dentro del panel
};
const Header: React.FC<HeaderProps> = ({
    title = "Mi Header",
    children = null,
    }) => {
    return (
    <Panel header={title}>
        {children || (
        <p className="m-0">
            Este es un contenido de ejemplo dentro del panel. 
            Podés poner botones, texto o cualquier componente.
        </p>
        )}
    </Panel>
    );
};

export default Header;