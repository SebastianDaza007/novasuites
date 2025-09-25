"use client";

import React from "react";
import { InputNumber, InputNumberProps } from "primereact/inputnumber";

type InputNumberOCProps = InputNumberProps & {
  label?: string;
  className?: string;       // clases para el contenedor <div>
  inputClassName?: string;  // clases para el input interno
};

const InputNumberOC: React.FC<InputNumberOCProps> = ({ label, className, inputClassName, ...props }) => {
  return (
    <div className={`w-full ${className ?? ""}`}> {/* <- w-full aquí */}
      {label && <label className="font-bold block mb-2">{label}</label>}
      <InputNumber
        {...props}
        className={`w-full`}             // <- para el contenedor interno
        inputClassName={`w-full ${inputClassName ?? ""}`}
        style={{ width: "100%" }}        // <- fuerza que el input ocupe todo
      />
    </div>
  );
};

export default InputNumberOC;
