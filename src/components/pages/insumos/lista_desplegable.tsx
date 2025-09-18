"use client";

import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";

type Category = {
    id: number;
    name: string;
};

type CategoryDropdownProps = {
    value: number | null;
    onChange: (value: number | null) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    label?: string;
};

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
    value,
    onChange,
    placeholder = "Seleccionar",
    className = "",
    disabled = false,
    label,
}) => {
    const [categories, setCategories] = useState<Category[]>([]);

    // 🚀 Llamada a la API
    useEffect(() => {
        const fetchCategorias = async () => {
        try {
            const res = await fetch("/api/insumos/categorias");
            if (!res.ok) throw new Error("Error al cargar categorías");
            const data: Category[] = await res.json();
            setCategories(data);
        } catch (error) {
            console.error("❌ Error cargando categorías:", error);
        }
        };
        fetchCategorias();
    }, []);

    return (
        <div className="flex flex-col w-full">
        {label && <label className="font-bold mb-2 text-gray-700">{label}</label>}
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