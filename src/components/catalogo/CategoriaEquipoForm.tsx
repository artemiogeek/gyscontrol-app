// ===================================================
// 📁 Archivo: CategoriaEquipoForm.tsx
// 📌 Formulario para crear o editar Categoría de Equipo
// ===================================================

'use client'

import { useState } from 'react'
import { CategoriaEquipo, CategoriaEquipoPayload } from '@/types'
import { createCategoriaEquipo, updateCategoriaEquipo } from '@/lib/services/categoriaEquipo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'

interface Props {
  onCreated?: (categoria: CategoriaEquipo) => void
  onUpdated?: (categoria: CategoriaEquipo) => void
  defaultValue?: CategoriaEquipo
  isEditMode?: boolean
}

export default function CategoriaEquipoForm({
  onCreated,
  onUpdated,
  defaultValue,
  isEditMode = false,
}: Props) {
  const [nombre, setNombre] = useState(defaultValue?.nombre || '')
  const [descripcion, setDescripcion] = useState(defaultValue?.descripcion || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload: CategoriaEquipoPayload = { nombre, descripcion: descripcion || null }

    try {
      let response
      if (isEditMode && defaultValue?.id) {
        response = await updateCategoriaEquipo(defaultValue.id, payload)
        toast.success('Categoría actualizada')
        onUpdated?.(response)
      } else {
        response = await createCategoriaEquipo(payload)
        toast.success('Categoría creada')
        onCreated?.(response)
        setNombre('')
        setDescripcion('')
      }
    } catch (error) {
      toast.error('Error al guardar')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">
        {isEditMode ? '✏️ Editar Categoría' : '➕ Nueva Categoría'}
      </h2>

      <Input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre de la categoría"
        required
        disabled={loading}
      />

      <Textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Descripción de la categoría (opcional)"
        disabled={loading}
        rows={3}
      />

      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
      </Button>
    </form>
  )
}
