'use client';

import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/app/assets/Energialy Logo-01.svg';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useState, useEffect, useRef } from 'react';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { MdSpaceDashboard, MdOutlineLogout, MdPerson } from 'react-icons/md';
import MenuItem from './MenuItem';
import getLocalStorage from '../../Func/localStorage';
import Loader from '@/app/components/Loader';
import SubscriptionBadge from '@/app/components/SubscriptionBadge';
import { menuBar } from '@/app/data/menu';
import { bankAccountOpen } from '@/app/Func/controllers';

export default function SideBar() {
  const [user, setUser]             = useState(null);
  const [collapsed, setCollapsed]   = useState(false);
  const [itemMenu, setItemMenu]     = useState(menuBar);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const banner = user?.company?.bannerPicture || null;
  const logo   = user?.company?.profilePicture || null;

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    (async () => {
      const u = getLocalStorage();
      setUser(u);
      setItemMenu(menuBar.filter(item => item.auth.includes(u?.role)));
      try {
        const result = u?.company && await bankAccountOpen(u.company.id);
        setIsBankOpen(result);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
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

  /* ── Links Directorio/Licitaciones para el drawer mobile ── */
  const mobileTopLinks = (
    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 8px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <li>
        <Link
          href="/directory"
          style={{ display: 'block', padding: '10px 12px', fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none', borderRadius: 8 }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
        >
          Directorio
        </Link>
      </li>
      <li>
        <Link
          href="/tenders"
          style={{ display: 'block', padding: '10px 12px', fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none', borderRadius: 8 }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
        >
          Licitaciones
        </Link>
      </li>
    </ul>
  );

  /* ── Contenido interior del menú ── */
  const menuContent = (
    <>
      {banner && (
        <img
          src={banner}
          alt="Banner"
          style={{ width: '100%', maxHeight: 128, objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}
      {logo && !collapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
          <img
            src={logo}
            alt="Logo empresa"
            style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover' }}
            onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=Co&background=c7d2fe&color=3730a3&bold=true'; }}
          />
        </div>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {itemMenu.length === 0
          ? <Loader />
          : itemMenu.map((menuItem, i) => (
              <MenuItem
                key={i}
                menuItem={menuItem}
                isOpen={!collapsed}
                user={user}
                isBankAccountOpen={isBankOpen}
                onExpand={() => collapsed && setCollapsed(false)}
              />
            ))
        }
      </ul>
    </>
  );

  return (
    <>
      {/* ══════════════════════════════════════════
          HEADER FIJO — visible en todos los tamaños
         ══════════════════════════════════════════ */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isDesktop ? '0 20px' : '0 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e2e8f0',
        zIndex: 100,
      }}>
        {/* Logo ENERGIALY */}
        <Image
          src={Logo}
          alt="Energialy"
          height={36}
          style={{ width: 'auto', height: 36 }}
          priority
        />

        {/* Links centrales — Directorio y Licitaciones (ocultos en mobile, van al drawer) */}
        {isDesktop && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link
              href="/directory"
              style={{ fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#191654'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}
            >
              Directorio
            </Link>
            <Link
              href="/tenders"
              style={{ fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#191654'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}
            >
              Licitaciones
            </Link>
          </div>
        )}

        {/* Lado derecho */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>

          {/* Badge plan — solo si hay empresa */}
          {user?.company?.id && <SubscriptionBadge companyId={user.company.id} />}

          {/* Avatar + dropdown */}
          {user && (
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 4, borderRadius: 8 }}
                aria-label="Menú de usuario"
              >
                <img
                  src={user.company?.profilePicture || defaultAvatar}
                  alt="avatar"
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
                  onError={e => { e.target.src = defaultAvatar; }}
                />
                <span style={{
                  display: isDesktop ? 'inline-block' : 'none',
                  fontSize: 13, fontWeight: 500, color: '#374151',
                  maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user.company?.name || user.firstName}
                </span>
                <svg style={{ width: 14, height: 14, color: '#6b7280', transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  width: 220, background: '#fff', borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0',
                  zIndex: 200, overflow: 'hidden',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{user.company?.name || 'Sin empresa'}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{user.firstName} {user.lastName}</p>
                  </div>
                  <Link
                    href="/dashboard/ajustesProfile"
                    onClick={() => setUserMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: '#374151', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <MdPerson size={16} /> Mi perfil
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: '#374151', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <MdSpaceDashboard size={16} /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <MdOutlineLogout size={16} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Botón hamburguesa — solo mobile */}
          {!isDesktop && (
            <button
              onClick={() => setDrawerOpen(true)}
              style={{ background: '#191654', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              aria-label="Abrir menú"
            >
              <AiOutlineMenu size={22} />
            </button>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════
          MOBILE — Drawer lateral
         ══════════════════════════════════════════ */}
      {!isDesktop && (
        <Transition show={drawerOpen} as={Fragment}>
          <Dialog onClose={() => setDrawerOpen(false)}>
            {/* Overlay */}
            <TransitionChild
              as={Fragment}
              enter="transition-opacity duration-200" enterFrom="opacity-0" enterTo="opacity-100"
              leave="transition-opacity duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
            >
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110 }} />
            </TransitionChild>

            {/* Panel */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex' }}>
              <TransitionChild
                as={Fragment}
                enter="transition-transform duration-300" enterFrom="-translate-x-full" enterTo="translate-x-0"
                leave="transition-transform duration-200" leaveFrom="translate-x-0" leaveTo="-translate-x-full"
              >
                <DialogPanel style={{
                  width: 280,
                  background: '#ffffff',
                  height: '100%',
                  borderRight: '1px solid #e2e8f0',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '4px 0 16px rgba(0,0,0,0.15)',
                  paddingTop: 64,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 12px 0' }}>
                    <button
                      onClick={() => setDrawerOpen(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8 }}
                      aria-label="Cerrar menú"
                    >
                      <AiOutlineClose size={20} color="#191654" />
                    </button>
                  </div>
                  <div style={{ padding: '0 8px' }}>
                    {mobileTopLinks}
                    {menuContent}
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </Transition>
      )}

      {/* ══════════════════════════════════════════
          DESKTOP — Sidebar estático
         ══════════════════════════════════════════ */}
      {isDesktop && (
        <aside style={{
          width: collapsed ? 64 : 220,
          minHeight: '100vh',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingTop: 64,
          transition: 'width 0.3s',
          position: 'relative',
        }}>
          {/* Botón colapsar — esquina superior derecha del sidebar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 8px 0' }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{ background: '#191654', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              <AiOutlineMenu size={18} />
            </button>
          </div>
          <div style={{ padding: collapsed ? 0 : '0 8px' }}>{menuContent}</div>
        </aside>
      )}
    </>
  );
}
