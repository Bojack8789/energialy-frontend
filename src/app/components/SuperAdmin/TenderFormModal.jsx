"use client";

import React, { useState, useEffect } from 'react';

export default function TenderFormModal({ isOpen, onClose, onSave, tender = null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contractType: 'Licitación área (Licitación pública de área)',
    budget: '',
    showBudget: true,
    majorSector: '',
    projectDuration: '',
    validityDate: '',
    companyId: '',
    status: 'published',
  });

  const [companies, setCompanies] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      if (tender) {
        setFormData({
          title: tender.title || '',
          description: tender.description || '',
          contractType: tender.contractType || 'Licitación área (Licitación pública de área)',
          budget: tender.budget || '',
          showBudget: tender.showBudget !== undefined ? tender.showBudget : true,
          majorSector: tender.majorSector || '',
          projectDuration: tender.projectDuration || '',
          validityDate: tender.validityDate ? tender.validityDate.split('T')[0] : '',
          companyId: tender.CompanyId || tender.company?.id || '',
          status: tender.status || 'published',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          contractType: 'Licitación área (Licitación pública de área)',
          budget: '',
          showBudget: true,
          majorSector: '',
          projectDuration: '',
          validityDate: '',
          companyId: '',
          status: 'published',
        });
      }
      setErrors({});
    }
  }, [isOpen, tender]);

  const fetchCompanies = async () => {
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/companies?limit=100`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.companyId) newErrors.companyId = 'La empresa es requerida';
    if (!formData.majorSector.trim()) newErrors.majorSector = 'El sector principal es requerido';
    if (!formData.validityDate) newErrors.validityDate = 'La fecha de validez es requerida';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      const url = tender
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/admin/tenders/${tender.id}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/admin/tenders`;

      const payload = {
        ...formData,
        budget: parseFloat(formData.budget) || 0,
      };

      const res = await fetch(url, {
        method: tender ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al guardar la licitación');
      }

      const data = await res.json();
      onSave(data.tender || data);
      onClose();
    } catch (error) {
      console.error('Error saving tender:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black bg-opacity-50 py-6">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-8 shadow-xl my-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          {tender ? 'Editar Licitación' : 'Crear Licitación'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">Título *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">Descripción *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Empresa *</label>
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              >
                <option value="">Seleccionar empresa</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {errors.companyId && <p className="mt-1 text-sm text-red-600">{errors.companyId}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Tipo de Contrato</label>
              <select
                name="contractType"
                value={formData.contractType}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              >
                <option value="Licitación área (Licitación pública de área)">Licitación Pública de Área</option>
                <option value="Servicio completo (Desarrollo total de un proyecto)">Servicio Completo</option>
                <option value="Individual (Servicio específico en un proyecto)">Servicio Individual</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Sector Principal *</label>
              <select
                name="majorSector"
                value={formData.majorSector}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              >
                <option value="">Seleccionar sector</option>
                <option value="Upstream">Upstream</option>
                <option value="Midstream">Midstream</option>
                <option value="Downstream">Downstream</option>
              </select>
              {errors.majorSector && <p className="mt-1 text-sm text-red-600">{errors.majorSector}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Presupuesto</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Duración del Proyecto</label>
              <select
                name="projectDuration"
                value={formData.projectDuration}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              >
                <option value="">Seleccionar duración</option>
                <option value="Menos de una semana">Menos de una semana</option>
                <option value="Menos de un mes">Menos de un mes</option>
                <option value="De 1 a 3 meses">De 1 a 3 meses</option>
                <option value="De 3 a 6 meses">De 3 a 6 meses</option>
                <option value="Más de 6 meses">Más de 6 meses</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Fecha de Validez *</label>
              <input
                type="date"
                name="validityDate"
                value={formData.validityDate}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
              {errors.validityDate && <p className="mt-1 text-sm text-red-600">{errors.validityDate}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              >
                <option value="published">Publicada</option>
                <option value="expired">Expirada</option>
                <option value="working">En Progreso</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="showBudget"
                checked={formData.showBudget}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Mostrar presupuesto públicamente
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary px-6 py-2 text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : tender ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
