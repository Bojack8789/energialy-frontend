"use client";

import React, { useState } from 'react';
import UserFormModal from './UserFormModal';
import SubscriptionChangeModal from './SubscriptionChangeModal';

const UserActions = ({ user, onUpdate, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar el usuario "${user.email}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/users/${user.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
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
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ isActive: !user.isActive })
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Backend returns message, update local state with toggled isActive
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
          disabled={!user.Company}
        >
          💎 Plan
        </button>

        <button
          onClick={handleToggleStatus}
          className={`px-3 py-1 text-sm rounded ${
            user.isActive
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
          title={user.isActive ? 'Desactivar' : 'Activar'}
        >
          {user.isActive ? '❌ Desactivar' : '✅ Activar'}
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

      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={user}
        onSave={(updated) => {
          onUpdate(updated);
          setModalOpen(false);
        }}
      />

      <SubscriptionChangeModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        user={user}
        onSave={(updated) => {
          onUpdate(updated);
          setSubscriptionModalOpen(false);
        }}
      />
    </>
  );
};

export default UserActions;
