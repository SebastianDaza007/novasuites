"use client";

import React from "react";
import { SelectButton } from "primereact/selectbutton";

type OptionType = string | { label: string; value: any };

type ToggleInputProps = {
    value: any;                           // Valor seleccionado
    onChange: (value: any) => void;       // Callback cuando cambia
    options: OptionType[];                // Opciones disponibles
    label?: string;                       // Label opcional
    className?: string;                   // Clases CSS adicionales
    disabled?: boolean;                   // Si está deshabilitado
};

const ToggleInput: React.FC<ToggleInputProps> = ({
    value,
    onChange,
    options,
    label,
    className = "",
    disabled = false,
}) => {
    return (
        <div className="flex flex-col w-full">
            {label && <label className="font-bold mb-2">{label}</label>}

            <SelectButton
                value={value} // ✅ Aquí va value, no checked
                onChange={(e) => onChange(e.value)}
                options={options}
                className={`w-full ${className}`}
                disabled={disabled}
            />
        </div>
    );
};

export default ToggleInput;
