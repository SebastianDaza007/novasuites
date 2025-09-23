"use client";

import React, { ReactNode } from "react";
import { IconField, IconFieldProps } from "primereact/iconfield";
import { InputText, InputTextProps } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";

type AppInputIconProps = {
  icon: ReactNode; // el icono que queremos mostrar
  iconPosition?: IconFieldProps["iconPosition"]; // "left" o "right"
  inputProps?: InputTextProps; // props que queremos pasar al InputText
  className?: string; // clase para el contenedor
};

const InputIconField: React.FC<AppInputIconProps> = ({
  icon,
  iconPosition = "left",
  inputProps,
  className,
}) => {
  return (
    <div className={`${className ?? ""} w-full`}>
      <IconField iconPosition={iconPosition}>
        <InputIcon>{icon}</InputIcon>
        <InputText
          {...inputProps}
          className={`w-full ${inputProps?.className ?? ""}`}
        />
      </IconField>
    </div>
  );
};

export default InputIconField;
