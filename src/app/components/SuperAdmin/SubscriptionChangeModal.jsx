"use client";

import React, { useState } from 'react';

const SubscriptionChangeModal = ({ isOpen, onClose, user, onSave }) => {
  const [subscription, setSubscription] = useState(user?.Company?.subscription || 'free');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.Company?.id) {
      alert('Este usuario no tiene una empresa asociada');
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/companies/${user.Company.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ subscription })
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Actualizar el usuario con la empresa actualizada
        const updatedUser = {
          ...user,
          Company: {
            ...user.Company,
            subscription: data.company.subscription
          }
        };
        onSave(updatedUser);
        alert(`Plan cambiado a "${subscription}" exitosamente`);
        onClose();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error changing subscription:', error);
      alert('Error al cambiar el plan de suscripción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-black">
          Cambiar Plan de Suscripción
        </h2>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            <strong>Usuario:</strong> {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Empresa:</strong> {user?.Company?.name || 'Sin empresa'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Plan actual:</strong> {user?.Company?.subscription || 'free'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nuevo Plan de Suscripción
            </label>
            <select
              value={subscription}
              onChange={(e) => setSubscription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            >
              <option value="free">GRATIS - $0/mes (Máx 3 propuestas activas)</option>
              <option value="base">BASE - $49/mes (Máx 30 propuestas, licitaciones privadas)</option>
              <option value="plus">PLUS - $69/mes (Propuestas ilimitadas, destacado)</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
            <p className="text-xs text-blue-800">
              <strong>Nota:</strong> Este cambio afectará a todos los usuarios de la empresa "{user?.Company?.name}".
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !user?.Company?.id}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Cambiar Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionChangeModal;
