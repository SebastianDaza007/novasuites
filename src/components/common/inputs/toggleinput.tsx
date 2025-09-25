"use client";

import React from "react";
import { SelectButton } from "primereact/selectbutton";

type OptionValue = string | number | boolean;

type OptionType = string | { label: string; value: OptionValue };

type ToggleInputProps<T extends OptionValue = boolean> = {
    value: T;
    onChange: (value: T) => void;
    options: OptionType[];
    label?: string;
    className?: string;
    disabled?: boolean;
    labelClassName?: string; // Clase opcional para personalizar el label
};

const ToggleInput = <T extends OptionValue = boolean>({
    value,
    onChange,
    options,
    label,
    className = "",
    disabled = false,
    labelClassName,
}: ToggleInputProps<T>) => {
    return (
        <div className="flex flex-col w-full">
        {label && (
            <label className={`font-bold mb-2 ${labelClassName ?? ""}`}>{label}</label>
        )}

        <SelectButton
            value={value}
            onChange={(e) => onChange(e.value)}
            options={options}
            className={`w-full ${className}`} // 👈 añadimos la clase
            disabled={disabled}
        />
        </div>
    );
};

export default ToggleInput;
