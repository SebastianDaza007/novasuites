"use client";

import React from "react";
import { InputNumber } from "primereact/inputnumber";

// Definimos los props del componente
type NumericInputProps = {
    value: number | null;                       // Valor actual del input
    onChange: (value: number | null) => void;   // Función que se ejecuta cuando cambia el valor
    placeholder?: string;                        // Texto opcional que se muestra cuando el input está vacío
    min?: number;                                // Valor mínimo permitido
    max?: number;                                // Valor máximo permitido
    minFractionDigits?: number;                  // Mínimo de decimales
    maxFractionDigits?: number;                  // Máximo de decimales
    useGrouping?: boolean;                       // Separación de miles (true por defecto)
    className?: string;                           // Clases CSS personalizadas
    label?: string;                               // Etiqueta opcional encima del input
    disabled?: boolean;                           // Si el input está deshabilitado
};

const NumericInput: React.FC<NumericInputProps> = ({
    value,
    onChange,
    placeholder = "",       // Valor por defecto si no se pasa placeholder
    min,
    max,
    minFractionDigits,
    maxFractionDigits,
    useGrouping = true,     // Por defecto separa miles
    className = "",         // Clases CSS por defecto vacías
    label,
    disabled = false,       // Input habilitado por defecto
}) => {
    return (
        <div className="flex flex-col flex-auto">
            {/* Mostrar label si se pasó */}
            {label && <label className="font-bold mb-2">{label}</label>}

            <InputNumber
                value={value}                             // Valor actual del input
                onValueChange={(e) => onChange(e.value ?? null)} 
                // ⚡ Importante: e.value puede ser undefined, lo convertimos a null para TypeScript
                min={min}                                 // Valor mínimo permitido
                max={max}                                 // Valor máximo permitido
                minFractionDigits={minFractionDigits}     // Mínimo de decimales
                maxFractionDigits={maxFractionDigits}     // Máximo de decimales
                useGrouping={useGrouping}                 // Separación de miles
                placeholder={placeholder}                 // Texto cuando está vacío
                className={className}                     // Clases CSS
                disabled={disabled}                       // Deshabilitado si es true
            />
        </div>
    );
};

export default NumericInput;
