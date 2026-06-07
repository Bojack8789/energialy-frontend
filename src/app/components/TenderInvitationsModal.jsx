import React, { useState } from 'react';
import { useGetUsersQuery } from '@/app/redux/services/usersApi';
import { useInviteUsersToTenderMutation } from '@/app/redux/services/tendersApi';
import { displaySuccessMessage, displayFailedMessage } from '@/app/components/Toastify';

const TenderInvitationsModal = ({ isOpen, onClose, tenderId, tenderTitle }) => {
  const [invitations, setInvitations] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('registered'); // 'registered' or 'email'

  const { data: users, isLoading: usersLoading } = useGetUsersQuery();
  const [inviteUsers, { isLoading: inviting }] = useInviteUsersToTenderMutation();

  // Filtrar usuarios que no están ya seleccionados
  const availableUsers = users?.filter(user => 
    !selectedUsers.some(selected => selected.id === user.id)
  ) || [];

  const handleAddEmail = () => {
    if (emailInput.trim() && emailInput.includes('@')) {
      const newInvitation = {
        email: emailInput.trim(),
        isRegistered: false,
        id: Date.now() // ID temporal
      };
      setInvitations([...invitations, newInvitation]);
      setEmailInput('');
    }
  };

  const handleSelectUser = (user) => {
    const newInvitation = {
      email: user.email,
      isRegistered: true,
      id: user.id,
      userName: user.firstName + ' ' + user.lastName,
      companyName: user.company?.name || 'Sin empresa'
    };
    setSelectedUsers([...selectedUsers, user]);
    setInvitations([...invitations, newInvitation]);
  };

  const handleRemoveInvitation = (invitationId) => {
    setInvitations(invitations.filter(inv => inv.id !== invitationId));
    setSelectedUsers(selectedUsers.filter(user => user.id !== invitationId));
  };

  const handleSendInvitations = async () => {
    if (invitations.length === 0) {
      displayFailedMessage('Debe agregar al menos una invitación');
      return;
    }

    try {
      await inviteUsers({
        tenderId,
        invitations: invitations.map(inv => ({
          userEmail: inv.email,
          isRegistered: inv.isRegistered
        }))
      }).unwrap();

      displaySuccessMessage(`Se enviaron ${invitations.length} invitaciones exitosamente`);
      setInvitations([]);
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      displayFailedMessage(error.message || 'Error al enviar invitaciones');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Invitar Usuarios a la Licitación</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Licitación:</strong> {tenderTitle}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'registered' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('registered')}
          >
            Usuarios Registrados
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'email' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('email')}
          >
            Invitar por Email
          </button>
        </div>

        {/* Contenido de tabs */}
        {activeTab === 'registered' && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Seleccionar usuarios registrados:</h4>
            {usersLoading ? (
              <p>Cargando usuarios...</p>
            ) : (
              <div className="max-h-40 overflow-y-auto border rounded-md">
                {availableUsers.length > 0 ? (
                  availableUsers.map(user => (
                    <div 
                      key={user.id} 
                      className="flex justify-between items-center p-2 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">{user.company?.name || 'Sin empresa'}</p>
                      </div>
                      <button
                        onClick={() => handleSelectUser(user)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Invitar
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-gray-500 text-center">No hay usuarios disponibles</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'email' && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Invitar por email:</h4>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="email@ejemplo.com"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
              />
              <button
                onClick={handleAddEmail}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                disabled={!emailInput.trim() || !emailInput.includes('@')}
              >
                Agregar
              </button>
            </div>
          </div>
        )}

        {/* Lista de invitaciones */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Invitaciones agregadas ({invitations.length}):</h4>
          {invitations.length > 0 ? (
            <div className="max-h-40 overflow-y-auto border rounded-md">
              {invitations.map(invitation => (
                <div 
                  key={invitation.id} 
                  className="flex justify-between items-center p-2 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    {invitation.isRegistered && (
                      <div>
                        <p className="text-sm text-gray-600">{invitation.userName}</p>
                        <p className="text-xs text-gray-500">{invitation.companyName}</p>
                      </div>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      invitation.isRegistered 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {invitation.isRegistered ? 'Usuario registrado' : 'Invitación por email'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveInvitation(invitation.id)}
                    className="text-red-500 hover:text-red-700 px-2 py-1"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4 border rounded-md bg-gray-50">
              No hay invitaciones agregadas
            </p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSendInvitations}
            disabled={invitations.length === 0 || inviting}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {inviting ? 'Enviando...' : `Enviar ${invitations.length} Invitación${invitations.length !== 1 ? 'es' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenderInvitationsModal;
