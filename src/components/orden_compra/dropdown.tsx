"use client";

import React from "react";
import { Dropdown as PrimeDropdown, DropdownProps as PrimeDropdownProps } from "primereact/dropdown";

// Extendemos las props de PrimeReact para que acepte todo lo que ya maneja
type AppDropdownProps = PrimeDropdownProps & {
  className?: string;
};

const Dropdown: React.FC<AppDropdownProps> = ({ className, ...props }) => {
  return (
    <PrimeDropdown
      {...props}
      className={`w-full md:w-14rem ${className ?? ""}`}
      checkmark={true}
      highlightOnSelect={false}
    />
  );
};

export default Dropdown;
