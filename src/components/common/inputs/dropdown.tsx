"use client";

import React from "react";
import { Dropdown } from "primereact/dropdown";

type DropdownInputProps = {
    value: any;
    onChange: (value: any) => void;
    options: Array<{ label: string; value: any }>;
    label?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    labelClassName?: string; // Clase opcional para personalizar el label
};

const DropdownInput: React.FC<DropdownInputProps> = ({
    value,
    onChange,
    options,
    label,
    placeholder,
    className = "",
    disabled = false,
    labelClassName,
}) => {
    return (
        <div className="flex flex-col">
            {label && (
                <label className={`font-medium mb-2 ${labelClassName ?? "text-gray-900"}`}>{label}</label>
            )}
            <Dropdown
                value={value}
                onChange={(e) => onChange(e.value)}
                options={options}
                placeholder={placeholder}
                className={`w-full ${className}`}
                disabled={disabled}
            />
        </div>
    );
};

export default DropdownInput;
