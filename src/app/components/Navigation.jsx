"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/app/assets/Energialy Logo-01.svg";
import SubscriptionBadge from "./SubscriptionBadge";
import getLocalStorage from "../Func/localStorage";
import { MdSpaceDashboard, MdOutlineLogout } from "react-icons/md";

export default function Navigation() {
  const [user, setUser]       = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const pathname = usePathname() || "/";
  const router   = useRouter();
  const userRef  = useRef(null);

  useEffect(() => {
    setUser(getLocalStorage());
  }, []);

  // Cierra el dropdown de usuario al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cierra menú mobile al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const baseUrl     = process.env.NEXT_PUBLIC_BASE_URL;
    const accessToken = sessionStorage.getItem("accessToken");
    try {
      await fetch(`${baseUrl}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("companyId");
    sessionStorage.removeItem("companyName");
    document.cookie = "accessToken=; path=/; max-age=0; SameSite=Strict; Secure";
    window.location.href = "/login";
  };

  const navLink = (href, label) => (
    <button
      key={href}
      onClick={() => { router.push(href); setMenuOpen(false); }}
      className={`text-sm font-medium transition-colors duration-200 ${
        pathname === href
          ? "text-secondary-500 border-b-2 border-secondary-500 pb-0.5"
          : "text-gray-700 hover:text-secondary-500"
      }`}
    >
      {label}
    </button>
  );

  const mobileNavLink = (href, label) => (
    <button
      key={href}
      onClick={() => { router.push(href); setMenuOpen(false); }}
      className={`w-full text-left px-4 py-3 text-base font-medium border-l-4 transition-colors duration-150 ${
        pathname === href
          ? "border-secondary-500 bg-secondary-100 text-secondary-600"
          : "border-transparent text-gray-700 hover:bg-gray-50 hover:border-secondary-300"
      }`}
    >
      {label}
    </button>
  );

  // Calcula los links según rol
  const getDesktopLinks = () => {
    if (!user) return null;
    if (user.role === "superAdmin") return (
      <>
        {navLink("/administrador", "Administrador")}
        {navLink("/directory", "Directorio")}
        {navLink("/tenders", "Licitaciones")}
        {user.company?.id && <SubscriptionBadge companyId={user.company.id} />}
      </>
    );
    if (user.company?.id) return (
      <>
        {navLink("/directory", "Directorio")}
        {navLink("/tenders", "Licitaciones")}
        <SubscriptionBadge companyId={user.company.id} />
      </>
    );
    return (
      <Link
        href="/registerCompany"
        className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-secondary-500 transition-colors duration-200 no-underline"
      >
        Registra tu empresa
      </Link>
    );
  };

  const getMobileLinks = () => {
    if (!user) return null;
    if (user.role === "superAdmin") return (
      <>
        {mobileNavLink("/administrador", "Administrador")}
        {mobileNavLink("/directory", "Directorio")}
        {mobileNavLink("/tenders", "Licitaciones")}
        {user.company?.id && (
          <div className="px-4 py-3 border-t border-gray-100">
            <SubscriptionBadge companyId={user.company.id} />
          </div>
        )}
      </>
    );
    if (user.company?.id) return (
      <>
        {mobileNavLink("/directory", "Directorio")}
        {mobileNavLink("/tenders", "Licitaciones")}
        <div className="px-4 py-3 border-t border-gray-100">
          <SubscriptionBadge companyId={user.company.id} />
        </div>
      </>
    );
    return mobileNavLink("/registerCompany", "Registra tu empresa");
  };

  const defaultAvatar = user
    ? `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=c7d2fe&color=3730a3&bold=true`
    : "";

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* ── Top bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button
            onClick={() => router.push(user ? "/dashboard" : "/")}
            className="flex items-center focus:outline-none"
            aria-label="Inicio"
          >
            <Image src={Logo} alt="Energialy" height={38} style={{ width: "auto", height: "38px" }} priority />
          </button>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-6">
            {user ? (
              <>
                {getDesktopLinks()}

                {/* User dropdown */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserOpen(!userOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                    aria-label="Menú de usuario"
                  >
                    <img
                      src={user.company?.profilePicture || defaultAvatar}
                      alt="avatar"
                      className="w-9 h-9 rounded-full object-cover border border-gray-200"
                      onError={(e) => { e.target.src = defaultAvatar; }}
                    />
                    <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      {user.company?.name || user.firstName}
                    </span>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${userOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">{user.company?.name || "Sin empresa"}</p>
                        <p className="text-xs text-gray-500 truncate">{user.firstName} {user.lastName}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 no-underline"
                      >
                        <MdSpaceDashboard className="text-base" /> Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <MdOutlineLogout className="text-base" /> Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {navLink("/directory", "Directorio")}
                {navLink("/tenders", "Licitaciones")}
                <Link href="/login" className={`text-sm font-medium no-underline transition-colors duration-200 ${pathname === "/login" ? "text-primary-500 border-b-2 border-primary-500 pb-0.5" : "text-gray-700 hover:text-primary-500"}`}>
                  Iniciar Sesión
                </Link>
                <Link href="/register" className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-secondary-500 transition-colors duration-200 no-underline">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 rounded-md text-primary-500 hover:bg-gray-100 focus:outline-none"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile panel ── */}
      {menuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="flex flex-col py-2">
            {user ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <img
                    src={user.company?.profilePicture || defaultAvatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    onError={(e) => { e.target.src = defaultAvatar; }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user.company?.name || "Sin empresa"}</p>
                    <p className="text-xs text-gray-500">{user.firstName} {user.lastName}</p>
                  </div>
                </div>

                {getMobileLinks()}

                {/* Dashboard link */}
                <button
                  onClick={() => { router.push("/dashboard"); setMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-2 px-4 py-3 text-base font-medium text-gray-700 border-l-4 border-transparent hover:bg-gray-50 hover:border-secondary-300 border-t border-gray-100 mt-1"
                >
                  <MdSpaceDashboard className="text-lg" /> Dashboard
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-3 text-base font-medium text-red-600 border-l-4 border-transparent hover:bg-red-50 hover:border-red-400"
                >
                  <MdOutlineLogout className="text-lg" /> Cerrar sesión
                </button>
              </>
            ) : (
              <>
                {mobileNavLink("/directory", "Directorio")}
                {mobileNavLink("/tenders", "Licitaciones")}
                {mobileNavLink("/login", "Iniciar Sesión")}
                {mobileNavLink("/register", "Registrarse")}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
