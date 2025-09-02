"use client";

import React from "react";
import { Menubar } from "primereact/menubar";


const Navbar: React.FC = () => {
// Items del menú
const items = [
{
    label: "Inicio",
    icon: "pi pi-home",
    command: () => { alert("Ir a Inicio"); }
},
{
    label: "Productos",
    icon: "pi pi-box",
    items: [
    { label: "Todos los productos", command: () => { alert("Todos los productos"); } },
    { label: "Categorías", command: () => { alert("Categorías"); } },
    ]
},
{
    label: "Carrito",
    icon: "pi pi-shopping-cart",
    command: () => { alert("Ir al carrito"); }
},
{
    label: "Contacto",
    icon: "pi pi-envelope",
    command: () => { alert("Ir a contacto"); }
}
];

return (
<Menubar model={items} />
);
};

export default Navbar;
