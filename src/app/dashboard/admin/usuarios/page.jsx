"use client";

import React, { useState, useEffect } from 'react';
import { TableCard } from '@/app/components/ui';
import UserFormModal from '@/app/components/SuperAdmin/UserFormModal';
import UserActions from '@/app/components/SuperAdmin/UserActions';

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/users?limit=100`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) throw new Error('Error al cargar usuarios');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdate = (updatedUser) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDelete = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleCreate = (newUser) => {
    setUsers(prev => [newUser, ...prev]);
    setModalOpen(false);
  };

  const tableColumns = [
    { header: 'Usuario', accessor: 'fullName', type: 'avatar' },
    { header: 'Email', accessor: 'email' },
    { header: 'Rol', accessor: 'role', type: 'status' },
    { header: 'Empresa', accessor: 'companyName' },
    { header: 'Estado', accessor: 'status', type: 'status' },
    {
      header: 'Acciones',
      accessor: 'actions',
      render: (row) => {
        const originalUser = users.find(u => u.id === row.id);
        return originalUser ? (
          <UserActions user={originalUser} onUpdate={handleUpdate} onDelete={handleDelete} />
        ) : null;
      }
    }
  ];

  const transformedUsers = users.map(user => ({
    id: user.id,
    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario Sin Nombre',
    email: user.email || 'Sin email',
    role: user.role || 'user',
    companyName: user.Company?.name || 'Sin empresa',
    status: user.isActive ? 'Active' : 'Inactive'
  }));

  const handleRowClick = (user) => { console.log('User clicked:', user); };

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
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">Administrar Usuarios</h2>
        <button onClick={() => setModalOpen(true)} className="inline-flex items-center justify-center rounded-md bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
          Crear Usuario
        </button>
      </div>
      <TableCard title="Lista de Usuarios" data={transformedUsers} columns={tableColumns} onRowClick={handleRowClick} showSearch={true} showFilter={true} searchPlaceholder="Buscar usuarios..." />
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-title-md font-bold text-black dark:text-white">{users.length}</h4>
          <span className="text-sm font-medium">Total Usuarios</span>
        </div>
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-title-md font-bold text-black dark:text-white">{users.filter(u => u.isActive).length}</h4>
          <span className="text-sm font-medium">Usuarios Activos</span>
        </div>
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-title-md font-bold text-black dark:text-white">{users.filter(u => !u.isActive).length}</h4>
          <span className="text-sm font-medium">Usuarios Inactivos</span>
        </div>
      </div>
      <UserFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} />
    </div>
  );
}
