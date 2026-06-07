"use client";

// TailAdminDashboard.jsx — REEMPLAZA el existente
// Gráficos reales con datos de la API: Licitaciones, Propuestas, Invitaciones
// Filtros unificados: 7 / 14 / 30 / 90 / 180 / 365 días

import React, { useState, useEffect, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';

if (typeof window !== 'undefined') {
  Chart.register(...registerables);
}

const FILTERS = [
  { label: '7d',   days: 7   },
  { label: '14d',  days: 14  },
  { label: '30d',  days: 30  },
  { label: '90d',  days: 90  },
  { label: '180d', days: 180 },
  { label: '365d', days: 365 },
];

// Genera etiquetas de fechas para el eje X
const buildDateLabels = (series, days) => {
  if (!series || series.length === 0) return [];
  return series.map(item => {
    const d = new Date(item.date);
    return days <= 14
      ? `${d.getDate()}/${d.getMonth() + 1}`
      : `${d.getDate()}/${d.getMonth() + 1}`;
  });
};

// Tarjeta métrica superior
const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '16px 20px',
    flex: 1,
    minWidth: 0,
  }}>
    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 500, color, lineHeight: 1.1 }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>{sub}</div>}
  </div>
);

// Componente de gráfico de línea usando Chart.js
const LineChartCard = ({ title, series, days, datasetA, datasetB, colorA, colorB }) => {
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Chart.js now imported from npm

    const buildChart = () => {
      if (!canvasRef.current || !Chart) return;
      if (chartRef.current) { chartRef.current.destroy(); }

      const labels = buildDateLabels(series, days);
      const valuesA = series.map(item => parseInt(item[datasetA.key]) || 0);
      const valuesB = datasetB ? series.map(item => parseInt(item[datasetB.key]) || 0) : null;

      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: datasetA.label,
              data: valuesA,
              borderColor: colorA,
              backgroundColor: colorA + '18',
              borderWidth: 1.5,
              tension: 0.4,
              fill: true,
              pointRadius: days <= 14 ? 3 : 0,
            },
            ...(valuesB ? [{
              label: datasetB.label,
              data: valuesB,
              borderColor: colorB,
              backgroundColor: colorB + '18',
              borderWidth: 1.5,
              tension: 0.4,
              fill: true,
              pointRadius: days <= 14 ? 3 : 0,
              borderDash: [4, 3],
            }] : []),
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false },
          },
          scales: {
            x: {
              ticks: { font: { size: 11 }, color: '#888', maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              ticks: { font: { size: 11 }, color: '#888', precision: 0 },
              grid: { color: 'rgba(0,0,0,0.05)' },
            },
          },
        },
      });
    };

    // Chart.js puede no estar cargado aún
    const interval = setInterval(() => {
      if (Chart) { clearInterval(interval); buildChart(); }
    }, 100);
    return () => { clearInterval(interval); if (chartRef.current) chartRef.current.destroy(); };
  }, [series, days]);

  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{title}</span>
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--color-text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 2, background: colorA, display: 'inline-block', borderRadius: 2 }}></span>
            {datasetA.label}
          </span>
          {datasetB && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 2, background: colorB, display: 'inline-block', borderRadius: 2, borderTop: `2px dashed ${colorB}` }}></span>
              {datasetB.label}
            </span>
          )}
        </div>
      </div>
      <div style={{ position: 'relative', height: 180 }}>
        <canvas ref={canvasRef} role="img" aria-label={`Gráfico de ${title}`}></canvas>
      </div>
    </div>
  );
};

const TailAdminDashboard = () => {
  const [selectedDays, setSelectedDays] = useState(30);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async (days) => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/metrics?days=${days}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) throw new Error('Error al cargar métricas');
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMetrics(selectedDays); }, [selectedDays]);

  // Filtro de período
  const FilterBar = () => (
    <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
      {FILTERS.map(f => (
        <button
          key={f.days}
          onClick={() => setSelectedDays(f.days)}
          style={{
            fontSize: 12,
            padding: '4px 12px',
            borderRadius: 'var(--border-radius-md)',
            border: '0.5px solid',
            borderColor: selectedDays === f.days ? 'var(--color-border-primary)' : 'var(--color-border-tertiary)',
            background: selectedDays === f.days ? 'var(--color-background-secondary)' : 'transparent',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            fontWeight: selectedDays === f.days ? 500 : 400,
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  if (loading) return (
    <div style={{ padding: '2rem', color: 'var(--color-text-secondary)', fontSize: 14 }}>
      Cargando métricas...
    </div>
  );

  if (error) return (
    <div style={{ padding: '2rem', color: 'var(--color-text-danger, #e24b4a)', fontSize: 14 }}>
      {error}
    </div>
  );

  const conversionRate = metrics?.proposals?.sent > 0
    ? Math.round((metrics.proposals.accepted / metrics.proposals.sent) * 100)
    : 0;

  const invAcceptRate = metrics?.invitations?.sent > 0
    ? Math.round((metrics.invitations.accepted / metrics.invitations.sent) * 100)
    : 0;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1200 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Métricas de la plataforma</h2>
        <FilterBar />
      </div>

      {/* Tarjetas de resumen */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard label="Licitaciones en el período"  value={metrics?.tenders?.total}     color="#378ADD" sub={`${metrics?.tenders?.public} públicas · ${metrics?.tenders?.private} privadas`} />
        <StatCard label="Propuestas enviadas"          value={metrics?.proposals?.sent}    color="#1D9E75" sub={`${metrics?.proposals?.accepted} aceptadas · ${conversionRate}% conversión`} />
        <StatCard label="Invitaciones enviadas"        value={metrics?.invitations?.sent}  color="#EF9F27" sub={`${metrics?.invitations?.accepted} aceptadas · ${invAcceptRate}% aceptación`} />
      </div>

      {/* Gráficos de línea */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

        <LineChartCard
          title="Licitaciones activas"
          series={metrics?.tenders?.series || []}
          days={selectedDays}
          datasetA={{ key: 'public',  label: 'Públicas'  }}
          datasetB={{ key: 'private', label: 'Privadas'  }}
          colorA="#378ADD"
          colorB="#185FA5"
        />

        <LineChartCard
          title="Propuestas"
          series={metrics?.proposals?.series || []}
          days={selectedDays}
          datasetA={{ key: 'sent',     label: 'Enviadas'  }}
          datasetB={{ key: 'accepted', label: 'Aceptadas' }}
          colorA="#1D9E75"
          colorB="#0F6E56"
        />

        <LineChartCard
          title="Invitaciones a licitar"
          series={metrics?.invitations?.series || []}
          days={selectedDays}
          datasetA={{ key: 'sent',     label: 'Enviadas'  }}
          datasetB={{ key: 'accepted', label: 'Aceptadas' }}
          colorA="#EF9F27"
          colorB="#BA7517"
        />

      </div>

      {/* Script de Chart.js */}
      {/* Chart.js now imported from npm */}
    </div>
  );
};

export default TailAdminDashboard;
