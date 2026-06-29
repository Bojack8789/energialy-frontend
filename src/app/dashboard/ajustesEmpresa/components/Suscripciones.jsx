"use client";

import React, { useState, useEffect } from "react";

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const Suscripciones = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      try {
        const companyId = sessionStorage.getItem("companyId");
        const token = sessionStorage.getItem("accessToken");
        if (!companyId || !token) { setLoading(false); return; }

        const res = await fetch(
          `${baseUrl}/companySubscriptions/company/${companyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error();
        const data = await res.json();

        const now = new Date();
        const active = data.find(
          (s) => s.isActive && s.status === "active" && new Date(s.endDate) >= now
        );

        if (active?.Subscription) {
          setCurrentPlan(active.Subscription.code);
          const days = Math.ceil((new Date(active.endDate) - now) / (1000 * 60 * 60 * 24));
          setDaysLeft(Math.max(0, days));
        } else {
          setCurrentPlan("free");
        }
      } catch {
        setCurrentPlan("free");
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentPlan();
  }, []);

  const handleSubscribe = async (planCode) => {
    try {
      setLoadingPlan(planCode);
      const token = sessionStorage.getItem("accessToken");
      const res = await fetch(`${baseUrl}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planCode }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch {
      alert("Error al procesar el pago. Intentá nuevamente.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const planName = currentPlan === "free" ? "GRATIS" : currentPlan === "base" ? "BASE" : currentPlan === "plus" ? "PLUS" : null;

  return (
    <div className="p-4 sm:p-6">
      {/* Plan actual */}
      {!loading && planName && (
        <div className="mb-6 flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <span className="text-sm text-gray-700">
            Tu suscripción actual:{" "}
            <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
              currentPlan === "free" ? "bg-gray-100 text-gray-700" :
              currentPlan === "base" ? "bg-blue-100 text-blue-700" :
              "bg-purple-100 text-purple-700"
            }`}>
              {planName}
            </span>
          </span>
          {daysLeft !== null && (
            <span className={`text-xs ${daysLeft <= 7 ? "text-red-600 font-semibold" : "text-gray-500"}`}>
              {daysLeft <= 7 ? `⚠ vence en ${daysLeft} días` : `${daysLeft} días restantes`}
            </span>
          )}
        </div>
      )}

      <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8">
        Planes de Suscripción
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
            <li className="flex items-start gap-2 text-sm text-gray-700"><CheckIcon /><span>Licitaciones públicas ilimitadas</span></li>
            <li className="flex items-start gap-2 text-sm text-gray-700"><CheckIcon /><span>Invitaciones para licitar ilimitadas</span></li>
            <li className="flex items-start gap-2 text-sm text-gray-700"><CheckIcon /><span>Hasta 3 propuestas activas</span></li>
            <li className="flex items-start gap-2 text-sm text-gray-500"><XIcon /><span>Sin licitaciones privadas</span></li>
            <li className="flex items-start gap-2 text-sm text-gray-500"><XIcon /><span>No puede ocultar presupuesto</span></li>
          </ul>
          {currentPlan === "free" && (
            <div className="bg-gray-100 text-gray-700 text-center py-2 rounded-lg font-semibold text-sm">
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
            <li className="flex items-start gap-2 text-sm text-gray-700"><CheckIcon /><span>Licitaciones ilimitadas</span></li>
            <li className="flex items-start gap-2 text-sm text-gray-700"><CheckIcon /><span>Licitaciones privadas</span></li>
            <li className="flex items-start gap-2 text-sm text-gray-700"><CheckIcon /><span>Invitaciones ilimitadas</span></li>
            <li className="flex items-start gap-2 text-sm text-gray-700"><CheckIcon /><span>Hasta 30 propuestas activas</span></li>
            <li className="flex items-start gap-2 text-sm text-gray-700"><CheckIcon /><span>Ocultar presupuesto</span></li>
          </ul>
          {currentPlan === "base" ? (
            <div className="bg-blue-100 text-blue-700 text-center py-2 rounded-lg font-semibold text-sm">
              Plan Actual
            </div>
          ) : (
            <button
              onClick={() => handleSubscribe("base")}
              disabled={loadingPlan === "base"}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              {loadingPlan === "base" ? "Redirigiendo..." : "Elegir plan"}
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
            <li className="flex items-start gap-2 text-sm text-gray-700"><StarIcon /><span className="font-semibold">Destacado en directorio</span></li>
            <li className="flex items-start gap-2 text-sm text-gray-700"><CheckIcon /><span>Licitaciones ilimitadas</span></li>
            <li className="flex items-start gap-2 text-sm text-gray-700"><CheckIcon /><span>Licitaciones privadas</span></li>
            <li className="flex items-start gap-2 text-sm text-gray-700"><CheckIcon /><span>Propuestas activas ilimitadas</span></li>
            <li className="flex items-start gap-2 text-sm text-gray-700"><CheckIcon /><span>Ocultar presupuesto</span></li>
          </ul>
          {currentPlan === "plus" ? (
            <div className="bg-purple-100 text-purple-700 text-center py-2 rounded-lg font-semibold text-sm">
              Plan Actual
            </div>
          ) : (
            <button
              onClick={() => handleSubscribe("plus")}
              disabled={loadingPlan === "plus"}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-60 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              {loadingPlan === "plus" ? "Redirigiendo..." : "Elegir plan"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Suscripciones;
