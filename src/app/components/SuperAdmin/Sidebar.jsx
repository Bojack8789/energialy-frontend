"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const trigger = useRef(null);
  const sidebar = useRef(null);

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  // Ítems principales del administrador
  const adminItems = [
    {
      label: 'Dashboard',
      route: '#/Dashboard',
      icon: (
        <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
      ),
    },
    {
      label: 'Usuarios',
      route: '#/users',
      icon: (
        <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      ),
    },
    {
      label: 'Empresas',
      route: '#/companies',
      icon: (
        <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
        </svg>
      ),
    },
    {
      label: 'Licitaciones',
      route: '#/tenders',
      icon: (
        <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84l1.59 1.58L14 15.01l-3-2.99-3 2.99zm0-4l1.41 1.41L11 10.84l1.59 1.58L14 11.01l-3-2.99-3 2.99z"/>
        </svg>
      ),
    },
    {
      label: 'Propuestas',
      route: '#/proposals',
      icon: (
        <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      ),
    },
    {
      label: 'Subscripciones',
      route: '#/subscriptions',
      icon: (
        <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
        </svg>
      ),
    },
    {
      label: 'Planes de Empresa',
      route: '#/companySubscriptions',
      icon: (
        <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
        </svg>
      ),
    },
  ];

  // Configuración del sistema (menos usada)
  const configItems = [
    {
      label: 'Finance Products',
      route: '#/financeProducts',
      icon: (
        <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
        </svg>
      ),
    },
    {
      label: 'Bank Accounts',
      route: '#/bankAccounts',
      icon: (
        <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zm-8 12h19v-3H2v3zm14-12v7h3v-7h-3zM11.5 1L2 6v2h19V6l-9.5-5z"/>
        </svg>
      ),
    },
    {
      label: 'Categorías',
      route: '#/categories',
      icon: (
        <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l-5.5 9h11z M17.5 17.5m-4.5 0a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0-9 0 M3 13.5h8v8H3z"/>
        </svg>
      ),
    },
    {
      label: 'Subcategorías',
      route: '#/subcategories',
      icon: (
        <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6h16v2H4zm4 5h12v2H8zm4 5h8v2h-8z"/>
        </svg>
      ),
    },
    {
      label: 'Locations',
      route: '#/locations',
      icon: (
        <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      ),
    },
    {
      label: 'Documents',
      route: '#/documents',
      icon: (
        <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-7-2h2v-4h-2zm0-6h2V8h-2z"/>
        </svg>
      ),
    },
  ];

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden duration-300 ease-linear lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ backgroundColor: '#1C1C2E' }}
    >
      {/* SIDEBAR HEADER */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/">
          <div className="text-white text-xl font-bold tracking-wide">
            ⚡ Energialy
          </div>
        </Link>
        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden text-white"
        >
          <svg className="fill-current" width="20" height="18" viewBox="0 0 20 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z" fill=""/>
          </svg>
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-4 py-2 px-3">

          {/* GRUPO ADMINISTRADOR (colapsable) */}
          <div className="mb-2">
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              <div className="flex items-center gap-2">
                {/* Ícono escudo/admin */}
                <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                Administrador
              </div>
              <svg
                className={`fill-current transition-transform duration-200 ${adminOpen ? 'rotate-180' : ''}`}
                width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>

            {adminOpen && (
              <ul className="mt-1 flex flex-col gap-0.5 pl-1">
                {adminItems.map((item, index) => {
                  const isActive = pathname === item.route;
                  return (
                    <li key={index}>
                      <a
                        href={item.route}
                        className="group flex items-center gap-2.5 rounded-lg py-2 px-3 text-sm font-medium transition-all duration-200"
                        style={{
                          color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                          backgroundColor: isActive ? 'rgba(236,72,153,0.25)' : 'transparent',
                          borderLeft: isActive ? '3px solid #EC4899' : '3px solid transparent',
                        }}
                        onMouseEnter={e => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)';
                            e.currentTarget.style.color = '#ffffff';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                          }
                        }}
                      >
                        <span style={{ color: isActive ? '#EC4899' : 'rgba(255,255,255,0.5)' }}>
                          {item.icon}
                        </span>
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* SEPARADOR */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '8px 12px' }} />

          {/* GRUPO CONFIGURACIÓN (colapsable, cerrado por defecto) */}
          <div className="mb-2">
            <button
              onClick={() => setConfigOpen(!configOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              <div className="flex items-center gap-2">
                <svg className="fill-current" width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                </svg>
                Configuración
              </div>
              <svg
                className={`fill-current transition-transform duration-200 ${configOpen ? 'rotate-180' : ''}`}
                width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>

            {configOpen && (
              <ul className="mt-1 flex flex-col gap-0.5 pl-1">
                {configItems.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.route}
                      className="group flex items-center gap-2.5 rounded-lg py-2 px-3 text-sm font-medium transition-all duration-200"
                      style={{ color: 'rgba(255,255,255,0.55)', borderLeft: '3px solid transparent' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                      }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.35)' }}>{item.icon}</span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
