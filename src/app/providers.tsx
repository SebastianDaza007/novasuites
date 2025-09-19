"use client";

import React from "react";
import { PrimeReactProvider } from "primereact/api";

// Centralized client-side providers for the app
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrimeReactProvider
      value={{
        // Keep defaults safe and explicit to avoid undefined reads in runtime
        ripple: true,
        unstyled: false,
        inputStyle: "outlined",
        // Explicitly define overlays behavior to prevent 'hideOverlaysOnDocumentScrolling' undefined errors
        appendTo: undefined,
      }}
    >
      {children}
    </PrimeReactProvider>
  );
}
