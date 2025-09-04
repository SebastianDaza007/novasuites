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
            {...props} // todas las demás props van directo a PrimeButton
            className={`0.5rem 0.2rem rounded-xl shadow-md font-bold ${props.className ?? ""}`}
        />
    );
};

export default Button;
