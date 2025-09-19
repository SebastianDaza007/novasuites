"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
// No dropdown, we'll use buttons for estado filter

interface Proveedor {
  id: number;
  nombre_proveedor: string;
  cuit_proveedor: string;
  correo_proveedor: string | null;
  telefono_proveedor: number | null;
  direccion_proveedor: string | null;
  contacto_responsable: number | null;
  activo: boolean;
  fecha_actualizacion?: string | null;
}

interface ApiResponse {
  items: Proveedor[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface TablaProveedoresProps {
  onEdit?: (proveedor: Proveedor) => void;
}

const TablaProveedores = ({ onEdit }: TablaProveedoresProps) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [cuitFilter, setCuitFilter] = useState("");
  const [nombreFilter, setNombreFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("");

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ver proveedor (modal)
  const [verProveedor, setVerProveedor] = useState<Proveedor | null>(null);
  const [verVisible, setVerVisible] = useState<boolean>(false);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Estado handled with buttons: '', 'activo', 'inactivo'

  const fetchProveedores = async (pageArg = page, rowsArg = rows) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(pageArg),
        pageSize: String(rowsArg),
      });

      if (globalFilter) params.append("q", globalFilter);
      if (cuitFilter) params.append("cuit", cuitFilter);
      if (nombreFilter) params.append("q", nombreFilter);
      if (estadoFilter) params.append("estado", estadoFilter);

      const res = await fetch(`/api/proveedores?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data: ApiResponse = await res.json();
      setProveedores(data.items ?? []);
      setTotalRecords(data.total ?? 0);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando proveedores");
    } finally {
      setLoading(false);
    }
  };

  const restablecer = () => {
    setPage(1);
    fetchProveedores(1, rows);
  };

  // Debounce filters and fetch
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchProveedores(1, rows);
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilter, cuitFilter, nombreFilter, estadoFilter, rows]);

  // Initial fetch
  useEffect(() => {
    fetchProveedores(page, rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const limpiarFiltros = () => {
    setGlobalFilter("");
    setCuitFilter("");
    setNombreFilter("");
    setEstadoFilter("");
  };

  const header = (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex gap-3 flex-wrap items-center w-full">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={cuitFilter}
            onChange={(e) => setCuitFilter(e.target.value)}
            placeholder="CUIT/CUIL"
            className="p-inputtext-sm w-48 border border-gray-300 rounded"
          />
        </span>

        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={nombreFilter}
            onChange={(e) => setNombreFilter(e.target.value)}
            placeholder="Nombre Proveedor"
            className="p-inputtext-sm w-64 border border-gray-300 rounded"
          />
        </span>

        <div className="flex gap-2">
          <Button
            label="Todos"
            className={`${estadoFilter === "" ? "bg-purple-600 text-white" : "bg-white border border-purple-500 text-purple-600"} px-4 py-2 rounded-full`}
            outlined={estadoFilter !== ""}
            onClick={() => setEstadoFilter("")}
          />
          <Button
            label="Activo"
            className={`${estadoFilter === "activo" ? "bg-blue-600 text-white" : "bg-white border border-blue-500 text-blue-600"} px-4 py-2 rounded-full`}
            outlined={estadoFilter !== "activo"}
            onClick={() => setEstadoFilter("activo")}
          />
          <Button
            label="Inactivo"
            className={`${estadoFilter === "inactivo" ? "bg-white border border-gray-300 text-gray-600" : "bg-white border border-gray-300 text-gray-600"} px-4 py-2 rounded-full`}
            outlined
            onClick={() => setEstadoFilter("inactivo")}
          />
        </div>

        <div className="flex-1" />

        <Button
          label="Limpiar Filtros"
          icon="pi pi-filter-slash"
          className="rounded-md px-4 py-2 font-semibold border-2 bg-transparent hover:bg-orange-50"
          style={{ borderColor: '#f59e0b', color: '#d97706', backgroundColor: 'transparent' }}
          onClick={limpiarFiltros}
        />

        <Button
          icon="pi pi-refresh"
          outlined
          className="ml-2 rounded-md px-4 py-2 font-semibold flex items-center justify-center"
          style={{ backgroundColor: 'transparent', borderColor: '#3B82F6', color: '#2563EB' }}
          onClick={restablecer}
          aria-label="Restablecer"
          tooltip="Restablecer"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    </div>
  );

  const estadoBodyTemplate = (row: Proveedor) => (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${row.activo ? "bg-blue-500 text-white" : "bg-purple-600 text-white"}`}
    >
      {row.activo ? "Activo" : "Inactivo"}
    </span>
  );

  const accionesBodyTemplate = (row: Proveedor) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="text-purple-600"
        rounded
        text
        onClick={() => onEdit?.(row)}
        tooltip="Editar"
        tooltipOptions={{ position: "top" }}
      />
      <Button
        icon="pi pi-eye"
        className="text-purple-600"
        rounded
        text
        onClick={() => {
          setVerProveedor(row);
          setVerVisible(true);
        }}
        tooltip="Ver"
        tooltipOptions={{ position: "top" }}
      />
    </div>
  );

  return (
    <div className="card">
      <DataTable
        value={proveedores}
        header={header}
        loading={loading}
        size="small"
        tableStyle={{ minWidth: '50rem', width: '100%' }}
        paginator
        rows={rows}
        totalRecords={totalRecords}
        first={(page - 1) * rows}
        onPage={(e) => {
          const newPage = Math.floor(e.first / e.rows) + 1;
          setPage(newPage);
          setRows(e.rows);
          fetchProveedores(newPage, e.rows);
        }}
        rowsPerPageOptions={[5, 10, 20, 50]}
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} proveedores"
      >
        <Column
          field="cuit_proveedor"
          header="CUIT/CUIL"
          body={(row) => row.cuit_proveedor ?? "-"}
          style={{ whiteSpace: 'nowrap', width: '12rem' }}
          bodyClassName="whitespace-nowrap"
          bodyStyle={{ textAlign: 'center', paddingLeft: '0.5rem' }}
          headerClassName="text-center"
          headerStyle={{ backgroundColor: "white", color: "black", fontWeight: 600 }}
        />
        <Column
          field="nombre_proveedor"
          header="Nombre"
          bodyStyle={{ textAlign: 'center' }}
          style={{ width: '14rem' }}
          headerClassName="text-center"
          headerStyle={{ backgroundColor: "white", color: "black", fontWeight: 600 }}
        />
        <Column
          field="direccion_proveedor"
          header="Domicilio"
          bodyStyle={{ textAlign: 'center' }}
          style={{ width: '14rem' }}
          headerClassName="text-center"
          headerStyle={{ backgroundColor: "white", color: "black", fontWeight: 600 }}
        />
        <Column
          field="contacto_responsable"
          header="Teléfono responsable"
          body={(row) => (
            row.contacto_responsable ? (
              <span>{row.contacto_responsable}</span>
            ) : (
              <span className="inline-block w-full text-center">-</span>
            )
          )}
          bodyStyle={{ textAlign: 'center' }}
          style={{ width: '11rem' }}
          headerClassName="text-center"
          headerStyle={{ backgroundColor: "white", color: "black", fontWeight: 600, paddingLeft: '0.25rem', paddingRight: '0.25rem' }}
        />
        <Column
          field="correo_proveedor"
          header="Correo"
          body={(row) => (
            row.correo_proveedor ? (
              <span>{row.correo_proveedor}</span>
            ) : (
              <span className="inline-block w-full text-center">-</span>
            )
          )}
          bodyStyle={{ textAlign: 'center' }}
          style={{ width: '12rem' }}
          headerClassName="text-center"
          headerStyle={{ backgroundColor: "white", color: "black", fontWeight: 600, textAlign: 'center', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}
        />
        <Column
          field="activo"
          header="Estado"
          body={estadoBodyTemplate}
          bodyStyle={{ textAlign: 'center' }}
          style={{ width: '8rem' }}
          headerClassName="text-center"
          headerStyle={{ backgroundColor: "white", color: "black", fontWeight: 600 }}
        />
        <Column
          header="Acciones"
          body={accionesBodyTemplate}
          style={{ width: '10rem' }}
          headerStyle={{ backgroundColor: "white", color: "black", fontWeight: 600, textAlign: "left", paddingLeft: "2.5rem" }}
        />
      </DataTable>
      {error && (
        <div className="p-3 text-red-600 text-sm">{error}</div>
      )}
      <Dialog
        header="Detalle del proveedor"
        visible={verVisible}
        style={{ width: '34rem' }}
        modal
        onHide={() => setVerVisible(false)}
      >
        {verProveedor ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="font-medium text-gray-600">CUIT/CUIL</div>
            <div className="text-gray-800">{verProveedor.cuit_proveedor || '-'}</div>
            <div className="font-medium text-gray-600">Nombre</div>
            <div className="text-gray-800">{verProveedor.nombre_proveedor || '-'}</div>
            <div className="font-medium text-gray-600">Domicilio</div>
            <div className="text-gray-800">{verProveedor.direccion_proveedor || '-'}</div>
            <div className="font-medium text-gray-600">Teléfono</div>
            <div className="text-gray-800">{verProveedor.telefono_proveedor ?? '-'}</div>
            <div className="font-medium text-gray-600">Tel. responsable</div>
            <div className="text-gray-800">{verProveedor.contacto_responsable ?? '-'}</div>
            <div className="font-medium text-gray-600">Correo</div>
            <div className="text-gray-800">{verProveedor.correo_proveedor || '-'}</div>
            <div className="font-medium text-gray-600">Estado</div>
            <div className="text-gray-800">{verProveedor.activo ? 'Activo' : 'Inactivo'}</div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">Sin datos</div>
        )}
        <div className="flex justify-end mt-4">
          <Button label="Cerrar" onClick={() => setVerVisible(false)} className="rounded-md px-4" />
        </div>
      </Dialog>
    </div>
  );
};

export default TablaProveedores;