"use client";

import React from "react";
import { Dropdown } from "primereact/dropdown";

type CategoryDropdownProps = {
    value: number | null;                          // id de la categoría seleccionada
    onChange: (value: number | null) => void;      // función para actualizar selección
    categories?: { id: number; name: string }[];  // lista de categorías opcional
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    label?: string;                                // ✅ nuevo prop
};

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
    value,
    onChange,
    categories = [
        { id: 1, name: "Electrónica" },
        { id: 2, name: "Ropa de cama" },
        { id: 3, name: "Comestibles" },
        { id: 4, name: "Bebidas" },
        { id: 5, name: "Limpieza" },
    ],
    placeholder = "Selecciona una categoría",
    className = "",
    disabled = false,
    label,
}) => {
    return (
        <div className="flex flex-col w-full">
            {label && <label className="font-bold mb-2">{label}</label>}
            <Dropdown
                value={value}
                onChange={(e) => onChange(e.value)}
                options={categories}
                optionLabel="name"
                optionValue="id"
                showClear
                placeholder={placeholder}
                className={className || "w-full md:w-14rem"}
                disabled={disabled}
            />
        </div>
    );
};

export default CategoryDropdown;
