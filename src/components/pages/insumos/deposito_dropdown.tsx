"use client";

import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";

type Deposito = {
    id: number;
    name: string;
};

type DepositoDropdownProps = {
    value: number | null;
    onChange: (value: number | null) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    label?: string;
};

const DepositoDropdown: React.FC<DepositoDropdownProps> = ({
    value,
    onChange,
    placeholder = "Seleccionar depósito",
    className = "",
    disabled = false,
    label,
}) => {
    const [depositos, setDepositos] = useState<Deposito[]>([]);

    // 🚀 Llamada a la API
    useEffect(() => {
        const fetchDepositos = async () => {
        try {
            const res = await fetch("/api/insumos/depositos");
            if (!res.ok) throw new Error("Error al cargar depósitos");
            const data: Deposito[] = await res.json();
            setDepositos(data);
        } catch (error) {
            console.error("❌ Error cargando depósitos:", error);
        }
        };
        fetchDepositos();
    }, []);

    return (
        <div className="flex flex-col w-full">
        {label && <label className="font-bold mb-2 text-gray-700">{label}</label>}
        <Dropdown
            value={value}
            onChange={(e) => onChange(e.value)}
            options={depositos}
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

export default DepositoDropdown;
