"use client";

import React from "react";
import { Calendar } from "primereact/calendar";

type DateInputProps = {
    value: Date | null;
    onChange: (value: Date | null) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    label?: string;
};

const DateInput: React.FC<DateInputProps> = ({
    value,
    onChange,
    placeholder = "dd/mm/yyyy",
    className = "",
    disabled = false,
    label,
}) => {
    return (
        <div className="flex flex-col w-full">
            {label && <label className="font-bold mb-2 text-gray-700">{label}</label>}

            <Calendar
                value={value}
                onChange={(e) => onChange(e.value as Date | null)}
                dateFormat="dd/mm/yy"
                placeholder={placeholder}
                showIcon
                className={`w-full ${className}`}
                disabled={disabled}
            />
        </div>
    );
};

export default DateInput;
