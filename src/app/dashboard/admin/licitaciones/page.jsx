"use client";

import React, { useState, useEffect } from 'react';
import { TableCard, DonutChartCard, BarChartCard } from '@/app/components/ui';
import TenderFormModal from '@/app/components/SuperAdmin/TenderFormModal';
import TenderActions from '@/app/components/SuperAdmin/TenderActions';

export default function AdminLicitacionesPage() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTenders = async () => {
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/tenders?limit=100`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) throw new Error('Error al cargar licitaciones');
      const data = await res.json();
      setTenders(data.tenders || []);
    } catch (error) {
      console.error('Error fetching tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, []);

  const handleUpdate = (updatedTender) => {
    setTenders(prev => prev.map(t => t.id === updatedTender.id ? updatedTender : t));
  };

  const handleDelete = (tenderId) => {
    setTenders(prev => prev.filter(t => t.id !== tenderId));
  };

  const handleCreate = (newTender) => {
    setTenders(prev => [newTender, ...prev]);
    setModalOpen(false);
  };

  const tableColumns = [
    { header: 'Título', accessor: 'title' },
    { header: 'Empresa', accessor: 'companyName' },
    { header: 'Tipo', accessor: 'contractType', type: 'status' },
    { header: 'Estado', accessor: 'status', type: 'status' },
    { header: 'Presupuesto', accessor: 'budget' },
    { header: 'Fecha Validez', accessor: 'validityDate' },
    { header: 'Propuestas', accessor: 'proposalsCount' },
    {
      header: 'Acciones',
      accessor: 'actions',
      render: (row) => {
        const originalTender = tenders.find(t => t.id === row.id);
        return originalTender ? (
          <TenderActions tender={originalTender} onUpdate={handleUpdate} onDelete={handleDelete} />
        ) : null;
      }
    }
  ];

  const transformedTenders = tenders.map(tender => ({
    id: tender.id,
    title: tender.title || 'Sin título',
    companyName: tender.company?.name || 'Sin empresa',
    contractType: tender.contractType === 'public' ? 'Pública' : 'Privada',
    status: tender.status || 'pending',
    budget: tender.showBudget && tender.budget ? `$${tender.budget.toLocaleString()}` : 'No visible',
    validityDate: tender.validityDate ? new Date(tender.validityDate).toLocaleDateString() : 'Sin fecha',
    proposalsCount: tender.Proposals?.length || 0,
  }));

  const handleRowClick = (tender) => { console.log('Tender clicked:', tender); };

  // Datos para gráficos
  const statusData = [
    { name: 'Activas', value: tenders.filter(t => t.status === 'active').length, color: '#10B981' },
    { name: 'Pendientes', value: tenders.filter(t => t.status === 'pending').length, color: '#F59E0B' },
    { name: 'Completadas', value: tenders.filter(t => t.status === 'completed').length, color: '#3B82F6' },
    { name: 'Canceladas', value: tenders.filter(t => t.status === 'cancelled').length, color: '#EF4444' },
  ];

  const typeData = [
    { name: 'Públicas', value: tenders.filter(t => t.contractType === 'public').length },
    { name: 'Privadas', value: tenders.filter(t => t.contractType === 'private').length },
  ];

  // Top empresas por número de licitaciones
  const companyStats = tenders.reduce((acc, tender) => {
    const companyName = tender.company?.name || 'Sin empresa';
    if (!acc[companyName]) {
      acc[companyName] = 0;
    }
    acc[companyName]++;
    return acc;
  }, {});

  const topCompaniesData = Object.entries(companyStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      licitaciones: count
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">Administrar Licitaciones</h2>
        <button onClick={() => setModalOpen(true)} className="inline-flex items-center justify-center rounded-md bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
          Crear Licitación
        </button>
      </div>

      {/* Métricas */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-title-md font-bold text-black dark:text-white">{tenders.length}</h4>
          <span className="text-sm font-medium">Total Licitaciones</span>
        </div>
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-title-md font-bold text-black dark:text-white">{tenders.filter(t => t.status === 'active').length}</h4>
          <span className="text-sm font-medium">Activas</span>
        </div>
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-title-md font-bold text-black dark:text-white">{tenders.filter(t => t.contractType === 'public').length}</h4>
          <span className="text-sm font-medium">Públicas</span>
        </div>
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {tenders.reduce((sum, t) => sum + (t.Proposals?.length || 0), 0)}
          </h4>
          <span className="text-sm font-medium">Total Propuestas</span>
        </div>
      </div>

      {/* Gráficos */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <DonutChartCard
          title="Estado de Licitaciones"
          data={statusData.filter(item => item.value > 0)}
          loading={loading}
          centerText={{
            value: tenders.length,
            label: 'Total'
          }}
        />

        <DonutChartCard
          title="Tipo de Licitaciones"
          data={typeData.filter(item => item.value > 0)}
          loading={loading}
        />

        <BarChartCard
          title="Top 5 Empresas"
          data={topCompaniesData}
          dataKey="licitaciones"
          xAxisKey="name"
          loading={loading}
        />
      </div>

      {/* Tabla de licitaciones */}
      <TableCard
        title="Lista de Licitaciones"
        data={transformedTenders}
        columns={tableColumns}
        onRowClick={handleRowClick}
        showSearch={true}
        showFilter={true}
        searchPlaceholder="Buscar licitaciones..."
      />

      <TenderFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} />
    </div>
  );
}
