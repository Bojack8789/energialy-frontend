"use client";
import React, { useState, useEffect } from "react";
import { Montserrat } from "next/font/google";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  displayFailedMessage,
  displaySuccessMessage,
} from "../../../components/Toastify";
import getLocalStorage from "@/app/Func/localStorage";
import { getAccessToken } from "@/app/Func/sessionStorage";
import { urlProduction } from "@/app/data/dataGeneric";
import { getCompanyId, getUserId } from "@/app/utils/userHelpers";

const montserrat = Montserrat({ subsets: ["latin"] });

const PERMISSION_OPTIONS = [
  { key: 'INSTITUCIONAL', title: 'INSTITUCIONAL', description: 'Editar datos de empresa.' },
  { key: 'COMUNICACIONES', title: 'COMUNICACIONES', description: 'Chatear con otros usuarios. Leer/Enviar documentación vía chat.' },
  { key: 'LICITACIONES', title: 'LICITACIONES', description: '- Crear/Editar Licitaciones Propias. Invitar a proveedores. Seleccionar propuestas.\n- Enviar Propuestas en Licitaciones Externas. Leer/Enviar documentación.' },
  { key: 'FINANZAS', title: 'FINANZAS', description: 'Solicitar productos financieros.' }
];

export default function Colaboradores() {
  const [user, setUser] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState(null);
  const [editPermissions, setEditPermissions] = useState({ INSTITUCIONAL: false, COMUNICACIONES: false, LICITACIONES: false, FINANZAS: false });
  const [passwordModal, setPasswordModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [newCollaborator, setNewCollaborator] = useState({
    email: "",
    name: "",
    permissions: {
      INSTITUCIONAL: false,
      COMUNICACIONES: false,
      LICITACIONES: false,
      FINANZAS: false
    }
  });

  useEffect(() => {
    const userData = getLocalStorage();
    setUser(userData);
    const companyId = getCompanyId(userData);
    if (companyId) {
      fetchCollaborators(companyId);
    } else {
      displayFailedMessage("No se pudo obtener la información de la empresa. Por favor, verifica tu sesión.");
    }
  }, []);

  const fetchCollaborators = async (companyId) => {
    try {
      setIsLoading(true);
      const token = getAccessToken();
      const response = await axios.get(
        `${urlProduction}/collaborators/company-collaborators?companyId=${companyId}`, 
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        }
      );
      
      setCollaborators(response.data.collaborators || response.data);
    } catch (error) {
      
      if (error.response?.status === 401) {
        displayFailedMessage("No tienes permisos para ver colaboradores o tu sesión ha expirado.");
      } else {
        displayFailedMessage("Error al cargar colaboradores: " + (error.response?.data?.error || error.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!newCollaborator.email || !newCollaborator.name) {
      displayFailedMessage("Email y nombre son requeridos");
      return;
    }

    // Convert permissions object to array format expected by backend
    const selectedPermissions = Object.entries(newCollaborator.permissions)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);

    if (selectedPermissions.length === 0) {
      displayFailedMessage("Debes seleccionar al menos un permiso");
      return;
    }

    try {
      setIsLoading(true);
      const userData = getLocalStorage();
      const userId = getUserId(userData);
      const companyId = getCompanyId(userData);

      if (!userId || !companyId) {
        displayFailedMessage("No se pudo obtener la información del usuario o empresa");
        return;
      }

      const token = getAccessToken();

      const response = await axios.post(
        `${urlProduction}/collaborators/invite`,
        {
          email: newCollaborator.email,
          firstName: newCollaborator.name.split(' ')[0],
          lastName: newCollaborator.name.split(' ').slice(1).join(' ') || '',
          permissions: selectedPermissions,
          position: 'Colaborador',
          inviterUserId: userId,
          companyId: companyId
        },
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        }      );

      // Refresh collaborators list
      if (companyId) {
        await fetchCollaborators(companyId);
      }
      
      setNewCollaborator({
        email: "",
        name: "",
        permissions: {
          INSTITUCIONAL: false,
          COMUNICACIONES: false,
          LICITACIONES: false,
          FINANZAS: false
        }
      });
      setShowAddModal(false);
      displaySuccessMessage("Invitación enviada exitosamente");
    } catch (error) {
      
      if (error.response?.status === 401) {
        displayFailedMessage("No tienes permisos para invitar colaboradores.");
      } else {
        displayFailedMessage(error.response?.data?.error || "Error al enviar invitación");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = (permission, value) => {
    setNewCollaborator(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  const handleOpenEdit = (collaborator) => {
    const perms = { INSTITUCIONAL: false, COMUNICACIONES: false, LICITACIONES: false, FINANZAS: false };
    (collaborator.permissions || []).forEach(p => { if (p in perms) perms[p] = true; });
    setEditPermissions(perms);
    setEditingCollaborator(collaborator);
  };

  const handleSavePermissions = async () => {
    const selectedPermissions = Object.entries(editPermissions)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    if (selectedPermissions.length === 0) {
      displayFailedMessage("Debes seleccionar al menos un permiso");
      return;
    }

    try {
      setIsLoading(true);
      const userData = getLocalStorage();
      const token = getAccessToken();

      if (!token) {
        displayFailedMessage("No se encontró token de autenticación.");
        return;
      }

      await axios.put(
        `${urlProduction}/collaborators/permissions/${editingCollaborator.id}`,
        { permissions: selectedPermissions },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      const companyId = getCompanyId(userData);
      if (companyId) await fetchCollaborators(companyId);

      setEditingCollaborator(null);
      displaySuccessMessage("Permisos actualizados exitosamente");
    } catch (error) {
      if (error.response?.status === 401) {
        displayFailedMessage("No tienes permisos para editar colaboradores.");
      } else if (error.response?.status === 403) {
        displayFailedMessage("Acceso denegado. Solo el propietario puede editar permisos.");
      } else {
        displayFailedMessage(error.response?.data?.error || "Error al actualizar permisos");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (collaborator) => {
    try {
      const token = getAccessToken();
      if (!token) { displayFailedMessage("No se encontró token de autenticación."); return; }

      await axios.patch(
        `${urlProduction}/collaborators/toggle/${collaborator.id}`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const userData = getLocalStorage();
      const companyId = getCompanyId(userData);
      if (companyId) await fetchCollaborators(companyId);

      displaySuccessMessage(collaborator.isActive ? "Cuenta desactivada" : "Cuenta reactivada");
    } catch (error) {
      displayFailedMessage(error.response?.data?.error || "Error al cambiar estado");
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      displayFailedMessage("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    try {
      setIsLoading(true);
      const token = getAccessToken();
      if (!token) { displayFailedMessage("No se encontró token de autenticación."); return; }

      await axios.patch(
        `${urlProduction}/collaborators/password/${passwordModal.id}`,
        { newPassword },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      setPasswordModal(null);
      setNewPassword('');
      displaySuccessMessage("Contraseña actualizada exitosamente");
    } catch (error) {
      displayFailedMessage(error.response?.data?.error || "Error al cambiar contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      const userData = getLocalStorage();
      const token = getAccessToken();

      if (!token) {
        displayFailedMessage("No se encontró token de autenticación. Por favor, inicia sesión nuevamente.");
        return;
      }

      await axios.delete(`${urlProduction}/collaborators/${collaboratorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });        
      // Refresh collaborators list
      const companyId = getCompanyId(userData);
      if (companyId) {
        await fetchCollaborators(companyId);
      }
      displaySuccessMessage("Colaborador eliminado exitosamente");
    } catch (error) {
      if (error.response?.status === 401) {
        displayFailedMessage("No tienes permisos para eliminar colaboradores. Verifica que seas el propietario de la empresa.");
      } else if (error.response?.status === 403) {
        displayFailedMessage("Acceso denegado. Solo el propietario de la empresa puede eliminar colaboradores.");
      } else {
        displayFailedMessage("Error al eliminar colaborador: " + (error.response?.data?.error || error.message));
      }
    }
  };
  return (
    <div className={`${montserrat.className}`}>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Mi Equipo
            </h2>
            <p className="text-gray-600 text-sm">
              Gestiona los usuarios colaboradores de tu empresa y sus permisos
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span className="text-sm sm:text-base">+ AGREGAR COLABORADOR</span>
          </button>
        </div>

        {/* Collaborators List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando colaboradores...</p>
            </div>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay colaboradores agregados</p>
              <p className="text-sm">Agrega tu primer colaborador usando el botón superior</p>
            </div>          ) : (            collaborators.map((collaborator) => (
              <div key={collaborator.id} className={`border rounded-lg p-4 ${collaborator.isActive ? 'bg-gray-50' : 'bg-gray-100 opacity-70'}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className={`font-semibold text-base ${collaborator.isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                        {collaborator.firstName} {collaborator.lastName}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded w-fit ${
                        !collaborator.isActive
                          ? 'bg-gray-200 text-gray-500'
                          : collaborator.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {!collaborator.isActive ? 'Desactivado' : collaborator.status === 'accepted' ? 'Activo' : 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1 break-all">{collaborator.email}</p>
                    {collaborator.position && (
                      <p className="text-gray-500 text-xs mb-2">{collaborator.position}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {(collaborator.permissions || []).map((permission) => (
                        <span key={permission} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                  {collaborator.role === 'company_collaborator' && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      {collaborator.status === 'accepted' && collaborator.isActive && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(collaborator)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm px-3 py-2 rounded border border-indigo-200 hover:border-indigo-300 transition-colors text-center min-h-[40px]"
                          >
                            Editar permisos
                          </button>
                          <button
                            onClick={() => { setPasswordModal(collaborator); setNewPassword(''); }}
                            className="text-blue-600 hover:text-blue-800 text-sm px-3 py-2 rounded border border-blue-200 hover:border-blue-300 transition-colors text-center min-h-[40px]"
                          >
                            Contraseña
                          </button>
                        </>
                      )}
                      {collaborator.status === 'accepted' && (
                        <button
                          onClick={() => handleToggleStatus(collaborator)}
                          className={`text-sm px-3 py-2 rounded border transition-colors text-center min-h-[40px] ${
                            collaborator.isActive
                              ? 'text-orange-600 hover:text-orange-800 border-orange-200 hover:border-orange-300'
                              : 'text-green-600 hover:text-green-800 border-green-200 hover:border-green-300'
                          }`}
                        >
                          {collaborator.isActive ? 'Desactivar' : 'Reactivar'}
                        </button>
                      )}
                      {collaborator.status === 'pending' && (
                        <button
                          onClick={() => handleRemoveCollaborator(collaborator.id)}
                          className="text-red-600 hover:text-red-800 text-sm px-3 py-2 rounded border border-red-200 hover:border-red-300 transition-colors text-center min-h-[40px]"
                        >
                          Cancelar invitación
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>        {/* Add Collaborator Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Agregar Nuevo Colaborador</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={newCollaborator.name}
                      onChange={(e) => setNewCollaborator(prev => ({...prev, name: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="Nombre del colaborador"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newCollaborator.email}
                      onChange={(e) => setNewCollaborator(prev => ({...prev, email: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Selecciona las funciones para este Usuario Colaborador:
                  </h4>
                  <div className="space-y-4">
                    {PERMISSION_OPTIONS.map((permission) => (
                      <div key={permission.key} className="border rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium">
                                {permission.title}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                              {permission.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-center sm:justify-end gap-3 sm:ml-4">
                            <span className="text-sm text-gray-500">NO</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newCollaborator.permissions[permission.key]}
                                onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                            <span className="text-sm text-gray-500">SÍ</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddCollaborator}
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="text-sm">Procesando...</span>
                      </>
                    ) : (
                      <span className="text-sm font-medium">CONFIRMAR</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>        )}
        </div>
      </div>
      {/* Edit Permissions Modal */}
      {editingCollaborator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Editar Permisos</h3>
                <p className="text-sm text-gray-500">{editingCollaborator.firstName} {editingCollaborator.lastName}</p>
              </div>
              <button
                onClick={() => setEditingCollaborator(null)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {PERMISSION_OPTIONS.map((permission) => (
                <div key={permission.key} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium inline-block mb-2">
                        {permission.title}
                      </span>
                      <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{permission.description}</p>
                    </div>
                    <div className="flex items-center justify-center sm:justify-end gap-3 sm:ml-4">
                      <span className="text-sm text-gray-500">NO</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editPermissions[permission.key]}
                          onChange={(e) => setEditPermissions(prev => ({ ...prev, [permission.key]: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                      <span className="text-sm text-gray-500">SÍ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t mt-4">
              <button
                onClick={() => setEditingCollaborator(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={isLoading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm">Guardando...</span>
                  </>
                ) : (
                  <span className="text-sm font-medium">GUARDAR CAMBIOS</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm mx-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Cambiar Contraseña</h3>
                <p className="text-sm text-gray-500">{passwordModal.firstName} {passwordModal.lastName}</p>
              </div>
              <button
                onClick={() => { setPasswordModal(null); setNewPassword(''); }}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => { setPasswordModal(null); setNewPassword(''); }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isLoading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm">Guardando...</span>
                  </>
                ) : (
                  <span className="text-sm font-medium">GUARDAR</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
