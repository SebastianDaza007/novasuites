"use client"; // ⚡ Necesario en Next.js para componentes que usan estado o hooks en el cliente

import React from "react"; // Importa React
import { InputText } from "primereact/inputtext"; // Importa el componente InputText de PrimeReact

// Definimos los tipos de props que puede recibir el componente
type TextInputProps = {
    value: string;                        // Valor actual del input (controlado)
    onChange: (value: string) => void;    // Función que se ejecuta al cambiar el valor
    placeholder?: string;                 // Texto que se muestra cuando está vacío
    className?: string;                   // Clases CSS para personalizar el estilo
    disabled?: boolean;  
    label?: string; // ✅ nueva prop para el label                 // Indica si el input está deshabilitado
};

// Componente reutilizable de InputText
const TextInput: React.FC<TextInputProps> = ({
    value,
    onChange,
    placeholder = "", // valor por defecto si no se pasa placeholder
    className = "",   // valor por defecto si no se pasan clases
    disabled = false, // valor por defecto si no se indica disabled
    label,
}) => {
    return (
        <div className="flex flex-col">
            {/* ✅ Mostramos el label si se pasó */}
            {label && <label className="font-bold mb-2">{label}</label>}
        <InputText
            value={value} // Valor actual del input
            onChange={(e) => onChange(e.target.value)} // Actualiza el valor llamando a la función onChange pasada desde afuera
            placeholder={placeholder} // Texto de ejemplo
            className={className}     // Clases CSS para estilizar
            disabled={disabled}       // Si está deshabilitado
            
        />
        </div>
    );
};


export default TextInput;
