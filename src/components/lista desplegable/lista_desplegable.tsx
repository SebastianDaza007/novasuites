"use client";

import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";

type Category = {
    id_categoria: number;
    nombre_categoria: string;
};

type CategoryDropdownProps = {
    value: number | null;                          // id de la categoría seleccionada
    onChange: (value: number | null) => void;      // función para actualizar selección
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    label?: string;
};

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
    value,
    onChange,
    placeholder = "Selecciona una categoría",
    className = "",
    disabled = false,
    label,
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar categorías de la API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categorias?estado=true');
                const data = await response.json();
                
                if (data.success) {
                    setCategories(data.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Transformar categorías para el Dropdown
    const categoryOptions = categories.map(cat => ({
        label: cat.nombre_categoria,
        value: cat.id_categoria
    }));
    return (
        <div className="flex flex-col w-full">
            {label && <label className="font-bold mb-2">{label}</label>}
            <Dropdown
                value={value}
                onChange={(e) => onChange(e.value)}
                options={categoryOptions}
                optionLabel="label"
                optionValue="value"
                showClear
                placeholder={loading ? "Cargando categorías..." : placeholder}
                className={className || "w-full md:w-14rem"}
                disabled={disabled || loading}
                emptyMessage="No hay categorías disponibles"
            />
        </div>
    );
};

export default CategoryDropdown;
