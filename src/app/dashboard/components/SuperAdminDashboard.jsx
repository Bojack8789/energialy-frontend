"use client";
import { useState } from "react";
import { useGetAdminMetricsQuery } from "@/app/redux/services/metricsApi";
import Chat from "@/app/components/Chat";

function SuperAdminDashboard({ user }) {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const { data: metricsData, isLoading: loadingMetrics } = useGetAdminMetricsQuery(selectedPeriod);

  if (loadingMetrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando métricas del sistema...</p>
        </div>
      </div>
    );
  }

  const companies = metricsData?.companies || {};
  const users = metricsData?.users || {};
  const tenders = metricsData?.tenders || {};
  const proposals = metricsData?.proposals || {};
  const subscriptions = metricsData?.subscriptions || {};
  const topCompanies = metricsData?.topCompanies || [];

  return (
    <div className="mx-auto w-full h-screen flex flex-col gap-4 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      {/* Header en una sola línea */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow p-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Panel Super Admin</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod(7)}
            className={`px-3 py-1 text-sm rounded ${selectedPeriod === 7 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            7 días
          </button>
          <button
            onClick={() => setSelectedPeriod(30)}
            className={`px-3 py-1 text-sm rounded ${selectedPeriod === 30 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            30 días
          </button>
          <button
            onClick={() => setSelectedPeriod(90)}
            className={`px-3 py-1 text-sm rounded ${selectedPeriod === 90 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            90 días
          </button>
        </div>
      </div>

      {/* KPIs Grid - 5 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Empresas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Empresas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{companies.total || 0}</p>
              <p className="text-xs text-green-600 mt-1">+{companies.new || 0} nuevas</p>
            </div>
          </div>
        </div>

        {/* Total Licitaciones */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Licitaciones</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{tenders.total || 0}</p>
              <p className="text-xs text-blue-600 mt-1">{tenders.active || 0} activas</p>
            </div>
          </div>
        </div>

        {/* Total Propuestas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Propuestas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{proposals.total || 0}</p>
              <p className="text-xs text-orange-600 mt-1">{proposals.conversionRate || 0}% conversión</p>
            </div>
          </div>
        </div>

        {/* Total Usuarios */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{users.total || 0}</p>
              <p className="text-xs text-purple-600 mt-1">+{users.new || 0} nuevos</p>
            </div>
          </div>
        </div>

        {/* Tasa de Conversión */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Tasa Conversión</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{proposals.conversionRate || 0}%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{proposals.accepted || 0}/{proposals.sent || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2 columnas: Estados + Suscripciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Estados de Licitaciones */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Estados de Licitaciones</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Activas</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">{tenders.active || 0}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Cerrando Pronto</span>
              <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{tenders.closingSoon || 0}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Cerradas</span>
              <span className="text-lg font-bold text-gray-600 dark:text-gray-400">{tenders.closed || 0}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Sin Propuestas</span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">{tenders.withoutProposals || 0}</span>
            </div>
          </div>
        </div>

        {/* Distribución de Suscripciones */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Suscripciones Activas</h3>
          <div className="space-y-2">
            {subscriptions.distribution?.map((sub, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{sub['Subscription.name']}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">€{sub['Subscription.price']}/mes</span>
                </div>
                <span className="text-lg font-bold text-primary">{sub.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 Empresas Más Activas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Top 10 Empresas Más Activas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">#</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Empresa</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Licitaciones</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Propuestas</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topCompanies.length > 0 ? (
                topCompanies.map((company, index) => (
                  <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{index + 1}</td>
                    <td className="px-3 py-2 text-gray-900 dark:text-white font-medium">{company.name}</td>
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{company.tenders}</td>
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{company.proposals}</td>
                    <td className="px-3 py-2 text-center font-bold text-primary">{company.total}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                    No hay datos de empresas activas en este período
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chat Component */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4" style={{ height: '400px' }}>
        <Chat user={user} />
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
