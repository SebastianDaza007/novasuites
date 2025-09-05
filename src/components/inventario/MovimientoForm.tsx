'use client'

import { useEffect, useState } from 'react'
import { InputTextarea } from 'primereact/inputtextarea'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import DetalleMovimientoTable from './DetalleMovimientoTable'

type MovimientoFormData = {
  tipoMovimiento: number | null
  depositoOrigen: number | null
  depositoDestino: number | null
  id_orden_compra: number | null
  id_razon_movimiento: number | null
  observaciones: string
  fecha: Date | null
  detalles: DetalleInsumo[]
}

type DetalleInsumo = {
  id_insumo: number | null
  cantidad: number
  costo_unitario?: number
  lote?: string
  fecha_vencimiento?: Date
}

export default function MovimientoForm() {
  const [formData, setFormData] = useState<MovimientoFormData>({
    tipoMovimiento: null,
    depositoOrigen: null,
    depositoDestino: null,
    id_orden_compra: null,
    id_razon_movimiento: null,
    observaciones: '',
    fecha: new Date(),
    detalles: []
  })

  const [tiposMovimiento, setTiposMovimiento] = useState<{ label: string; value: number }[]>([])
  const [depositos, setDepositos] = useState<{ label: string; value: number }[]>([])
  const [ordenesCompra, setOrdenesCompra] = useState<{ label: string; value: number }[]>([])
  const [razonesMovimiento, setRazonesMovimiento] = useState<{ label: string; value: number }[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const cargarTipos = async () => {
      try {
        const res = await fetch('/api/movimiento/tipo-movimientos')
        const data = await res.json()
        setTiposMovimiento(
          data.map((tipo: any) => ({
            label: tipo.nombre_tipo,
            value: tipo.id_tipo_movimiento
          }))
        )
      } catch (err) {
        console.error('Error al cargar tipos:', err)
      }
    }

    const cargarDepositos = async () => {
      try {
        const res = await fetch('/api/movimiento/depositos')
        const data = await res.json()
        setDepositos(
          data.map((dep: any) => ({
            label: dep.nom_deposito,
            value: dep.id_deposito
          }))
        )
      } catch (err) {
        console.error('Error al cargar depósitos:', err)
      }
    }

    const cargarOrdenes = async () => {
      try {
        const res = await fetch('/api/movimiento/ordenes-compra')
        const data = await res.json()
        setOrdenesCompra(
          data.map((oc: any) => ({
            label: oc.numero_orden,
            value: oc.id_orden_compra
          }))
        )
      } catch (err) {
        console.error('Error al cargar órdenes:', err)
      }
    }

    const cargarRazones = async () => {
      try {
        const res = await fetch('/api/movimiento/razones')
        const data = await res.json()
        setRazonesMovimiento(
          data.map((raz: any) => ({
            label: raz.nombre_razon,
            value: raz.id_razon
          }))
        )
      } catch (err) {
        console.error('Error al cargar razones:', err)
      }
    }

    cargarTipos()
    cargarDepositos()
    cargarOrdenes()
    cargarRazones()
  }, [])

  const handleChange = (field: keyof MovimientoFormData, value: any) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.tipoMovimiento) {
      newErrors.tipoMovimiento = 'El tipo de movimiento es obligatorio'
    }

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es obligatoria'
    }

    if (!formData.detalles || formData.detalles.length === 0) {
      newErrors.detalles = 'Debe agregar al menos un insumo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      const res = await fetch('/api/movimiento/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const contentType = res.headers.get('content-type')

      if (!res.ok) {
        const msg = contentType?.includes('application/json')
          ? (await res.json()).error
          : await res.text()
        throw new Error(msg || 'Error desconocido')
      }

      alert('✅ Movimiento registrado con éxito')
      window.location.reload()
    } catch (error: any) {
      alert(`❌ Error al registrar: ${error.message}`)
    }
  }

  return (
    <section className="h-full p-6 bg-white rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📦 Registrar Movimiento</h2>

      {/* Datos principales */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-1">Datos principales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Tipo de movimiento *
            </label>
            <Dropdown
              value={formData.tipoMovimiento ?? null}
              options={tiposMovimiento}
              onChange={(e) => handleChange('tipoMovimiento', e.value)}
              placeholder="Seleccionar"
              className={`w-full ${errors.tipoMovimiento ? 'p-invalid' : ''}`}
            />
            {errors.tipoMovimiento && (
              <small className="p-error">{errors.tipoMovimiento}</small>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">Fecha *</label>
            <Calendar
              value={formData.fecha}
              onChange={(e) =>
                handleChange(
                  'fecha',
                  e.value instanceof Date ? e.value : new Date(e.value ?? new Date())
                )
              }
              dateFormat="dd/mm/yy"
              showIcon
              className={`w-full ${errors.fecha ? 'p-invalid' : ''}`}
            />
            {errors.fecha && <small className="p-error">{errors.fecha}</small>}
          </div>
        </div>
      </div>

      {/* Depósitos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-1">Depósitos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Dropdown
            value={formData.depositoOrigen ?? null}
            options={depositos}
            onChange={(e) => handleChange('depositoOrigen', e.value)}
            placeholder="Depósito origen (opcional)"
            className="w-full"
            showClear
          />
          <Dropdown
            value={formData.depositoDestino ?? null}
            options={depositos}
            onChange={(e) => handleChange('depositoDestino', e.value)}
            placeholder="Depósito destino (opcional)"
            className="w-full"
            showClear
          />
        </div>
      </div>

      {/* Otros datos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-1">Otros datos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Dropdown
            value={formData.id_orden_compra ?? null}
            options={ordenesCompra}
            onChange={(e) => handleChange('id_orden_compra', e.value)}
            placeholder="Orden de compra (opcional)"
            className="w-full"
            showClear
          />
          <Dropdown
            value={formData.id_razon_movimiento ?? null}
            options={razonesMovimiento}
            onChange={(e) => handleChange('id_razon_movimiento', e.value)}
            placeholder="Razón de movimiento (opcional)"
            className="w-full"
            showClear
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">Observaciones</label>
          <InputTextarea
            value={formData.observaciones}
            onChange={(e) => handleChange('observaciones', e.target.value)}
            rows={3}
            className="w-full"
            autoResize
          />
        </div>
      </div>

      {/* Insumos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-1">Insumos *</h3>
        <div className="max-h-[250px] overflow-y-auto">
          <DetalleMovimientoTable
            detalles={formData.detalles}
            onChange={(detallesActualizados) =>
              handleChange('detalles', detallesActualizados)
            }
          />
        </div>
        {errors.detalles && <small className="p-error">{errors.detalles}</small>}
      </div>

      <div className="flex justify-end">
        <Button
          label="Guardar movimiento"
          icon="pi pi-check"
          severity="success"
          onClick={handleSubmit}
        />
      </div>
    </section>
  )
}
