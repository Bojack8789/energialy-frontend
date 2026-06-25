"use client";

import { useState, useEffect } from 'react';

/**
 * UpgradePlanModal - Modal para mostrar opciones de upgrade de plan
 * Muestra todos los planes disponibles con sus características y precios
 */
const UpgradePlanModal = ({ isOpen, onClose, currentPlanCode }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subscriptions?activeOnly=true`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Ordenar: free, base, plus
        const sortedPlans = data.sort((a, b) => {
          const order = { free: 0, base: 1, plus: 2 };
          return order[a.code] - order[b.code];
        });
        setPlans(sortedPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (planCode) => {
    switch (planCode) {
      case 'free':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-700',
          button: 'bg-primary-500 hover:bg-primary-400',
          gradient: 'from-gray-100 to-gray-50'
        };
      case 'base':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-400',
          text: 'text-blue-700',
          badge: 'bg-blue-500 text-white',
          button: 'bg-blue-600 hover:bg-blue-700',
          gradient: 'from-blue-100 to-blue-50'
        };
      case 'plus':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-400',
          text: 'text-purple-700',
          badge: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
          button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
          gradient: 'from-purple-100 to-purple-50'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-700',
          button: 'bg-primary-500 hover:bg-primary-400',
          gradient: 'from-gray-100 to-gray-50'
        };
    }
  };

  const handleContactSales = (planName) => {
    // Aquí puedes redirigir a un formulario de contacto o abrir un chat
    window.location.href = `mailto:ventas@energialy.com?subject=Solicitud de upgrade a plan ${planName}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#191654] to-secondary-600 text-white px-8 py-6 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Elige el plan perfecto para tu empresa</h2>
                <p className="text-blue-100">Desbloquea más funcionalidades y haz crecer tu negocio</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => {
                  const colors = getPlanColor(plan.code);
                  const isCurrentPlan = plan.code === currentPlanCode;
                  const isRecommended = plan.code === 'base';

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden transition-all duration-300 hover:shadow-lg ${
                        isCurrentPlan ? 'ring-4 ring-secondary-400' : ''
                      }`}
                    >
                      {/* Current Plan Badge */}
                      {isCurrentPlan && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 text-xs font-bold rounded-full shadow-md z-10">
                          TU PLAN ACTUAL
                        </div>
                      )}

                      <div className="p-6 flex flex-col md:flex-row gap-6">
                        {/* Left: Plan Info */}
                        <div className="md:w-1/3">
                          {/* Plan Name */}
                          <div className={`${colors.badge} inline-block px-4 py-2 rounded-lg text-sm font-bold mb-3`}>
                            {plan.name}
                          </div>
                          {isRecommended && (
                            <div className="bg-secondary-600 text-white inline-block px-3 py-1 text-xs font-bold rounded-full ml-2">
                              RECOMENDADO
                            </div>
                          )}

                          {/* Price */}
                          <div className="mb-4 mt-3">
                            <span className="text-4xl font-bold text-gray-800">
                              ${plan.price}
                            </span>
                            <span className="text-gray-600 text-sm block mt-1">
                              por {plan.duration} días
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-gray-700 text-sm">
                            {plan.description}
                          </p>
                        </div>

                        {/* Middle: Features */}
                        <div className="md:w-1/2 space-y-3">
                          <h4 className="font-semibold text-gray-800 mb-3">Características incluidas:</h4>

                          {/* Limits */}
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-gray-700">
                              <strong>{plan.maxTenders === null ? 'Ilimitadas' : plan.maxTenders}</strong> licitaciones activas
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700">
                              <strong>{plan.maxProposals === null ? 'Ilimitadas' : plan.maxProposals}</strong> propuestas activas
                            </span>
                          </div>

                          {plan.canCreatePrivate && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Licitaciones privadas</span>
                            </div>
                          )}

                          {plan.canHideBudget && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Ocultar presupuesto</span>
                            </div>
                          )}

                          {plan.featuredInDirectory && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Destacado en directorio de empresas</span>
                            </div>
                          )}
                        </div>

                        {/* Right: Action Button */}
                        <div className="md:w-1/6 flex items-center">
                          {isCurrentPlan ? (
                            <button
                              disabled
                              className="w-full bg-gray-200 text-gray-500 font-semibold py-3 px-4 rounded-lg cursor-not-allowed"
                            >
                              Plan Actual
                            </button>
                          ) : (
                            <button
                              onClick={() => handleContactSales(plan.name)}
                              className={`w-full ${colors.button} text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl`}
                            >
                              {plan.code === 'free' ? 'Contratar' : 'Upgrade'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Info */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">¿Necesitas ayuda para elegir?</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Nuestro equipo está listo para ayudarte a encontrar el plan perfecto para tu empresa.
                  </p>
                  <p className="text-sm text-gray-600">
                    Contacto: <a href="mailto:ventas@energialy.com" className="text-blue-600 hover:underline font-medium">ventas@energialy.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlanModal;
