"use client";

// SubscriptionWidgets.jsx — NUEVO
// 3 tarjetas para el dashboard de empresa:
//   1. Plan actual (con días restantes y barra de vencimiento)
//   2. Licitaciones activas (con filtro de período)
//   3. Propuestas enviadas (con barra de progreso vs límite del plan)
//
// Uso en CompanyDashboard.jsx:
//   import SubscriptionWidgets from '@/app/components/SubscriptionWidgets';
//   <SubscriptionWidgets companyId={user.company.id} />

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const FILTERS = [
  { label: '7d',   days: 7   },
  { label: '14d',  days: 14  },
  { label: '30d',  days: 30  },
  { label: '180d', days: 180 },
  { label: '365d', days: 365 },
];

const PLAN_COLORS = {
  GRATIS: { bg: '#F1EFE8', text: '#5F5E5A', bar: '#888780' },
  BASE:   { bg: '#E6F1FB', text: '#185FA5', bar: '#378ADD' },
  PLUS:   { bg: '#E1F5EE', text: '#0F6E56', bar: '#1D9E75' },
};

// Ícono de flecha para redirección
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

// Barra de progreso
const ProgressBar = ({ value, max, color }) => {
  const pct = max === null ? 100 : Math.min(100, Math.round((value / max) * 100));
  const isUnlimited = max === null;
  return (
    <div>
      <div style={{ height: 5, background: 'var(--color-background-secondary)', borderRadius: 99, overflow: 'hidden', marginTop: 8 }}>
        <div style={{ height: '100%', width: `${isUnlimited ? 40 : pct}%`, background: color, borderRadius: 99, transition: 'width .3s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 3 }}>
        <span>{value} {isUnlimited ? 'activas' : `usadas`}</span>
        <span>{isUnlimited ? 'ilimitadas' : `máx. ${max}`}</span>
      </div>
    </div>
  );
};

// Filtro de período mini
const PeriodFilter = ({ selected, onChange }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {FILTERS.map(f => (
      <button
        key={f.days}
        onClick={() => onChange(f.days)}
        style={{
          fontSize: 10,
          padding: '2px 7px',
          borderRadius: 'var(--border-radius-md)',
          border: '0.5px solid',
          borderColor: selected === f.days ? 'var(--color-border-secondary)' : 'var(--color-border-tertiary)',
          background: selected === f.days ? 'var(--color-background-secondary)' : 'transparent',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
        }}
      >
        {f.label}
      </button>
    ))}
  </div>
);

const SubscriptionWidgets = ({ companyId }) => {
  const [days, setDays] = useState(30);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async (d) => {
    if (!companyId) return;
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/companies/${companyId}/metrics?days=${d}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) throw new Error();
      setMetrics(await res.json());
    } catch {
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetchMetrics(days); }, [days, fetchMetrics]);

  const cardStyle = {
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '14px 16px',
    minWidth: 0,
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  };

  const titleStyle = {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
  };

  const linkStyle = {
    width: 22,
    height: 22,
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
    flexShrink: 0,
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ ...cardStyle, height: 100, background: 'var(--color-background-secondary)', opacity: 0.5 }} />
        ))}
      </div>
    );
  }

  const planName = metrics?.plan?.name || 'GRATIS';
  const planColors = PLAN_COLORS[planName] || PLAN_COLORS.GRATIS;
  const daysLeft = metrics?.plan?.daysRemaining;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>

      {/* Tarjeta 1: Plan actual */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>Plan actual</span>
          <Link href="/dashboard/ajustesEmpresa" style={linkStyle} title="Ver planes">
            <ArrowIcon />
          </Link>
        </div>
        <div style={{ marginBottom: 4 }}>
          <span style={{
            fontSize: 11, fontWeight: 500,
            padding: '3px 10px', borderRadius: 99,
            background: planColors.bg, color: planColors.text,
            display: 'inline-block',
          }}>
            {planName}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
          {daysLeft !== null && daysLeft !== undefined
            ? `Vence en ${daysLeft} días`
            : 'Sin vencimiento'}
        </div>
        <ProgressBar
          value={daysLeft ?? 0}
          max={30}
          color={planColors.bar}
        />
      </div>

      {/* Tarjeta 2: Licitaciones activas */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>Licitaciones activas</span>
          <Link href="/dashboard/tenders" style={linkStyle} title="Ver licitaciones">
            <ArrowIcon />
          </Link>
        </div>
        <div style={{ fontSize: 26, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
          {metrics?.tenders?.inPeriod ?? 0}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '4px 0 8px' }}>
          en los últimos {days} días
        </div>
        <PeriodFilter selected={days} onChange={setDays} />
        <ProgressBar
          value={metrics?.tenders?.total ?? 0}
          max={metrics?.tenders?.max ?? null}
          color="#378ADD"
        />
      </div>

      {/* Tarjeta 3: Propuestas enviadas */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>Propuestas enviadas</span>
          <Link href="/dashboard/proposals" style={linkStyle} title="Ver propuestas">
            <ArrowIcon />
          </Link>
        </div>
        <div style={{ fontSize: 26, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
          {metrics?.proposals?.inPeriod ?? 0}
          {metrics?.proposals?.max !== null && (
            <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-text-secondary)' }}>
              {' '}/ {metrics?.proposals?.max}
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '4px 0 8px' }}>
          en los últimos {days} días
          {metrics?.proposals?.max !== null && (
            <span> · {Math.max(0, (metrics?.proposals?.max ?? 0) - (metrics?.proposals?.total ?? 0))} disponibles</span>
          )}
        </div>
        <PeriodFilter selected={days} onChange={setDays} />
        <ProgressBar
          value={metrics?.proposals?.total ?? 0}
          max={metrics?.proposals?.max ?? null}
          color="#EF9F27"
        />
      </div>

    </div>
  );
};

export default SubscriptionWidgets;
