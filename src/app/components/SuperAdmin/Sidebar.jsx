"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const trigger = useRef(null);
  const sidebar = useRef(null);

  const [adminOpen, setAdminOpen] = useState(true);

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

  const adminItems = [
    {
      label: 'Panel Administrador',
      route: '/dashboard',
      icon: (
        <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
      ),
    },
    {
      label: 'Administrar Usuarios',
      route: '/dashboard/admin/usuarios',
      icon: (
        <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      ),
    },
    {
      label: 'Administrar Empresas',
      route: '/dashboard/admin/empresas',
      icon: (
        <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
        </svg>
      ),
    },
    {
      label: 'Administrar Licitaciones',
      route: '/dashboard/admin/licitaciones',
      icon: (
        <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84l1.59 1.58L14 15.01l-3-2.99-3 2.99zm0-4l1.41 1.41L11 10.84l1.59 1.58L14 11.01l-3-2.99-3 2.99z"/>
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
                  const isActive = pathname === item.route || pathname.startsWith(item.route + '/');
                  return (
                    <li key={index}>
                      <Link
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
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>


        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
