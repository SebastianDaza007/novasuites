"use client";

import React from "react";
import { Button as PrimeButton, ButtonProps as PrimeButtonProps } from "primereact/button";

// Extendemos el tipo para incluir todas las props de PrimeButton
type ButtonProps = PrimeButtonProps & {
  label?: string; // opcional, ya que algunas veces solo usamos icon
};

const Button: React.FC<ButtonProps> = ({ label, ...props }) => {
    return (
        <PrimeButton
        label={label}
        {...props}
        className={`
            rounded-xl 
            shadow-md 
            font-bold
            py-2 px-4
            transition-colors duration-200
            bg-[var(--primary)] 
            hover:bg-[var(--primary-hover)] 
            text-white
            ${props.className ?? ""}
        `}
        />
    );
};

export default Button;
