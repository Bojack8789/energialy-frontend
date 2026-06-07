'use client';

import { useState } from 'react';
import { useGetUsersQuery } from '@/app/redux/services/usersApi';
import { useInviteUsersToTenderMutation } from '@/app/redux/services/tendersApi';
import { displaySuccessMessage, displayFailedMessage } from '@/app/components/Toastify';

function InviteUsersModal({ isOpen, onClose, tenderId, tenderTitle }) {
  const { data: users, isLoading } = useGetUsersQuery();
  const [inviteUsers] = useInviteUsersToTenderMutation();
  
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [emailInvitations, setEmailInvitations] = useState([]);
  const [newEmailInvitation, setNewEmailInvitation] = useState({ email: '', name: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar usuarios por término de búsqueda
  const filteredUsers = users?.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleUserSelect = (user) => {
    const isSelected = selectedUsers.find(u => u.id === user.id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleAddEmailInvitation = () => {
    if (newEmailInvitation.email.trim() === '') return;
    
    // Verificar que el email no esté duplicado
    const isDuplicate = emailInvitations.find(inv => inv.email === newEmailInvitation.email) ||
                       selectedUsers.find(user => user.email === newEmailInvitation.email);
    
    if (isDuplicate) {
      displayFailedMessage('Este email ya está en la lista de invitaciones');
      return;
    }

    setEmailInvitations([...emailInvitations, { ...newEmailInvitation, id: Date.now() }]);
    setNewEmailInvitation({ email: '', name: '' });
  };

  const handleRemoveEmailInvitation = (id) => {
    setEmailInvitations(emailInvitations.filter(inv => inv.id !== id));
  };

  const handleSendInvitations = async () => {
    if (selectedUsers.length === 0 && emailInvitations.length === 0) {
      displayFailedMessage('Debes seleccionar al menos un usuario o agregar un email');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Preparar invitaciones
      const invitations = [
        // Usuarios registrados
        ...selectedUsers.map(user => ({
          type: 'registered_user',
          userId: user.id,
          email: user.email,
          name: user.fullName
        })),
        // Usuarios por email
        ...emailInvitations.map(inv => ({
          type: 'email',
          email: inv.email,
          name: inv.name
        }))
      ];

      const result = await inviteUsers({
        tenderId,
        invitations
      }).unwrap();

      displaySuccessMessage(`Invitaciones enviadas exitosamente`);
      
      // Reset form
      setSelectedUsers([]);
      setEmailInvitations([]);
      setNewEmailInvitation({ email: '', name: '' });
      onClose();

    } catch (error) {
      console.error('Error sending invitations:', error);
      displayFailedMessage(error.data?.error || 'Error al enviar las invitaciones');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Invitar Usuarios a Licitar</h2>
          <p className="text-gray-600 mt-1">Licitación: {tenderTitle}</p>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Usuarios Registrados */}
            <div>
              <h3 className="text-lg font-medium mb-4">Usuarios Registrados</h3>
              
              {/* Buscador */}
              <input
                type="text"
                placeholder="Buscar por nombre, email o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              />

              {/* Lista de usuarios */}
              <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center">Cargando usuarios...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No se encontraron usuarios</div>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedUsers.find(u => u.id === user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                          isSelected ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {user.company && (
                              <p className="text-xs text-gray-500">{user.company.name}</p>
                            )}
                          </div>
                          <div className={`w-4 h-4 rounded border-2 ${
                            isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Usuarios seleccionados */}
              {selectedUsers.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Usuarios seleccionados ({selectedUsers.length}):</p>
                  <div className="space-y-1">
                    {selectedUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                        <span className="text-sm">{user.fullName} ({user.email})</span>
                        <button
                          onClick={() => handleUserSelect(user)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Invitaciones por Email */}
            <div>
              <h3 className="text-lg font-medium mb-4">Invitar por Email</h3>
              
              {/* Formulario para agregar email */}
              <div className="space-y-3 mb-4">
                <input
                  type="email"
                  placeholder="Email del usuario"
                  value={newEmailInvitation.email}
                  onChange={(e) => setNewEmailInvitation({ ...newEmailInvitation, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Nombre (opcional)"
                  value={newEmailInvitation.name}
                  onChange={(e) => setNewEmailInvitation({ ...newEmailInvitation, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <button
                  onClick={handleAddEmailInvitation}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Agregar a la Lista
                </button>
              </div>

              {/* Lista de emails para invitar */}
              {emailInvitations.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Emails para invitar ({emailInvitations.length}):</p>
                  <div className="space-y-2">
                    {emailInvitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded">
                        <div>
                          <p className="text-sm font-medium">{invitation.email}</p>
                          {invitation.name && (
                            <p className="text-xs text-gray-600">{invitation.name}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveEmailInvitation(invitation.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total: {selectedUsers.length + emailInvitations.length} invitaciones
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSendInvitations}
              disabled={isSubmitting || (selectedUsers.length === 0 && emailInvitations.length === 0)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Invitaciones'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InviteUsersModal;
