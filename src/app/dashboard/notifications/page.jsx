// Full notifications page for the dashboard
// Place this in: client/src/app/dashboard/notifications/page.jsx

"use client";
import React, { useState, useEffect } from "react";
import { Montserrat } from "next/font/google";
import axios from "axios";
import { urlProduction } from "@/app/data/dataGeneric";
import getLocalStorage from "@/app/Func/localStorage";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({ total: 0, unread: 0 });

  useEffect(() => {
    fetchNotifications(1, true);
    fetchStats();
  }, [filter, typeFilter]);

  const getAuthHeaders = () => {
    const userData = getLocalStorage();
    const token = userData?.accessToken;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchNotifications = async (pageNum = 1, reset = true) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20'
      });
      
      if (filter === 'unread') {
        params.append('unreadOnly', 'true');
      }

      const response = await axios.get(
        `${urlProduction}/notifications?${params}`,
        { headers: getAuthHeaders() }
      );

      let filteredNotifications = response.data.notifications;
      
      // Client-side filtering by type (could be moved to backend)
      if (typeFilter !== 'all') {
        filteredNotifications = filteredNotifications.filter(
          notif => notif.type === typeFilter
        );
      }

      if (reset) {
        setNotifications(filteredNotifications);
      } else {
        setNotifications(prev => [...prev, ...filteredNotifications]);
      }
      
      setHasMore(response.data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const unreadResponse = await axios.get(
        `${urlProduction}/notifications/unread-count`,
        { headers: getAuthHeaders() }
      );
      
      const allResponse = await axios.get(
        `${urlProduction}/notifications?limit=1`,
        { headers: getAuthHeaders() }
      );
      
      setStats({
        unread: unreadResponse.data.count,
        total: allResponse.data.total
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${urlProduction}/notifications/${notificationId}/read`,
        {},
        { headers: getAuthHeaders() }
      );
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `${urlProduction}/notifications/mark-all-read`,
        {},
        { headers: getAuthHeaders() }
      );
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setStats(prev => ({ ...prev, unread: 0 }));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      fetchNotifications(page + 1, false);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'CHAT_MESSAGE': '💬',
      'NEW_ACCOUNT': '🎉',
      'TENDER_PUBLISHED': '📝',
      'PROPOSAL_RECEIVED': '📋',
      'PROPOSAL_ACCEPTED': '✅',
      'CONTRACT_AWARDED': '🤝',
      'TENDER_COMPLETED': '🏆',
      'TENDER_CANCELLED': '❌',
      'BANK_ACCOUNT_APPROVED': '🏦',
      'BANK_ACCOUNT_REJECTED': '🚫',
      'FINANCE_PRODUCT_REQUESTED': '💰',
      'FINANCE_PRODUCT_APPROVED': '✅',
      'FINANCE_PRODUCT_REJECTED': '❌',
      'GENERAL': '🔔'
    };
    return iconMap[type] || '🔔';
  };

  const getTypeDisplayName = (type) => {
    const typeMap = {
      'CHAT_MESSAGE': 'Mensajes',
      'NEW_ACCOUNT': 'Cuenta nueva',
      'TENDER_PUBLISHED': 'Licitación publicada',
      'PROPOSAL_RECEIVED': 'Propuesta recibida',
      'PROPOSAL_ACCEPTED': 'Propuesta aceptada',
      'CONTRACT_AWARDED': 'Contrato adjudicado',
      'TENDER_COMPLETED': 'Proyecto completado',
      'TENDER_CANCELLED': 'Licitación cancelada',
      'BANK_ACCOUNT_APPROVED': 'Cuenta aprobada',
      'BANK_ACCOUNT_REJECTED': 'Cuenta rechazada',
      'FINANCE_PRODUCT_REQUESTED': 'Producto financiero solicitado',
      'FINANCE_PRODUCT_APPROVED': 'Producto financiero aprobado',
      'FINANCE_PRODUCT_REJECTED': 'Producto financiero rechazado',
      'GENERAL': 'General'
    };
    return typeMap[type] || type;
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      'LOW': 'bg-gray-100 text-gray-800',
      'MEDIUM': 'bg-blue-100 text-blue-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'URGENT': 'bg-red-100 text-red-800'
    };
    return colorMap[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const notificationTypes = [
    'CHAT_MESSAGE', 'TENDER_PUBLISHED', 'PROPOSAL_RECEIVED', 'PROPOSAL_ACCEPTED',
    'CONTRACT_AWARDED', 'TENDER_COMPLETED', 'BANK_ACCOUNT_APPROVED', 'FINANCE_PRODUCT_APPROVED'
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${montserrat.className}`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
              <p className="text-gray-600">
                Gestiona todas tus notificaciones y mantente al día
              </p>
            </div>
            {stats.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-800">Total de notificaciones</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
              <div className="text-sm text-orange-800">Sin leer</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.total - stats.unread}</div>
              <div className="text-sm text-green-800">Leídas</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Read Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Estado:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todas</option>
                <option value="unread">Sin leer</option>
                <option value="read">Leídas</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Tipo:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todos los tipos</option>
                {notificationTypes.map(type => (
                  <option key={type} value={type}>
                    {getTypeDisplayName(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm">
          {isLoading && notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              Cargando notificaciones...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <span className="text-6xl mb-4 block">🔔</span>
              <h3 className="text-lg font-medium mb-2">No hay notificaciones</h3>
              <p>No tienes notificaciones que coincidan con los filtros seleccionados.</p>
            </div>
          ) : (
            <>
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`p-6 ${index !== notifications.length - 1 ? 'border-b border-gray-200' : ''} ${
                    !notification.isRead ? 'bg-blue-50' : 'hover:bg-gray-50'
                  } transition-colors`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className={`text-lg font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {getTypeDisplayName(notification.type)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-sm text-indigo-600 hover:text-indigo-800"
                            >
                              Marcar como leída
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-base ${
                        !notification.isRead ? 'text-gray-800' : 'text-gray-600'
                      } leading-relaxed`}>
                        {notification.message}
                      </p>
                      
                      {!notification.isRead && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="text-sm text-blue-600 font-medium">Nueva</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {hasMore && (
                <div className="p-6 text-center border-t border-gray-200">
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Cargando...' : 'Cargar más notificaciones'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
