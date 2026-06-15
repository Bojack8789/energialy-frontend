"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { MdOutlineLogout, MdSpaceDashboard, MdPeople, MdBusiness, MdDescription, MdChat } from 'react-icons/md';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import Logo from '@/app/assets/Energialy Logo-01.svg';
import getLocalStorage from '@/app/Func/localStorage';

const adminItems = [
  { label: 'Panel Administrador', route: '/administrador', icon: <MdSpaceDashboard size={22} /> },
  { label: 'Administrar Usuarios', route: '/dashboard/admin/usuarios', icon: <MdPeople size={22} /> },
  { label: 'Administrar Empresas', route: '/dashboard/admin/empresas', icon: <MdBusiness size={22} /> },
  { label: 'Administrar Licitaciones', route: '/dashboard/admin/licitaciones', icon: <MdDescription size={22} /> },
  { label: 'Chat', route: '/dashboard/inbox', icon: <MdChat size={22} /> },
];

export default function TailAdminLayout({ children }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setUser(getLocalStorage());
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const accessToken = sessionStorage.getItem('accessToken');
    try {
      await fetch(`${baseUrl}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      });
    } catch (err) {
      console.error(err);
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

  const menuContent = (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {adminItems.map((item, i) => {
        const isActive = pathname === item.route || pathname.startsWith(item.route + '/');
        return (
          <li key={i}>
            <Link
              href={item.route}
              onClick={() => setDrawerOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 12,
                padding: '8px 10px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#191654' : '#374151',
                backgroundColor: isActive ? '#eef2ff' : 'transparent',
                transition: 'all 0.15s',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span style={{ color: isActive ? '#191654' : '#6b7280', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* HEADER FIJO */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64,
        background: '#ffffff', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderBottom: '1px solid #e2e8f0', zIndex: 100,
      }}>
        <Image src={Logo} alt="Energialy" height={36} style={{ width: 'auto', height: 36 }} priority />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 4, borderRadius: 8 }}
              >
                <img src={defaultAvatar} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.firstName} {user.lastName}
                </span>
                <svg style={{ width: 14, height: 14, color: '#6b7280', transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 220,
                  background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  border: '1px solid #e2e8f0', zIndex: 200, overflow: 'hidden',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{user.firstName} {user.lastName}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>Administrador</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <MdOutlineLogout size={16} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}

          {!isDesktop && (
            <button
              onClick={() => setDrawerOpen(true)}
              style={{ background: '#191654', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <AiOutlineMenu size={22} />
            </button>
          )}
        </div>
      </header>

      {/* MOBILE — Drawer lateral */}
      {!isDesktop && (
        <Transition show={drawerOpen} as={Fragment}>
          <Dialog onClose={() => setDrawerOpen(false)}>
            <TransitionChild
              as={Fragment}
              enter="transition-opacity duration-200" enterFrom="opacity-0" enterTo="opacity-100"
              leave="transition-opacity duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
            >
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110 }} />
            </TransitionChild>
            <div style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex' }}>
              <TransitionChild
                as={Fragment}
                enter="transition-transform duration-300" enterFrom="-translate-x-full" enterTo="translate-x-0"
                leave="transition-transform duration-200" leaveFrom="translate-x-0" leaveTo="-translate-x-full"
              >
                <DialogPanel style={{
                  width: 280, background: '#ffffff', height: '100%',
                  borderRight: '1px solid #e2e8f0', overflowY: 'auto',
                  display: 'flex', flexDirection: 'column',
                  boxShadow: '4px 0 16px rgba(0,0,0,0.15)', paddingTop: 64,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 12px 0' }}>
                    <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8 }}>
                      <AiOutlineClose size={20} color="#191654" />
                    </button>
                  </div>
                  <div style={{ padding: '0 8px' }}>{menuContent}</div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </Transition>
      )}

      {/* DESKTOP — Sidebar + contenido */}
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', paddingTop: 64 }}>
        {isDesktop && (
          <aside style={{
            width: collapsed ? 64 : 220,
            minHeight: '100vh', background: '#ffffff',
            borderRight: '1px solid #e2e8f0', flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto', overflowX: 'hidden', transition: 'width 0.3s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 8px 0' }}>
              <button
                onClick={() => setCollapsed(!collapsed)}
                style={{ background: '#191654', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <AiOutlineMenu size={18} />
              </button>
            </div>
            <div style={{ padding: collapsed ? '0 4px' : '0 8px', marginTop: 8 }}>{menuContent}</div>
          </aside>
        )}
        <div style={{ flex: 1, width: 0, overflowX: 'hidden', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </>
  );
}
