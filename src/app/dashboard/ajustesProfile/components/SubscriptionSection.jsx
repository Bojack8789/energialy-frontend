"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import getLocalStorage from '@/app/Func/localStorage';
import UpgradePlanModal from '@/app/components/UpgradePlanModal';

/**
 * SubscriptionSection - Muestra información detallada del plan de suscripción
 * de la empresa del usuario, con opción de upgrade/contacto
 */
const SubscriptionSection = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('SubscriptionSection - useEffect ejecutado');
    const userData = getLocalStorage();
    console.log('SubscriptionSection - userData:', userData);
    setUser(userData);

    if (!userData?.company?.id) {
      console.log('SubscriptionSection - No hay companyId');
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/companySubscriptions/active/${userData.company.id}`;
        console.log('SubscriptionSection - Fetching from:', url);

        const response = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        console.log('SubscriptionSection - Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('SubscriptionSection - Data received:', data);
          setSubscription(data);
        } else {
          console.log('SubscriptionSection - Response not OK:', await response.text());
        }
      } catch (error) {
        console.error('SubscriptionSection - Error fetching subscription:', error);
      } finally {
        console.log('SubscriptionSection - Setting loading to false');
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mi Plan de Suscripción</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-4">
          <p className="text-yellow-800">
            No se encontró un plan activo para tu empresa. Por favor contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  const plan = subscription.Subscription;

  // Colores según el tipo de plan
  const getPlanColor = (planCode) => {
    switch (planCode) {
      case 'free':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-700'
        };
      case 'base':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-700'
        };
      case 'plus':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-300',
          text: 'text-purple-700',
          badge: 'bg-purple-100 text-purple-700'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-700'
        };
    }
  };

  const colors = getPlanColor(plan.code);

  const isOwner = user?.role === 'company_owner';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mi Plan de Suscripción</h2>
        <p className="text-gray-600">
          Información sobre el plan actual de tu empresa y sus beneficios
        </p>
      </div>

      {/* Plan Card */}
      <div className={`${colors.bg} border-2 ${colors.border} rounded-xl p-6 mb-6`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`${colors.badge} px-4 py-1.5 rounded-full text-sm font-bold inline-block mb-3`}>
              {plan.name}
            </span>
            <h3 className="text-3xl font-bold text-gray-800">
              ${plan.price}
              <span className="text-base font-normal text-gray-600">/{plan.duration} días</span>
            </h3>
          </div>
          {plan.code === 'free' && (
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )}
        </div>

        <p className="text-gray-700 mb-6">{plan.description}</p>

        {/* Plan Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold text-gray-700">Licitaciones</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {plan.maxTenders === null ? '∞' : plan.maxTenders}
            </p>
            <p className="text-xs text-gray-600">Activas simultáneas</p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-gray-700">Propuestas</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {plan.maxProposals === null ? '∞' : plan.maxProposals}
            </p>
            <p className="text-xs text-gray-600">Activas simultáneas</p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-700 mb-3">Características incluidas:</h4>
          <ul className="space-y-2">
            {plan.hasDocumentManagement && (
              <li className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Gestión de documentos</span>
              </li>
            )}
            {plan.hasAdvancedReporting && (
              <li className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Reportes avanzados</span>
              </li>
            )}
            {plan.hasPrioritySupport && (
              <li className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Soporte prioritario</span>
              </li>
            )}
            {plan.canCreatePrivate && (
              <li className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Licitaciones privadas</span>
              </li>
            )}
            {plan.canHideBudget && (
              <li className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Ocultar presupuesto en licitaciones</span>
              </li>
            )}
            {plan.featuredInDirectory && (
              <li className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Destacado en directorio de empresas</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Estado de la Suscripción</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Estado</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
              subscription.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {subscription.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fecha de inicio</p>
            <p className="font-semibold text-gray-800 mt-1">
              {new Date(subscription.startDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons - Solo para owner */}
      {isOwner && plan.code !== 'plus' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 mb-2">¿Necesitás más capacidad?</h4>
              <p className="text-gray-700 mb-4">
                Mejorá tu plan para acceder a más licitaciones, propuestas y características exclusivas.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Solicitar Upgrade
          </button>
        </div>
      )}

      {/* Info para collaborators */}
      {!isOwner && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Nota:</strong> Solo el propietario de la empresa ({user?.company?.name}) puede solicitar cambios en el plan de suscripción.
          </p>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentPlanCode={plan?.code}
      />
    </div>
  );
};

export default SubscriptionSection;
