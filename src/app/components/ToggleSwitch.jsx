"use client";

/**
 * ToggleSwitch - Componente moderno de toggle switch con indicadores claros
 *
 * @param {boolean} checked - Estado del toggle
 * @param {function} onChange - Función que se ejecuta al cambiar el estado
 * @param {string} label - Texto que describe el toggle
 * @param {string} description - Descripción adicional/leyenda
 * @param {boolean} isPremium - Indica si la función es premium
 * @param {string} id - ID único para el input
 */
const ToggleSwitch = ({ checked, onChange, label, description, isPremium = false, id }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 dark:bg-meta-4 rounded-lg border border-gray-200 dark:border-strokedark">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <label
            htmlFor={id}
            className="text-base font-semibold text-gray-900 dark:text-white cursor-pointer"
          >
            {label}
          </label>
          {isPremium && (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#191654] to-[#252075] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              PREMIUM
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium transition-colors ${!checked ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
            No
          </span>
          <button
            type="button"
            role="switch"
            id={id}
            aria-checked={checked}
            onClick={onChange}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#191654] focus:ring-offset-2 ${
              checked
                ? 'bg-[#191654] dark:bg-primary'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                checked ? 'translate-x-8' : 'translate-x-1'
              }`}
            >
              <span className="flex items-center justify-center h-full">
                {checked ? (
                  <svg className="w-3 h-3 text-[#191654]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
            </span>
          </button>
          <span className={`text-sm font-medium transition-colors ${checked ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
            Sí
          </span>
        </div>
      </div>
    </div>
  );
};

export default ToggleSwitch;
