"use client";

import { useState } from 'react';
import UpgradePlanModal from './UpgradePlanModal';

/**
 * LimitExceededModal - Modal que se muestra cuando el usuario alcanza un límite de su plan
 * Muestra información del límite alcanzado y opción para ver planes de upgrade
 */
const LimitExceededModal = ({ isOpen, onClose, limitInfo }) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (!isOpen || !limitInfo) return null;

  const {
    message,
    detail,
    feature,
    planName,
    currentCount,
    limit,
    limitExceeded,
    featureNotAvailable
  } = limitInfo;

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-60 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white dark:bg-boxdark rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-strokedark">
            {/* Header */}
            <div className="bg-[#191654] dark:bg-[#141240] text-white px-6 py-5 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">
                      {limitExceeded ? 'Límite Alcanzado' : 'Función Premium'}
                    </h2>
                    <p className="text-sm text-white/80 mt-0.5">Mejora tu plan para continuar</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Plan Badge */}
              <div className="mb-5">
                <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-meta-4 text-gray-700 dark:text-white px-4 py-2 rounded-lg text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Tu Plan: <span className="font-semibold">{planName}</span>
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {message}
                </p>
                {detail && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {detail}
                  </p>
                )}
              </div>

              {/* Limit Details */}
              {limitExceeded && currentCount !== undefined && limit !== undefined && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-5 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Uso actual</p>
                      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{currentCount}</p>
                    </div>
                    <div className="text-gray-300 dark:text-gray-600 text-4xl font-light">/</div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Límite del plan</p>
                      <p className="text-3xl font-bold text-gray-800 dark:text-white">{limit}</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-white dark:bg-boxdark-2 rounded-md p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Has alcanzado el límite de tu plan actual
                    </div>
                  </div>
                </div>
              )}

              {/* Feature Info */}
              {featureNotAvailable && feature && (
                <div className="bg-gray-50 dark:bg-meta-4 border border-gray-200 dark:border-strokedark rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#191654] dark:text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">Función Premium</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-meta-4 dark:to-boxdark-2 border border-gray-200 dark:border-strokedark rounded-lg p-5 mb-4">
                <div className="flex items-start gap-3 mb-4">
                  <svg className="w-5 h-5 text-[#191654] dark:text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    <strong className="text-gray-900 dark:text-white">¡Desbloquea todo el potencial!</strong><br/>
                    Mejora tu plan y accede a funciones exclusivas, mayor capacidad y herramientas avanzadas.
                  </p>
                </div>
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-[#191654] hover:bg-[#252075] active:bg-[#141240] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Ver Planes Premium
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full bg-gray-100 dark:bg-meta-4 text-gray-700 dark:text-white font-medium py-2.5 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-meta-4/80 transition-colors"
              >
                Continuar con Plan Actual
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlanCode={planName?.toLowerCase()}
      />
    </>
  );
};

export default LimitExceededModal;
