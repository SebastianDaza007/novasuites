"use client";

import React from "react";
import { SelectButton } from "primereact/selectbutton";

type OptionValue = string | number | boolean;

type OptionType = string | { label: string; value: OptionValue };

type ToggleInputProps<T extends OptionValue = boolean> = {
    value: T;
    onChange: React.Dispatch<React.SetStateAction<T>>;
    options: OptionType[];
    label?: string;
    className?: string;
    disabled?: boolean;
};

const ToggleInput = <T extends OptionValue = boolean>({
    value,
    onChange,
    options,
    label,
    className = "",
    disabled = false,
}: ToggleInputProps<T>) => {
    return (
        <div className="flex flex-col w-full">
        {label && <label className="font-bold mb-2">{label}</label>}

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
