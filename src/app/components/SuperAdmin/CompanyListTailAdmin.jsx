"use client";

import React, { useState, useEffect } from 'react';
import { TableCard, DonutChartCard, BarChartCard } from '../ui';
import CompanyFormModal from './CompanyFormModal';
import CompanyActions from './CompanyActions';

export const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCompanies = async () => {
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/companies?limit=100`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) throw new Error('Error al cargar empresas');
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleUpdate = (updatedCompany) => {
    setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
  };

  const handleDelete = (companyId) => {
    setCompanies(prev => prev.filter(c => c.id !== companyId));
  };

  const handleCreate = (newCompany) => {
    setCompanies(prev => [newCompany, ...prev]);
    setModalOpen(false);
  };

  const tableColumns = [
    { header: 'Empresa', accessor: 'name', type: 'avatar' },
    { header: 'Email', accessor: 'email' },
    { header: 'Tipo', accessor: 'organizationType' },
    { header: 'Suscripción', accessor: 'subscription', type: 'status' },
    { header: 'Estado', accessor: 'status', type: 'status' },
    {
      header: 'Acciones',
      accessor: 'actions',
      render: (row) => {
        const originalCompany = companies.find(c => c.id === row.id);
        return originalCompany ? (
          <CompanyActions company={originalCompany} onUpdate={handleUpdate} onDelete={handleDelete} />
        ) : null;
      }
    }
  ];

  const transformedCompanies = companies.map(company => ({
    id: company.id,
    name: company.name || 'Empresa Sin Nombre',
    email: company.companyEmail || 'Sin email',
    organizationType: company.organizationType || 'N/A',
    subscription: company.subscription || 'base',
    status: company.isActive ? 'Active' : 'Inactive'
  }));

  const handleRowClick = (company) => { console.log('Company clicked:', company); };

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
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">Gestión de Empresas</h2>
        <button onClick={() => setModalOpen(true)} className="inline-flex items-center justify-center rounded-md bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
          Registrar Empresa
        </button>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default">
          <h4 className="text-title-md font-bold text-black">{companies.length}</h4>
          <span className="text-sm font-medium">Total Empresas</span>
        </div>
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default">
          <h4 className="text-title-md font-bold text-black">{companies.filter(c => c.subscription === 'plus').length}</h4>
          <span className="text-sm font-medium">Suscripción Plus</span>
        </div>
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default">
          <h4 className="text-title-md font-bold text-black">{companies.filter(c => c.subscription === 'base').length}</h4>
          <span className="text-sm font-medium">Suscripción Base</span>
        </div>
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default">
          <h4 className="text-title-md font-bold text-black">{companies.filter(c => c.isActive).length}</h4>
          <span className="text-sm font-medium">Empresas Activas</span>
        </div>
      </div>
      <TableCard title="Lista de Empresas" data={transformedCompanies} columns={tableColumns} onRowClick={handleRowClick} showSearch={true} showFilter={true} searchPlaceholder="Buscar empresas..." />
      <CompanyFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} />
    </div>
  );
};
