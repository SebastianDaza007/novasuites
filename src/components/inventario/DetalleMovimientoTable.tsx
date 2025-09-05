'use client'

import { useEffect, useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'

type DetalleInsumo = {
  id_insumo: number | null
  cantidad: number
  costo_unitario?: number
  lote?: string
  fecha_vencimiento?: Date
}

type Props = {
  detalles: DetalleInsumo[]
  onChange: (detallesActualizados: DetalleInsumo[]) => void
}

export default function DetalleMovimientoTable({ detalles, onChange }: Props) {
  const [nuevo, setNuevo] = useState<DetalleInsumo>({
    id_insumo: null,
    cantidad: 0,
    costo_unitario: undefined,
    lote: '',
    fecha_vencimiento: undefined
  })

  const [insumosDisponibles, setInsumosDisponibles] = useState<
    { label: string; value: number }[]
  >([])

  const [errors, setErrors] = useState<{
    id_insumo?: string
    cantidad?: string
    costo_unitario?: string
    lote?: string
    fecha_vencimiento?: string
  }>({})

  useEffect(() => {
    const cargarInsumos = async () => {
      try {
        const res = await fetch('/api/movimiento') // usar tu ruta real
        const data = await res.json()
        const opciones = data.map((i: any) => ({
          label: i.nombre_insumo,
          value: i.id_insumo
        }))
        setInsumosDisponibles(opciones)
      } catch (err) {
        console.error('Error cargando insumos:', err)
      }
    }

    cargarInsumos()
  }, [])

  const validar = () => {
    const errs: {
      id_insumo?: string
      cantidad?: string
      costo_unitario?: string
      lote?: string
      fecha_vencimiento?: string
    } = {}

    if (!nuevo.id_insumo) errs.id_insumo = 'Selecciona un insumo'
    if (!nuevo.cantidad || nuevo.cantidad <= 0) errs.cantidad = 'Ingresa una cantidad válida'
    if (!nuevo.costo_unitario || nuevo.costo_unitario <= 0)
      errs.costo_unitario = 'Ingresa un costo válido'
    if (!nuevo.lote || nuevo.lote.trim() === '') errs.lote = 'Ingresa un lote'
    if (!nuevo.fecha_vencimiento) errs.fecha_vencimiento = 'Selecciona una fecha de vencimiento'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const agregarInsumo = () => {
    if (!validar()) return

    onChange([...detalles, nuevo])
    setNuevo({
      id_insumo: null,
      cantidad: 0,
      costo_unitario: undefined,
      lote: '',
      fecha_vencimiento: undefined
    })
    setErrors({})
  }

  const eliminar = (index: number) => {
    const copia = [...detalles]
    copia.splice(index, 1)
    onChange(copia)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Detalle de insumos</h3>

      {/* Formulario para agregar nuevo insumo */}
      <div className="grid grid-cols-6 gap-2 items-end">
        {/* Insumo */}
        <div className="col-span-2">
          <Dropdown
            value={nuevo.id_insumo}
            options={insumosDisponibles}
            onChange={(e) => setNuevo({ ...nuevo, id_insumo: e.value })}
            placeholder="Insumo"
            className={`w-full ${errors.id_insumo ? 'p-invalid' : ''}`}
          />
          <div className="h-4">
            {errors.id_insumo && (
              <small className="text-red-500">{errors.id_insumo}</small>
            )}
          </div>
        </div>

        {/* Cantidad */}
        <div>
          <InputText
            value={nuevo.cantidad ? nuevo.cantidad.toString() : ''}
            onChange={(e) => setNuevo({ ...nuevo, cantidad: Number(e.target.value) })}
            placeholder="Cantidad"
            className={`w-full ${errors.cantidad ? 'p-invalid' : ''}`}
          />
          <div className="h-4">
            {errors.cantidad && (
              <small className="text-red-500">{errors.cantidad}</small>
            )}
          </div>
        </div>

        {/* Costo */}
        <div>
          <InputText
            value={nuevo.costo_unitario?.toString() ?? ''}
            onChange={(e) =>
              setNuevo({ ...nuevo, costo_unitario: Number(e.target.value) || undefined })
            }
            placeholder="Costo unitario"
            className={`w-full ${errors.costo_unitario ? 'p-invalid' : ''}`}
          />
          <div className="h-4">
            {errors.costo_unitario && (
              <small className="text-red-500">{errors.costo_unitario}</small>
            )}
          </div>
        </div>

        {/* Lote */}
        <div>
          <InputText
            value={nuevo.lote ?? ''}
            onChange={(e) => setNuevo({ ...nuevo, lote: e.target.value })}
            placeholder="Lote"
            className={`w-full ${errors.lote ? 'p-invalid' : ''}`}
          />
          <div className="h-4">
            {errors.lote && <small className="text-red-500">{errors.lote}</small>}
          </div>
        </div>

        {/* Vencimiento */}
        <div>
          <Calendar
            value={nuevo.fecha_vencimiento}
            onChange={(e) =>
              setNuevo({
                ...nuevo,
                fecha_vencimiento: e.value instanceof Date ? e.value : new Date(e.value!)
              })
            }
            showIcon
            placeholder="Vto"
            className={`w-full ${errors.fecha_vencimiento ? 'p-invalid' : ''}`}
          />
          <div className="h-4">
            {errors.fecha_vencimiento && (
              <small className="text-red-500">{errors.fecha_vencimiento}</small>
            )}
          </div>
        </div>

        {/* Botón */}
        <div>
          <Button label="Agregar" icon="pi pi-plus" onClick={agregarInsumo} className="w-full" />
        </div>
      </div>

      {/* Tabla de insumos ya agregados */}
      <table className="w-full border mt-4 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Insumo</th>
            <th>Cantidad</th>
            <th>Costo</th>
            <th>Lote</th>
            <th>Vencimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((d, i) => {
            const nombre = insumosDisponibles.find((x) => x.value === d.id_insumo)?.label ?? '—'
            return (
              <tr key={i} className="text-center border-t">
                <td className="p-2">{nombre}</td>
                <td>{d.cantidad}</td>
                <td>{d.costo_unitario ?? '-'}</td>
                <td>{d.lote || '-'}</td>
                <td>
                  {d.fecha_vencimiento
                    ? new Date(d.fecha_vencimiento).toLocaleDateString()
                    : '-'}
                </td>
                <td>
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    rounded
                    text
                    onClick={() => eliminar(i)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
