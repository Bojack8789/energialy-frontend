"use client";

import React, { useState, useEffect, useRef } from 'react';
import getLocalStorage from '@/app/Func/localStorage';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const [user, setUser] = useState(null);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    setUser(getLocalStorage());
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    const baseUrl     = process.env.NEXT_PUBLIC_BASE_URL;
    const accessToken = sessionStorage.getItem('accessToken');
    try {
      await fetch(`${baseUrl}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('companyId');
    sessionStorage.removeItem('companyName');
    document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Strict; Secure';
    window.location.href = '/login';
  };

  const defaultAvatar = user
    ? `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=c7d2fe&color=3730a3&bold=true`
    : '';

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white shadow-sm">
      <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6">

        {/* Hamburger mobile */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
            className="rounded-sm border border-gray-200 bg-white p-1.5 shadow-sm"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Título */}
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-gray-800">Panel de Administrador</h1>
        </div>

        {/* Usuario dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropOpen(!dropOpen)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <img
              src={defaultAvatar}
              alt="avatar"
              className="h-9 w-9 rounded-full object-cover border border-gray-200"
            />
            <span className="hidden lg:block text-right">
              <span className="block text-sm font-medium text-gray-800">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="block text-xs text-gray-500">Super Admin</span>
            </span>
            <svg
              className={`hidden lg:block w-4 h-4 text-gray-500 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
