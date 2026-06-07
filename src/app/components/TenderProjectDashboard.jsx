'use client'
import { useState, useEffect } from 'react'
import Chat from './Chat'

/**
 * Dashboard para proyectos de licitación aprobados
 * @param {Object} tender - Información de la licitación
 * @param {Object} selectedProposal - Propuesta seleccionada/aceptada
 */
const TenderProjectDashboard = ({ tender, selectedProposal }) => {
  const [projectEndDate, setProjectEndDate] = useState(null)
  const [daysRemaining, setDaysRemaining] = useState(0)

  // Debug logs
  useEffect(() => {
    console.log('📊 Dashboard - selectedProposal:', selectedProposal);
    console.log('📊 Dashboard - Company:', selectedProposal?.Company);
    console.log('📊 Dashboard - serviceFee:', selectedProposal?.serviceFee);
    console.log('📊 Dashboard - serviceAmount:', selectedProposal?.serviceAmount);
    console.log('📊 Dashboard - receiverAmount:', selectedProposal?.receiverAmount);
  }, [selectedProposal]);

  useEffect(() => {
    if (selectedProposal?.projectDuration && selectedProposal?.createdAt) {
      // Por ahora usar 90 días como valor por defecto para "De 1 a 3 meses"
      // En el futuro, esto debería venir de la base de datos en días
      const durationInDays = 90; // 3 meses aprox

      // Calcular fecha final del proyecto
      const startDate = new Date(selectedProposal.createdAt)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + durationInDays)
      setProjectEndDate(endDate)

      // Calcular días restantes
      const today = new Date()
      const diffTime = endDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysRemaining(diffDays > 0 ? diffDays : 0)
    }
  }, [selectedProposal])

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Calcular porcentaje de progreso basado en 90 días
  const totalDays = 90;
  const progressPercentage = daysRemaining > 0
    ? Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100)
    : 100

  return (
    <div className="w-full space-y-6">
      {/* Header con estado del proyecto */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Proyecto en Curso</h2>
            <p className="text-green-100 text-lg">Licitación aprobada y en ejecución</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{daysRemaining}</div>
            <div className="text-green-100">días restantes</div>
          </div>
        </div>
      </div>

      {/* Grid principal con información del proyecto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de la empresa seleccionada */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🏢</span> Empresa Contratada
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Nombre</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedProposal?.Company?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monto del Contrato</p>
              <p className="text-2xl font-bold text-green-600">
                ${selectedProposal?.totalAmount?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fee Energialy</p>
              <p className="text-md font-semibold text-gray-700">
                {selectedProposal?.serviceFee}% (${selectedProposal?.serviceAmount?.toLocaleString()})
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">A Recibir</p>
              <p className="text-xl font-bold text-blue-600">
                ${selectedProposal?.receiverAmount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Fechas del proyecto */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📅</span> Cronograma
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Fecha de Inicio</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(new Date(selectedProposal?.createdAt))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de Finalización</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(projectEndDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duración Total</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedProposal?.projectDuration || 'N/A'}
              </p>
            </div>
            {/* Barra de progreso */}
            <div className="pt-2">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progreso</span>
                <span>{progressPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles de la licitación */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📋</span> Detalles de la Licitación
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Título</p>
              <p className="text-md font-semibold text-gray-900">{tender?.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ubicación</p>
              <p className="text-md text-gray-700">{tender?.location?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Presupuesto Original</p>
              <p className="text-lg font-semibold text-gray-900">
                ${tender?.budget?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Categorías</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {tender?.subcategories?.map((sub, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {sub.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción del proyecto */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <span className="mr-2">📝</span> Descripción del Proyecto
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {selectedProposal?.description || 'No hay descripción disponible'}
        </p>
      </div>

      {/* Chat con la empresa contratada */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">💬</span> Comunicación con la Empresa
        </h3>
        <div className="h-[500px]">
          <Chat company={selectedProposal?.Company} />
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {tender?.proposals?.length || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Propuestas Recibidas</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">1</div>
          <div className="text-sm text-gray-600 mt-1">Propuesta Seleccionada</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {daysRemaining}
          </div>
          <div className="text-sm text-gray-600 mt-1">Días Restantes</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {progressPercentage.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600 mt-1">Progreso Estimado</div>
        </div>
      </div>
    </div>
  )
}

export default TenderProjectDashboard
