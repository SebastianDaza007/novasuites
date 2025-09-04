"use client";

import React from "react";
import { InputTextarea } from "primereact/inputtextarea";

// Props del componente
type TextAreaInputProps = {
    value: string;                        // Valor actual del textarea
    onChange: (value: string) => void;    // Callback cuando cambia el valor
    placeholder?: string;                 // Placeholder
    className?: string;                   // Clases CSS personalizadas
    rows?: number;                        // Filas visibles
                          // Columnas visibles
    disabled?: boolean;                   // Deshabilitado
    label?: string;                        // Label opcional
};

const TextAreaInput: React.FC<TextAreaInputProps> = ({
    value,
    onChange,
    placeholder = "",
    className = "",
    rows = 3,

    disabled = false,
    label,
}) => {
    return (
        <div className="flex flex-col">
            {/* Label opcional */}
            {label && <label className="font-bold mb-2">{label}</label>}

            <InputTextarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                autoResize={false}            // ❌ Desactivamos auto resize
                className={`w-full border rounded p-2 overflow-auto ${className}`}
                disabled={disabled}
            />
        </div>
    );
};

export default TextAreaInput;
