"use client";

import React from "react";
import { Button as PrimeButton, ButtonProps as PrimeButtonProps } from "primereact/button";

type BotonCierreProps = Omit<PrimeButtonProps, 'severity' | 'rounded' | 'text'> & {
    onClick?: () => void;
};

const BotonCierre: React.FC<BotonCierreProps> = ({ onClick, ...props }) => {
    return (
        <PrimeButton
  icon="pi pi-times"
  onClick={onClick}
  rounded
  outlined
  severity="danger"
  text
  className={`w-10 h-10 flex items-center justify-center 
              text-red-500 hover:text-red-600 hover:bg-red-50 
              transition-all duration-200 ${props.className ?? ""}`}
  aria-label="Cerrar"
/>

    );
};
export default BotonCierre;
