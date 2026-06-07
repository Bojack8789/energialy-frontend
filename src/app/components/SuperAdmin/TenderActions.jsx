"use client";

import React, { useState } from 'react';
import TenderFormModal from './TenderFormModal';

export default function TenderActions({ tender, onUpdate, onDelete }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      const newStatus = tender.status === 'published' ? 'cancelled' : 'published';

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/tenders/${tender.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!res.ok) throw new Error('Error al actualizar el estado');
      const data = await res.json();
      onUpdate(data.tender);
    } catch (error) {
      console.error('Error toggling tender status:', error);
      alert('Error al actualizar el estado de la licitación');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta licitación? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/tenders/${tender.id}`,
        {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      if (!res.ok) throw new Error('Error al eliminar la licitación');
      onDelete(tender.id);
    } catch (error) {
      console.error('Error deleting tender:', error);
      alert('Error al eliminar la licitación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowEditModal(true)}
          disabled={loading}
          className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
          title="Editar"
        >
          Editar
        </button>
        <button
          onClick={handleToggleStatus}
          disabled={loading}
          className={`rounded px-3 py-1 text-sm text-white disabled:opacity-50 ${
            tender.status === 'published' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
          }`}
          title={tender.status === 'published' ? 'Cancelar' : 'Publicar'}
        >
          {tender.status === 'published' ? 'Cancelar' : 'Publicar'}
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 disabled:opacity-50"
          title="Eliminar"
        >
          Eliminar
        </button>
      </div>

      <TenderFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={onUpdate}
        tender={tender}
      />
    </>
  );
}
