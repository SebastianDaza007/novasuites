"use client";

import React, { useState } from "react";
import { Calendar } from "primereact/calendar";

type DateInputProps = {
    value: Date | null; // ahora trabajamos con Date
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
const [error, setError] = useState("");
const [invalid, setInvalid] = useState(false);

  // ✅ Verifica si la fecha es válida en el calendario
const isValidDate = (date: Date | null) => {
    if (!date) return false;
    return !isNaN(date.getTime()); // chequea si es una fecha real
};

  // ✅ Valida fecha seleccionada
const validateDate = (date: Date | null) => {
    if (!date) {
        setError("");
        setInvalid(false);
        return;
    }

    if (!isValidDate(date)) {
    setError("La fecha no es válida");
    setInvalid(true);
    return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (date < hoy) {
        setError("La fecha no puede ser anterior a hoy");
        setInvalid(true);
    } else {
        setError("");
        setInvalid(false);
    }
};

return (
<div className="flex flex-col w-full">
    {label && <label className="font-bold mb-2 text-gray-700">{label}</label>}

    <Calendar
    value={value}
    onChange={(e) => {
        const selectedDate = e.value as Date | null;
        onChange(selectedDate);
        validateDate(selectedDate); // ✅ validación automática
    }}
    onBlur={() => validateDate(value)} // valida también al perder foco
    dateFormat="dd/mm/yy"
    placeholder={placeholder}
    showIcon
    className={`w-full ${invalid ? "p-invalid" : ""} ${className}`}
    disabled={disabled}
    />

    {error && <span className="text-red-600 mt-1">{error}</span>}
</div>
);
};

export default DateInput;
