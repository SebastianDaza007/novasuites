"use client";

import React, { useState } from "react";
import { InputMask, InputMaskChangeEvent } from "primereact/inputmask";

type DateInputProps = {
    value: string;
    onChange: (value: string) => void;
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
    const isValidDate = (day: number, month: number, year: number) => {
        const date = new Date(year, month - 1, day);
        return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        );
    };

    const validateDate = (inputValue: string) => {
        const parts = inputValue.split("/"); // ["dd","mm","yyyy"]

        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);

            if (!isValidDate(day, month, year)) {
                setError("La fecha no es válida");
                setInvalid(true);
                return;
            }

            const fechaInput = new Date(year, month - 1, day);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (fechaInput < hoy) {
                setError("La fecha no puede ser anterior a hoy");
                setInvalid(true);
            } else {
                setError("");
                setInvalid(false);
            }
        } else {
            setError("");
            setInvalid(false);
        }
    };

    return (
        <div className="flex flex-col w-full">
            {label && <label className="font-bold mb-2">{label}</label>}

            <InputMask
                value={value}
                onChange={(e: InputMaskChangeEvent) => onChange(e.value ?? "")}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                    validateDate(e.target.value)
                }
                mask="99/99/9999"
                placeholder={placeholder}
                slotChar="dd/mm/yyyy"
                autoClear={false}
                invalid={invalid}
                className={`w-full border rounded p-2 ${className}`}
                disabled={disabled}
            />

            {error && <span className="text-red-600 mt-1">{error}</span>}
        </div>
    );
};

export default DateInput;
