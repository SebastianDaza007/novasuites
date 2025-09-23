"use client";

import React from "react";
import { Calendar as PrimeCalendar, CalendarProps as PrimeCalendarProps } from "primereact/calendar";

// Extendemos las props del Calendar para agregar label opcional
type AppCalendarProps = PrimeCalendarProps & {
  label?: string;
  className?: string; // solo para el contenedor
};

const Calendar: React.FC<AppCalendarProps> = ({ label, className, ...props }) => {
  return (
    <div className={`flex-auto ${className ?? ""}`}>
      {label && <label className="font-bold block mb-2">{label}</label>}
      {/* No pasamos props.className, solo el resto de props */}
      <PrimeCalendar {...props} className="w-full" />
    </div>
  );
};

export default Calendar;

/* COMO SE USA
--------------------------------
"use client";

import React, { useState } from "react";
import Calendar from "@/components/ui/Calendar"; // tu wrapper

export default function IconDemo() {
  const [date1, setDate1] = useState<Date | null>(null);
  const [date2, setDate2] = useState<Date | null>(null);
  const [date3, setDate3] = useState<Date | null>(null);

  return (
    <div className="card flex flex-wrap gap-3 p-fluid">
      <Calendar
        label="Button Display"
        value={date1}
        onChange={(e) => setDate1(e.value)}
        showIcon
      />
      <Calendar
        label="Icon Display"
        value={date2}
        onChange={(e) => setDate2(e.value)}
        showIcon
      />
      <Calendar
        label="Icon Template"
        value={date3}
        onChange={(e) => setDate3(e.value)}
        showIcon
        timeOnly
        icon={() => <i className="pi pi-clock" />}
      />
    </div>
  );
}
*/