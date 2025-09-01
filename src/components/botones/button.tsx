"use client";

import React from "react";
import { Button as PrimeButton } from "primereact/button";

type ButtonProps = {
    label: string;                        
    onClick?: () => void;                 
    icon?: string;                        
    severity?: "secondary" | "success" | "info" | "warning" | "danger" | "help" | "contrast";
    disabled?: boolean;                   
    className?: string;                   
};

const Button: React.FC<ButtonProps> = ({
    label,
    onClick,
    icon,
    severity = "secondary", // 👈 default válido
    disabled = false,
    className = "",
    }) => {
    return (
    <PrimeButton
        label={label}
        icon={icon}
        severity={severity}
        onClick={onClick}
        disabled={disabled}
        className={className}
    />
    );
};

export default Button;
