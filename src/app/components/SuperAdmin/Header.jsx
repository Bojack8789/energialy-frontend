"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';
import getLocalStorage from '@/app/Func/localStorage';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
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
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">

        {/* Left: hamburger (mobile/tablet only) */}
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${!sidebarOpen && '!w-full delay-300'}`} />
                <span className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${!sidebarOpen && 'delay-400 !w-full'}`} />
                <span className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${!sidebarOpen && '!w-full delay-500'}`} />
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${!sidebarOpen && '!h-0 !delay-[0]'}`} />
                <span className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${!sidebarOpen && '!h-0 !delay-200'}`} />
              </span>
            </span>
          </button>
        </div>

        {/* Center: title */}
        <div className="hidden sm:block">
          <h1 className="text-title-md2 font-semibold text-black dark:text-white">
            Panel de Administrador
          </h1>
        </div>

        {/* Right: theme toggle + user dropdown */}
        <div className="flex items-center gap-3 2xsm:gap-5">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4 dark:text-white"
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? (
              <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.0002 12.375C10.9127 12.375 12.4689 10.8188 12.4689 8.90625C12.4689 6.99375 10.9127 5.4375 9.0002 5.4375C7.0877 5.4375 5.53145 6.99375 5.53145 8.90625C5.53145 10.8188 7.0877 12.375 9.0002 12.375ZM9.0002 6.5625C10.2814 6.5625 11.3439 7.625 11.3439 8.90625C11.3439 10.1875 10.2814 11.25 9.0002 11.25C7.71895 11.25 6.65645 10.1875 6.65645 8.90625C6.65645 7.625 7.71895 6.5625 9.0002 6.5625Z" fill="" />
                <path d="M8.4377 0.5625C8.4377 0.28125 8.7189 0 9.0002 0C9.2814 0 9.5627 0.28125 9.5627 0.5625V2.8125C9.5627 3.09375 9.2814 3.375 9.0002 3.375C8.7189 3.375 8.4377 3.09375 8.4377 2.8125V0.5625Z" fill="" />
                <path d="M8.4377 15.1875V17.4375C8.4377 17.7188 8.7189 18 9.0002 18C9.2814 18 9.5627 17.7188 9.5627 17.4375V15.1875C9.5627 14.9063 9.2814 14.625 9.0002 14.625C8.7189 14.625 8.4377 14.9063 8.4377 15.1875Z" fill="" />
                <path d="M17.4377 8.4375H15.1877C14.9064 8.4375 14.6252 8.71875 14.6252 9C14.6252 9.28125 14.9064 9.5625 15.1877 9.5625H17.4377C17.7189 9.5625 18.0002 9.28125 18.0002 9C18.0002 8.71875 17.7189 8.4375 17.4377 8.4375Z" fill="" />
                <path d="M2.8127 9.5625H0.562695C0.281445 9.5625 0.000195312 9.28125 0.000195312 9C0.000195312 8.71875 0.281445 8.4375 0.562695 8.4375H2.8127C3.09395 8.4375 3.3752 8.71875 3.3752 9C3.3752 9.28125 3.09395 9.5625 2.8127 9.5625Z" fill="" />
              </svg>
            ) : (
              <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.9999 13.5C11.4852 13.5 13.4999 11.4853 13.4999 9C13.4999 6.51472 11.4852 4.5 8.9999 4.5C6.51462 4.5 4.4999 6.51472 4.4999 9C4.4999 11.4853 6.51462 13.5 8.9999 13.5Z" fill="" />
              </svg>
            )}
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropOpen(!dropOpen)}
              className="flex items-center gap-2 focus:outline-none"
              aria-label="Menú de usuario"
            >
              <img
                src={defaultAvatar}
                alt="avatar"
                className="h-10 w-10 rounded-full object-cover border border-stroke"
              />
              <span className="hidden text-right lg:block">
                <span className="block text-sm font-medium text-black dark:text-white">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="block text-xs text-gray-500 dark:text-bodydark">Super Admin</span>
              </span>
              <svg
                className={`hidden lg:block w-4 h-4 text-gray-500 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 dark:bg-boxdark dark:border-strokedark">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-strokedark">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-bodydark">Super Admin</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-meta-4 transition-colors"
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
      </div>
    </header>
  );
};

export default Header;
