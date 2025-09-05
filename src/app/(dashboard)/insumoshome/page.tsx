"use client";

import React from "react";
import Header from "@/components/headers/header"; 
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

// Datos hardcodeados para prueba
const productosMock = [
    { id: 1, nombre: "Monitor 24''", categoria: "Electrónica", stock: 15 },
    { id: 2, nombre: "Teclado Mecánico", categoria: "Periféricos", stock: 8 },
    { id: 3, nombre: "Silla Ergonómica", categoria: "Muebles", stock: 5 },
    { id: 4, nombre: "Notebook Dell", categoria: "Informática", stock: 3 },
    { id: 5, nombre: "Mouse Gamer", categoria: "Periféricos", stock: 20 },
];

export default function InsumosHomePage() {
    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* Header con título */}
        <Header title="Gestión de Insumos">
            <p className="m-0">
            Aquí podés visualizar todos los productos disponibles en el depósito.
            </p>
        </Header>

        {/* DataTable */}
        <div className="card overflow-x-auto">
        <DataTable
            value={productosMock}
            paginator
            rows={5}
            stripedRows
            tableStyle={{ minWidth: "50rem" }}
            emptyMessage="No se encontraron productos."
        >
            <Column field="id" header="ID" />
            <Column field="nombre" header="Nombre del Insumo" />
            <Column field="categoria" header="Categoría" />
            <Column field="stock" header="Stock" />
        </DataTable>
        </div>
        </div>
    );
}
