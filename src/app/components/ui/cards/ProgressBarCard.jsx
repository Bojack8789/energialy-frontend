"use client";

import React from 'react';

/**
 * ProgressBarCard - Componente para mostrar una tarjeta con barra de progreso
 * Inspirado en el diseño de referencia del usuario
 *
 * @param {string} title - Título de la tarjeta
 * @param {string} subtitle - Subtítulo o descripción adicional
 * @param {number} current - Valor actual
 * @param {number} max - Valor máximo (null para ilimitado)
 * @param {string} label - Texto que se muestra al lado del progreso
 * @param {string} variant - Estilo de la barra: 'success', 'warning', 'danger', 'info'
 * @param {boolean} loading - Estado de carga
 * @param {React.ReactNode} icon - Icono opcional
 * @param {string} badgeText - Texto para el badge (ej: "Activo", "Vencido")
 * @param {string} badgeVariant - Estilo del badge: 'success', 'warning', 'danger', 'info'
 * @param {React.ReactNode} customButton - Botón personalizado para planes ilimitados (reemplaza el mensaje "Ilimitado")
 */
const ProgressBarCard = ({
  title,
  subtitle,
  current = 0,
  max = null,
  label,
  variant = 'info',
  loading = false,
  icon,
  badgeText,
  badgeVariant = 'success',
  customButton = null
}) => {
  // Calcular porcentaje de progreso
  const percentage = max ? Math.min((current / max) * 100, 100) : 0;
  const isUnlimited = max === null || max === 0;

  // Colores según variante
  const variantColors = {
    success: {
      bg: 'bg-success',
      text: 'text-success',
      bar: 'bg-success',
      light: 'bg-success/10'
    },
    warning: {
      bg: 'bg-warning',
      text: 'text-warning',
      bar: 'bg-warning',
      light: 'bg-warning/10'
    },
    danger: {
      bg: 'bg-danger',
      text: 'text-danger',
      bar: 'bg-danger',
      light: 'bg-danger/10'
    },
    info: {
      bg: 'bg-primary',
      text: 'text-primary',
      bar: 'bg-primary',
      light: 'bg-primary/10'
    }
  };

  const colors = variantColors[variant] || variantColors.info;

  // Determinar color automático según porcentaje si no se especificó variante
  const getAutoVariant = () => {
    if (isUnlimited) return 'info';
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  const autoVariant = variant === 'info' && !isUnlimited ? getAutoVariant() : variant;
  const autoColors = variantColors[autoVariant];

  // Badge colors
  const badgeColors = {
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-primary/10 text-primary'
  };

  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white p-3 sm:p-4 lg:p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header con título y badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={`flex h-8 w-8 lg:h-11 lg:w-11 flex-shrink-0 items-center justify-center rounded-full ${autoColors.light}`}>
              <div className={`${autoColors.text} scale-75 lg:scale-100`}>
                {icon}
              </div>
            </div>
          )}
          <div className="min-w-0">
            <h4 className="text-sm lg:text-lg font-semibold text-black dark:text-white leading-tight">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs lg:text-sm text-body dark:text-bodydark truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {badgeText && (
          <span className={`inline-flex rounded-full px-2 py-0.5 lg:px-3 lg:py-1 text-xs font-medium flex-shrink-0 ml-1 ${badgeColors[badgeVariant]}`}>
            {badgeText}
          </span>
        )}
      </div>

      {/* Valores y barra de progreso */}
      <div className="space-y-2">
        {/* Números */}
        <div className="flex items-baseline justify-between gap-1 flex-wrap">
          <div className="flex items-baseline gap-1">
            <span className={`text-xl lg:text-2xl font-bold ${autoColors.text}`}>
              {current}
            </span>
            {!isUnlimited && (
              <span className="text-xs text-body dark:text-bodydark">
                / {max}
              </span>
            )}
          </div>

          {label && (
            <span className="text-xs font-medium text-body dark:text-bodydark leading-tight">
              {label}
            </span>
          )}
        </div>

        {/* Barra de progreso */}
        {!isUnlimited && (
          <div className="w-full">
            <div className="h-2 w-full rounded-full bg-stroke dark:bg-strokedark">
              <div
                className={`h-2 rounded-full ${autoColors.bar} transition-all duration-500 ease-out`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            {/* Texto adicional debajo de la barra */}
            <div className="mt-2 flex justify-between text-xs text-body dark:text-bodydark">
              <span>{current} usados</span>
              <span>{max - current} disponibles</span>
            </div>
          </div>
        )}

        {/* Mensaje para ilimitado o botón personalizado */}
        {isUnlimited && (
          customButton ? (
            <div className="mt-2">
              {customButton}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-success">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Ilimitado</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProgressBarCard;
