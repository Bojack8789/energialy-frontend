"use client";

// Suscripciones.jsx — VERSIÓN FINAL
// - Precios correctos: BASE $29, PLUS $69
// - Lee el plan activo real desde la API (no hardcodeado)
// - Lee los planes disponibles desde la API (no hardcodeados)
// - Muestra badge del plan actual con días restantes

import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PLAN_COLORS = {
  GRATIS: { bg: '#F1EFE8', color: '#5F5E5A' },
  BASE:   { bg: '#E6F1FB', color: '#185FA5' },
  PLUS:   { bg: '#E1F5EE', color: '#0F6E56' },
};

// Links de MercadoPago por plan y período (se mantienen los actuales hasta configurar webhook)
const MP_LINKS = {
  BASE: {
    MENSUAL:   'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=2c9380848c5ac783018c5b75641d0088',
    SEMESTRAL: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=2c9380848c5ac790018c5b74aa7b008a',
  },
  PLUS: {
    MENSUAL:   'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=2c9380847b62931d017b88b8f4931d36',
    SEMESTRAL: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=2c9380848c5ac783018c5b71ed4c0084',
  },
};

// Precios correctos (fuente de verdad hasta que el admin los edite desde la DB)
const PLAN_PRICES = {
  GRATIS: { MENSUAL: null, SEMESTRAL: null },
  BASE:   { MENSUAL: 29,  SEMESTRAL: 145 },  // 5 meses al precio de 6
  PLUS:   { MENSUAL: 69,  SEMESTRAL: 345 },
};

// Tarjeta de plan individual
const PlanCard = ({ plan, selected, period, onSelect }) => {
  const colors = PLAN_COLORS[plan.name] || PLAN_COLORS.GRATIS;
  const price  = PLAN_PRICES[plan.name]?.[period];
  const isSelected = selected === plan.name;

  // Parsea features del string separado por comas
  const features = plan.features
    ? plan.features.split(',').map(f => f.trim()).filter(Boolean)
    : [];

  return (
    <div
      onClick={onSelect}
      style={{
        flex: '1 1 0',
        border: isSelected ? `2px solid ${colors.color}` : '0.5px solid var(--color-border-tertiary, #e0e0e0)',
        borderRadius: 8,
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'border-color .15s',
        background: 'white',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: isSelected ? colors.bg : '#F9F9F9',
        borderBottom: '0.5px solid #e0e0e0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: colors.color }}>{plan.name}</span>
          {price !== null ? (
            <span style={{ fontSize: 20, fontWeight: 500 }}>
              U$D {price}
              <span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>/mes</span>
            </span>
          ) : (
            <span style={{ fontSize: 20, fontWeight: 500, color: colors.color }}>Gratis</span>
          )}
        </div>
        {period === 'SEMESTRAL' && price !== null && (
          <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
            U$D {price * 6} / semestre · 1 mes bonificado
          </div>
        )}
      </div>

      {/* Features */}
      <div style={{ padding: '14px 20px' }}>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {features.map((f, i) => (
            <li key={i} style={{ fontSize: 12, color: '#555', marginBottom: 6, display: 'flex', gap: 8 }}>
              <span style={{ color: colors.color, flexShrink: 0 }}>✓</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const SubscriptionBlocks = () => {
  const [period, setPeriod]             = useState('MENSUAL');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [error, setError]               = useState('');
  const [plans, setPlans]               = useState([]);
  const [currentPlan, setCurrentPlan]   = useState(null);
  const [daysLeft, setDaysLeft]         = useState(null);
  const [loading, setLoading]           = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Cargar planes disponibles desde la API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await fetch(`${baseUrl}/subscriptions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        // Solo planes activos, no pausados, ordenados por precio
        const available = data
          .filter(p => p.isActive && !p.isPaused)
          .sort((a, b) => a.price - b.price);
        setPlans(available);
      } catch {
        // fallback: mostrar igual con datos estáticos si falla la API
        setPlans([]);
      }
    };
    fetchPlans();
  }, []);

  // Cargar plan actual de la empresa
  useEffect(() => {
    const fetchCurrentPlan = async () => {
      try {
        const companyId = sessionStorage.getItem('companyId');
        const token     = sessionStorage.getItem('accessToken');
        if (!companyId || !token) { setLoading(false); return; }

        const res = await fetch(
          `${baseUrl}/companySubscriptions/company/${companyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error();
        const data = await res.json();

        const now = new Date();
        const active = data.find(s =>
          s.isActive &&
          s.status === 'active' &&
          new Date(s.endDate) >= now
        );

        if (active?.Subscription) {
          setCurrentPlan(active.Subscription.name);
          const days = Math.ceil((new Date(active.endDate) - now) / (1000 * 60 * 60 * 24));
          setDaysLeft(Math.max(0, days));
        } else {
          setCurrentPlan('GRATIS');
        }
      } catch {
        setCurrentPlan('GRATIS');
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentPlan();
  }, []);

  const handleSubmit = () => {
    if (!selectedPlan) { setError('Seleccioná un plan para continuar.'); return; }
    setError('');

    if (selectedPlan === 'GRATIS') {
      setError('Ya tenés el plan Gratuito activo.'); return;
    }
    if (selectedPlan === currentPlan) {
      setError(`Ya estás suscripto al plan ${currentPlan}.`); return;
    }

    const link = MP_LINKS[selectedPlan]?.[period];
    if (link) window.open(link, '_blank');
    else setError('No se encontró el link de pago. Contactá a soporte.');
  };

  const planColors = PLAN_COLORS[currentPlan] || PLAN_COLORS.GRATIS;

  return (
    <div className="text-primary-500">
      <ToastContainer />

      {/* Plan actual */}
      <div style={{ margin: '8px 8px 16px', padding: '12px 16px', border: '0.5px solid #e0e0e0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14 }}>
          Tu suscripción actual:{' '}
          {loading ? (
            <span style={{ color: '#888' }}>cargando...</span>
          ) : (
            <span style={{ fontWeight: 500, padding: '2px 10px', borderRadius: 99, background: planColors.bg, color: planColors.color }}>
              {currentPlan || 'GRATIS'}
            </span>
          )}
        </span>
        {daysLeft !== null && (
          <span style={{ fontSize: 12, color: daysLeft <= 7 ? '#993C1D' : '#888' }}>
            {daysLeft <= 7 ? `⚠ vence en ${daysLeft} días` : `${daysLeft} días restantes`}
          </span>
        )}
      </div>

      {/* Selector de período */}
      <div style={{ display: 'flex', gap: 8, padding: '0 8px', marginBottom: 16 }}>
        {['MENSUAL', 'SEMESTRAL'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 500,
              border: '0.5px solid',
              borderColor: period === p ? '#191654' : '#e0e0e0',
              background: period === p ? '#191654' : 'transparent',
              color: period === p ? 'white' : 'inherit',
              borderRadius: 6, cursor: 'pointer', transition: 'all .15s',
            }}
          >
            {p}{p === 'SEMESTRAL' ? ' · 1 mes GRATIS' : ''}
          </button>
        ))}
      </div>

      {/* Tarjetas de planes */}
      <div style={{ display: 'flex', gap: 12, padding: '0 8px', marginBottom: 16 }}>
        {plans.length > 0
          ? plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selected={selectedPlan}
                period={period}
                onSelect={() => setSelectedPlan(plan.name)}
              />
            ))
          : /* Fallback estático si la API falla */ ['GRATIS', 'BASE', 'PLUS'].map(name => (
              <PlanCard
                key={name}
                plan={{
                  name,
                  features: name === 'GRATIS'
                    ? 'Licitaciones ilimitadas,Invitaciones ilimitadas,Directorio de empresas,Búsqueda de Proveedores'
                    : name === 'BASE'
                    ? 'Todo el plan GRATIS,Licitaciones Privadas,Ocultar Presupuesto,30 Propuestas activas,Fee 2.5% por licitación ganada'
                    : 'Todo el plan BASE,Propuestas ilimitadas,Destacado en el Directorio,Fee 1% por licitación ganada,Soporte prioritario',
                }}
                selected={selectedPlan}
                period={period}
                onSelect={() => setSelectedPlan(name)}
              />
            ))
        }
      </div>

      {error && (
        <div style={{ margin: '0 8px 12px', padding: '10px 14px', background: '#FAECE7', border: '0.5px solid #F5C4B3', borderRadius: 6, fontSize: 13, color: '#993C1D' }}>
          {error}
        </div>
      )}

      <div style={{ padding: '0 8px 16px', textAlign: 'right' }}>
        <button
          onClick={handleSubmit}
          style={{
            padding: '10px 28px', fontSize: 14, fontWeight: 500,
            background: '#191654', color: 'white',
            border: 'none', borderRadius: 6, cursor: 'pointer',
          }}
        >
          Continuar al pago →
        </button>
      </div>
    </div>
  );
};

export default SubscriptionBlocks;
