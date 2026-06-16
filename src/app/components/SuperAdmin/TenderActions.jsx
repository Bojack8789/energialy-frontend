"use client";

import React, { useState } from 'react';
import { MdEdit, MdDelete, MdPublish, MdCancel } from 'react-icons/md';
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
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setShowEditModal(true)}
          disabled={loading}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
          title="Editar"
        >
          <MdEdit size={14} /> Editar
        </button>
        <button
          onClick={handleToggleStatus}
          disabled={loading}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded border transition-colors disabled:opacity-50 ${
            tender.status === 'published'
              ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
          }`}
          title={tender.status === 'published' ? 'Cancelar' : 'Publicar'}
        >
          {tender.status === 'published'
            ? <><MdCancel size={14} /> Cancelar</>
            : <><MdPublish size={14} /> Publicar</>
          }
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
          title="Eliminar"
        >
          <MdDelete size={14} /> Eliminar
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
