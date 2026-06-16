"use client";

import React, { useState } from 'react';
import { MdEdit, MdDelete, MdCheckCircle, MdCancel, MdDiamond } from 'react-icons/md';
import UserFormModal from './UserFormModal';
import SubscriptionChangeModal from './SubscriptionChangeModal';

const UserActions = ({ user, onUpdate, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar el usuario "${user.email}"?`)) return;
    setDeleting(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/users/${user.id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        onDelete(user.id);
        alert('Usuario eliminado exitosamente');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar usuario');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/users/${user.id}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ isActive: !user.isActive })
        }
      );
      if (response.ok) {
        const updatedUser = { ...user, isActive: !user.isActive };
        onUpdate(updatedUser);
        alert(`Usuario ${updatedUser.isActive ? 'activado' : 'desactivado'} exitosamente`);
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Error al cambiar estado');
    }
  };

  return (
    <>
      <div className="flex gap-1.5">
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
          title="Editar"
        >
          <MdEdit size={14} /> Editar
        </button>

        <button
          onClick={() => setSubscriptionModalOpen(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition-colors"
          title="Cambiar Plan"
          disabled={!user.Company}
        >
          <MdDiamond size={14} /> Plan
        </button>

        <button
          onClick={handleToggleStatus}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded border transition-colors ${
            user.isActive
              ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
          }`}
          title={user.isActive ? 'Desactivar' : 'Activar'}
        >
          {user.isActive
            ? <><MdCancel size={14} /> Desactivar</>
            : <><MdCheckCircle size={14} /> Activar</>
          }
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
          title="Eliminar"
        >
          <MdDelete size={14} /> {deleting ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>

      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={user}
        onSave={(updated) => { onUpdate(updated); setModalOpen(false); }}
      />

      <SubscriptionChangeModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        user={user}
        onSave={(updated) => { onUpdate(updated); setSubscriptionModalOpen(false); }}
      />
    </>
  );
};

export default UserActions;
