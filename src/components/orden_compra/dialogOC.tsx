"use client";

import React from "react";
import { Dialog, DialogProps } from "primereact/dialog";

type DialogOCProps = DialogProps & {
  header?: string;
  visible: boolean;
  onHide: () => void;
  children: React.ReactNode;
  width?: string;
  className?: string;
};

const DialogOC: React.FC<DialogOCProps> = ({
  header,
  visible,
  onHide,
  children,
  width = "50vw",
  className,
  ...props
}) => {
  return (
    <Dialog
      header={header}
      visible={visible}
      style={{ width }}
      onHide={onHide}
      className={className}
      {...props}
    >
      {children}
    </Dialog>
  );
};

export default DialogOC;
