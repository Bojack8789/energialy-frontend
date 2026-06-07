"use client";

import React, { useMemo, useState } from 'react';
import { useGetCompanyMetricsQuery } from '@/app/redux/services/metricsApi';
import ProgressBarCard from '@/app/components/ui/cards/ProgressBarCard';

/**
 * SubscriptionWidgets - Sección de widgets que muestran información de suscripción
 * Incluye: Plan actual, Licitaciones y Propuestas con barras de progreso
 */
const SubscriptionWidgets = ({ companyId, selectedPeriod = 30 }) => {
  // Estado para el modal de planes
  const [showPlansModal, setShowPlansModal] = useState(false);

  // Obtener datos de métricas
  const { data: metricsData, isLoading } = useGetCompanyMetricsQuery(
    { companyId, days: selectedPeriod },
    { skip: !companyId }
  );

  // Extraer datos del plan
  const planData = useMemo(() => {
    if (!metricsData?.plan) return null;

    const { name, daysRemaining, endDate } = metricsData.plan;
    const planName = name || 'GRATIS';
    const isFreePlan = planName.toUpperCase() === 'GRATIS';

    // Si es plan GRATIS, marcar como ilimitado
    if (isFreePlan) {
      return {
        name: planName,
        daysRemaining: null,
        daysPassed: 0,
        totalDays: 30,
        endDate: null,
        isActive: true,
        isUnlimited: true
      };
    }

    // Para planes pagados (BASE, PLUS, PREMIUM): cuenta regresiva de 30 días
    const totalDays = 30;
    const daysPassed = Math.max(0, totalDays - (daysRemaining || 0));
    const actualDaysRemaining = Math.max(0, Math.min(daysRemaining || 0, 30));

    return {
      name: planName,
      daysRemaining: actualDaysRemaining,
      daysPassed,
      totalDays,
      endDate,
      isActive: actualDaysRemaining > 0,
      isUnlimited: false
    };
  }, [metricsData]);

  // Extraer datos de licitaciones
  const tendersData = useMemo(() => {
    if (!metricsData?.tenders) return null;

    const { inPeriod, total, max } = metricsData.tenders;

    return {
      current: total || 0,
      max: max || null,
      inPeriod: inPeriod || 0,
      isUnlimited: !max || max === null
    };
  }, [metricsData]);

  // Extraer datos de propuestas
  const proposalsData = useMemo(() => {
    if (!metricsData?.proposals) return null;

    const { inPeriod, total, max } = metricsData.proposals;

    return {
      current: total || 0,
      max: max || 3, // Por defecto plan gratis tiene límite de 3
      inPeriod: inPeriod || 0,
      isUnlimited: !max || max === null || max === 0
    };
  }, [metricsData]);

  // Determinar variante del plan según días restantes
  const getPlanVariant = () => {
    if (!planData || !planData.isActive) return 'danger';
    if (planData.daysRemaining <= 7) return 'danger';
    if (planData.daysRemaining <= 15) return 'warning';
    return 'success';
  };

  // Iconos
  const planIcon = (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );

  const tenderIcon = (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const proposalIcon = (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
    </svg>
  );

  // Botón de upgrade para plan GRATIS
  const upgradeButton = planData?.isUnlimited ? (
    <button
      onClick={() => setShowPlansModal(true)}
      className="w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#191654] to-secondary-600 rounded-lg hover:from-[#252075] hover:to-secondary-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
      Accede a los beneficios premium y despega tus estadísticas
    </button>
  ) : null;

  return (
    <div className="mb-6 mt-2">
      <h3 className="mb-4 text-lg sm:text-xl font-semibold text-black dark:text-white">
        Tu Suscripción
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Widget del Plan */}
        <ProgressBarCard
          title="Plan Actual"
          subtitle={planData?.name || 'GRATIS'}
          current={planData?.isUnlimited ? 0 : (planData?.daysPassed || 0)}
          max={planData?.isUnlimited ? null : (planData?.totalDays || 30)}
          label={planData?.isUnlimited ? null : (planData?.daysRemaining ? `${planData.daysRemaining} días restantes` : 'Plan vencido')}
          variant={planData?.isUnlimited ? 'success' : getPlanVariant()}
          loading={isLoading}
          icon={planIcon}
          badgeText={planData?.isActive ? 'Activo' : 'Vencido'}
          badgeVariant={planData?.isActive ? 'success' : 'danger'}
          customButton={upgradeButton}
        />

        {/* Widget de Licitaciones */}
        <ProgressBarCard
          title="Licitaciones Activas"
          subtitle={tendersData?.isUnlimited ? 'Ilimitadas' : `Límite: ${tendersData?.max || 0}`}
          current={tendersData?.current || 0}
          max={tendersData?.max}
          label={`${tendersData?.inPeriod || 0} en últimos ${selectedPeriod} días`}
          variant="info"
          loading={isLoading}
          icon={tenderIcon}
        />

        {/* Widget de Propuestas */}
        <ProgressBarCard
          title="Propuestas Activas"
          subtitle={proposalsData?.isUnlimited ? 'Ilimitadas' : `Límite: ${proposalsData?.max || 3}`}
          current={proposalsData?.current || 0}
          max={proposalsData?.max}
          label={`${proposalsData?.inPeriod || 0} en últimos ${selectedPeriod} días`}
          variant="info"
          loading={isLoading}
          icon={proposalIcon}
        />
      </div>

      {/* Modal de Planes */}
      {showPlansModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowPlansModal(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header del Modal */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Planes de Suscripción</h2>
              <button
                onClick={() => setShowPlansModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del Modal - Planes */}
            <div className="p-6">
              <p className="text-gray-600 text-center mb-8">
                {planData ? `Plan actual: ${planData.name}` : 'Selecciona un plan para tu empresa'}
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Plan GRATIS */}
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">GRATIS</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">$0</div>
                    <p className="text-gray-500 text-sm mb-6">Por mes</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Licitaciones públicas ilimitadas</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Invitaciones para licitar ilimitadas</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Hasta 3 propuestas activas</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-500">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Sin licitaciones privadas</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-500">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>No puede ocultar presupuesto</span>
                    </li>
                  </ul>
                  {planData?.name?.toUpperCase() === 'GRATIS' && (
                    <div className="bg-gray-100 text-gray-700 text-center py-2 rounded-lg font-semibold">
                      Plan Actual
                    </div>
                  )}
                </div>

                {/* Plan BASE */}
                <div className="border-2 border-blue-400 rounded-lg p-6 hover:border-blue-500 transition-colors relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">Popular</span>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-blue-600 mb-2">BASE</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">$49</div>
                    <p className="text-gray-500 text-sm mb-6">Por mes</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Licitaciones ilimitadas</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Licitaciones privadas</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Invitaciones ilimitadas</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Hasta 30 propuestas activas</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Ocultar presupuesto</span>
                    </li>
                  </ul>
                  {planData?.name?.toUpperCase() === 'BASE' ? (
                    <div className="bg-blue-100 text-blue-700 text-center py-2 rounded-lg font-semibold">
                      Plan Actual
                    </div>
                  ) : (
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors">
                      Próximamente
                    </button>
                  )}
                </div>

                {/* Plan PLUS */}
                <div className="border-2 border-purple-400 rounded-lg p-6 hover:border-purple-500 transition-colors">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-purple-600 mb-2">PLUS</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">$69</div>
                    <p className="text-gray-500 text-sm mb-6">Por mes</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <span className="font-semibold">Destacado en directorio</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Licitaciones ilimitadas</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Licitaciones privadas</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Propuestas activas ilimitadas</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Ocultar presupuesto</span>
                    </li>
                  </ul>
                  {planData?.name?.toUpperCase() === 'PLUS' ? (
                    <div className="bg-purple-100 text-purple-700 text-center py-2 rounded-lg font-semibold">
                      Plan Actual
                    </div>
                  ) : (
                    <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition-colors">
                      Próximamente
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionWidgets;
