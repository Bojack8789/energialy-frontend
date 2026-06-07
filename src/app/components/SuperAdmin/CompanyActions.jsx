"use client";

import React, { useState } from 'react';
import CompanyFormModal from './CompanyFormModal';

const CompanyActions = ({ company, onUpdate, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar la empresa "${company.name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/companies/${company.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        onDelete(company.id);
        alert('Empresa eliminada exitosamente');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Error al eliminar empresa');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/companies/${company.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ isActive: !company.isActive })
        }
      );

      if (response.ok) {
        const data = await response.json();
        onUpdate(data.company);
        alert(`Empresa ${data.company.isActive ? 'activada' : 'pausada'} exitosamente`);
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Error al cambiar estado');
    }
  };

  const handleSubscriptionChange = async (newSubscription) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/companies/${company.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ subscription: newSubscription })
        }
      );

      if (response.ok) {
        const data = await response.json();
        onUpdate(data.company);
        alert(`Plan cambiado a "${newSubscription}" exitosamente`);
        setSubscriptionModalOpen(false);
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error changing subscription:', error);
      alert('Error al cambiar el plan de suscripción');
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setModalOpen(true)}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          title="Editar"
        >
          ✏️ Editar
        </button>

        <button
          onClick={() => setSubscriptionModalOpen(true)}
          className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
          title="Cambiar Plan"
        >
          💎 Plan
        </button>

        <button
          onClick={handleToggleStatus}
          className={`px-3 py-1 text-sm rounded ${
            company.isActive
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
          title={company.isActive ? 'Pausar' : 'Activar'}
        >
          {company.isActive ? '⏸️ Pausar' : '▶️ Activar'}
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          title="Eliminar"
        >
          {deleting ? '...' : '🗑️ Eliminar'}
        </button>
      </div>

      <CompanyFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        company={company}
        onSave={(updated) => {
          onUpdate(updated);
          setModalOpen(false);
        }}
      />

      {subscriptionModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Cambiar Plan de Suscripción
            </h2>

            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <strong>Empresa:</strong> {company.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Plan actual:</strong> {company.subscription || 'free'}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Nuevo Plan
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => handleSubscriptionChange('free')}
                  className="w-full px-4 py-3 text-left border rounded hover:bg-gray-50 text-black"
                >
                  <div className="font-semibold">GRATIS - $0.00/mes</div>
                  <div className="text-xs text-gray-500">Publicar licitaciones públicas, máx 3 propuestas activas</div>
                </button>
                <button
                  onClick={() => handleSubscriptionChange('base')}
                  className="w-full px-4 py-3 text-left border rounded hover:bg-gray-50 text-black"
                >
                  <div className="font-semibold">BASE - $49.00/mes</div>
                  <div className="text-xs text-gray-500">Máx 30 propuestas, licitaciones privadas, ocultar presupuesto</div>
                </button>
                <button
                  onClick={() => handleSubscriptionChange('plus')}
                  className="w-full px-4 py-3 text-left border rounded hover:bg-gray-50 text-black"
                >
                  <div className="font-semibold">PLUS - $69.00/mes</div>
                  <div className="text-xs text-gray-500">Propuestas ilimitadas, destacado en directorio, todas las funcionalidades</div>
                </button>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSubscriptionModalOpen(false)}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyActions;
