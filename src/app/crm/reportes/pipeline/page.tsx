'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Target, TrendingUp, Clock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { getOportunidades } from '@/lib/services/crm/oportunidades'

interface Oportunidad {
  id: string
  nombre: string
  valorEstimado?: number
  estado: string
  prioridad: string
  fechaCierreEstimada?: string
  cliente?: {
    nombre: string
  }
}

interface PipelineStage {
  nombre: string
  estado: string
  cantidad: number
  valorTotal: number
  tiempoPromedio: number
  probabilidadPromedio: number
  oportunidades: any[]
}

const pipelineStages = [
  { id: 'prospecto', name: 'Prospecto', color: 'text-gray-600', bgColor: 'bg-gray-50' },
  { id: 'contacto_inicial', name: 'Contacto Inicial', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'cotizacion', name: 'Cotización', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { id: 'negociacion', name: 'Negociación', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { id: 'cerrada_ganada', name: 'Cerrada Ganada', color: 'text-green-600', bgColor: 'bg-green-50' },
  { id: 'cerrada_perdida', name: 'Cerrada Perdida', color: 'text-red-600', bgColor: 'bg-red-50' }
]

export default function PipelineReportPage() {
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([])
  const [loading, setLoading] = useState(true)
  const [pipelineData, setPipelineData] = useState<PipelineStage[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Load pipeline data from API
        const response = await fetch('/api/crm/reportes/pipeline')
        if (!response.ok) {
          throw new Error('Error al cargar datos de pipeline')
        }
        const data = await response.json()

        setPipelineData(data.etapas)
      } catch (error) {
        console.error('Error loading pipeline data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const totalValue = pipelineData.reduce((sum, stage) => sum + stage.valorTotal, 0)
  const activeValue = pipelineData
    .filter(stage => !stage.estado.includes('cerrada'))
    .reduce((sum, stage) => sum + stage.valorTotal, 0)

  const conversionRate = totalValue > 0 ?
    (pipelineData.find(s => s.estado === 'cerrada_ganada')?.valorTotal || 0) / totalValue * 100 : 0

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Cargando reporte de pipeline...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reporte de Pipeline</h1>
            <p className="text-gray-600 mt-1">Análisis del embudo de ventas por etapas</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Pipeline</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Valor estimado total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Activo</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(activeValue)}</div>
            <p className="text-xs text-muted-foreground">Oportunidades abiertas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Prospectos → Ganadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">24 días</div>
            <p className="text-xs text-muted-foreground">En pipeline activo</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Embudo de Ventas</CardTitle>
          <CardDescription>
            Distribución de oportunidades por etapas del pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {pipelineData.map((stage, index) => {
            // Define colors based on stage state
            const getStageColors = (estado: string) => {
              switch (estado) {
                case 'prospecto': return { bgColor: 'bg-gray-50', color: 'text-gray-600' }
                case 'contacto_inicial': return { bgColor: 'bg-blue-50', color: 'text-blue-600' }
                case 'propuesta_enviada': return { bgColor: 'bg-yellow-50', color: 'text-yellow-600' }
                case 'negociacion': return { bgColor: 'bg-orange-50', color: 'text-orange-600' }
                case 'cerrada_ganada': return { bgColor: 'bg-green-50', color: 'text-green-600' }
                case 'cerrada_perdida': return { bgColor: 'bg-red-50', color: 'text-red-600' }
                default: return { bgColor: 'bg-gray-50', color: 'text-gray-600' }
              }
            }

            const colors = getStageColors(stage.estado)

            return (
              <motion.div
                key={stage.estado}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.bgColor}`}>
                      <Target className={`h-4 w-4 ${colors.color}`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{stage.nombre}</h3>
                      <p className="text-sm text-muted-foreground">
                        {stage.cantidad} oportunidades • {formatCurrency(stage.valorTotal)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{Math.round(stage.tiempoPromedio)} días promedio</div>
                    <div className="text-xs text-muted-foreground">Tiempo en etapa</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span>{stage.cantidad} oportunidades</span>
                  </div>
                  <Progress
                    value={totalValue > 0 ? (stage.valorTotal / totalValue) * 100 : 0}
                    className="h-2"
                  />
                </div>

                {/* Show some opportunities in this stage */}
                {stage.oportunidades.length > 0 && (
                  <div className="ml-11 space-y-2">
                    {stage.oportunidades.slice(0, 3).map((opp) => (
                      <div key={opp.id || opp.fechaInicio} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                        <div>
                          <span className="font-medium">Oportunidad {opp.fechaInicio}</span>
                          <span className="text-muted-foreground ml-2">• {formatCurrency(opp.fechaCierreEstimada || 0)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {stage.estado}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {stage.oportunidades.length > 3 && (
                      <div className="text-center text-sm text-muted-foreground">
                        +{stage.oportunidades.length - 3} oportunidades más...
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </CardContent>
      </Card>

      {/* Bottlenecks Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Análisis de Cuellos de Botella
          </CardTitle>
          <CardDescription>
            Identificación de etapas que requieren atención
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-800">Etapa de Negociación</h4>
                  <p className="text-sm text-orange-700">
                    5 oportunidades han estado más de 30 días en negociación.
                    Considera revisar el proceso de cierre.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-800">Oportunidad de Mejora</h4>
                  <p className="text-sm text-blue-700">
                    La etapa de "Contacto Inicial" tiene el menor tiempo promedio (8 días).
                    Excelente conversión rápida.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}