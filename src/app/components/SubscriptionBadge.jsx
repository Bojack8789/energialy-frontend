"use client";

import { useState, useEffect } from 'react';

/**
 * SubscriptionBadge - Muestra el plan actual de la empresa del usuario
 * Se muestra en el navbar para usuarios company_owner y company_collaborator
 */
const SubscriptionBadge = ({ companyId }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleSubscribe = async (planCode) => {
    setLoadingPlan(planCode);
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planCode, companyId }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || 'Error al generar el link de pago');
      }
    } catch {
      alert('Error al conectar con el servidor de pagos');
    } finally {
      setLoadingPlan(null);
    }
  };

  useEffect(() => {
    console.log('SubscriptionBadge - companyId:', companyId);
    if (!companyId) {
      console.log('SubscriptionBadge - No companyId provided');
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/companySubscriptions/active/${companyId}`;
        console.log('SubscriptionBadge - Fetching from:', url);

        const response = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        console.log('SubscriptionBadge - Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('SubscriptionBadge - Data received:', data);
          setSubscription(data);
          setTokenExpired(false);
        } else if (response.status === 401 || response.status === 403) {
          console.log('SubscriptionBadge - Token expired or unauthorized');
          setTokenExpired(true);
        } else {
          console.log('SubscriptionBadge - Response not OK:', await response.text());
        }
      } catch (error) {
        console.error('SubscriptionBadge - Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [companyId]);

  if (loading) {
    return (
      <div className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-200 animate-pulse">
        Cargando...
      </div>
    );
  }

  if (tokenExpired) {
    return (
      <div
        onClick={() => {
          sessionStorage.clear();
          localStorage.clear();
          window.location.href = '/login';
        }}
        className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300 cursor-pointer hover:bg-red-200 transition-colors flex items-center gap-1.5"
        title="Tu sesión ha expirado - Click para iniciar sesión"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Sesión expirada - Vuelve a iniciar sesión</span>
      </div>
    );
  }

  // Si no hay suscripción (error de red, empresa sin plan en DB), mostrar GRATIS como fallback
  const plan = subscription?.Subscription ?? {
    code: 'free',
    name: 'GRATIS'
  };

  // Colores según el tipo de plan
  const getBadgeColor = (planCode) => {
    switch (planCode) {
      case 'free':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'base':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'plus':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className={`
          ${getBadgeColor(plan.code)}
          px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border
          cursor-pointer hover:opacity-80 transition-opacity
          flex items-center gap-1 sm:gap-1.5 whitespace-nowrap
        `}
        title={`Plan ${plan.name} - Click para ver planes`}
      >
        <svg
          className="w-3 h-3 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
        <span className="truncate">{plan.name}</span>
      </div>

      {/* Modal de Planes */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header del Modal */}
            <div className="sticky top-0 bg-white border-b px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Planes de Suscripción</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del Modal - Planes */}
            <div className="p-3 sm:p-6">
              <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-8">
                {subscription ? `Plan actual: ${plan.name}` : 'Selecciona un plan para tu empresa'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Plan GRATIS */}
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">GRATIS</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">USD 0</div>
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
                  {subscription && plan.code === 'free' && (
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
                    <div className="text-3xl font-bold text-gray-900 mb-1">USD 49</div>
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
                  {subscription && plan.code === 'base' ? (
                    <div className="bg-blue-100 text-blue-700 text-center py-2 rounded-lg font-semibold">
                      Plan Actual
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe('base')}
                      disabled={loadingPlan === 'base'}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white py-2 rounded-lg font-semibold transition-colors"
                    >
                      {loadingPlan === 'base' ? 'Redirigiendo...' : 'Elegir plan'}
                    </button>
                  )}
                </div>

                {/* Plan PLUS */}
                <div className="border-2 border-purple-400 rounded-lg p-6 hover:border-purple-500 transition-colors">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-purple-600 mb-2">PLUS</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">USD 69</div>
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
                  {subscription && plan.code === 'plus' ? (
                    <div className="bg-purple-100 text-purple-700 text-center py-2 rounded-lg font-semibold">
                      Plan Actual
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe('plus')}
                      disabled={loadingPlan === 'plus'}
                      className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-60 text-white py-2 rounded-lg font-semibold transition-colors"
                    >
                      {loadingPlan === 'plus' ? 'Redirigiendo...' : 'Elegir plan'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubscriptionBadge;
