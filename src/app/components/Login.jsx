'use client';

// Login.jsx — ACTUALIZADO
// Cambios respecto al original:
// 1. Guarda el accessToken en una cookie además de sessionStorage
//    (necesario para que el middleware de Next.js pueda leerlo en el servidor)
// 2. Guarda el rol del usuario en sessionStorage (para uso en el frontend)
// 3. Elimina todos los console.log de producción

import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setAccessToken, setUserData } from '../redux/features/userSlice';
import { displayFailedMessage, displaySuccessMessage } from './Toastify';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [emailError, setEmailError]     = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError]               = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadings, setLoadings]         = useState(false);

  const router   = useRouter();
  const dispatch = useDispatch();

  const handleEmailChange = (event) => {
    setEmail(event.target.value.toLowerCase());
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleEmailBlur = () => {
    if (!isValidEmail(email)) {
      setEmailError('Por favor, ingresá una dirección de correo electrónico válida.');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordBlur = () => {
    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
    } else {
      setPasswordError('');
    }
  };

  const loginValidator = () => {
    if (!email || !password) {
      setError('Por favor, completá ambos campos.');
      return false;
    } else if (!isValidEmail(email)) {
      setEmailError('Por favor, ingresá una dirección de correo electrónico válida.');
      setPasswordError('');
      setError('');
      return false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      setEmailError('');
      setError('');
      return false;
    }
    setEmailError('');
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    if (!loginValidator()) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth`,
        { email, password }
      );

      const accessToken = response.data.accessToken;

      // Obtener detalles del usuario (con el token de autorización)
      const userDetailsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users?email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      const userDetails = userDetailsResponse.data;

      // ── Guardar en sessionStorage ────────────────────────────────────────
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('userId', userDetails.id);
      sessionStorage.setItem('user', JSON.stringify(userDetails));
      // ✅ NUEVO: guardar el rol para uso en componentes del frontend
      sessionStorage.setItem('userRole', userDetails.role || '');

      if (userDetails.company) {
        sessionStorage.setItem('companyId', userDetails.company.id);
        sessionStorage.setItem('companyName', userDetails.company.name);
      }

      // ✅ NUEVO: guardar el token en una cookie HttpOnly-like para que el
      // middleware de Next.js pueda leerlo antes de renderizar /administrador.
      // SameSite=Strict protege contra CSRF. No usamos HttpOnly porque
      // necesitamos que JS también lo lea (sessionStorage ya lo tiene).
      // El token expira en 1 hora (igual que el JWT).
      const oneHour = 60 * 60;
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${oneHour}; SameSite=Strict; Secure`;

      dispatch(setUserData(userDetails));
      dispatch(setAccessToken(accessToken));

      displaySuccessMessage('Sesión iniciada');
      window.location.href = '/dashboard';

    } catch (error) {
      const errMsg = error?.response?.data?.error || '';
      if (errMsg === 'Incorrect password.') {
        displayFailedMessage('Contraseña incorrecta');
      } else if (errMsg === 'Email not registered.') {
        displayFailedMessage('El usuario no está registrado');
      } else {
        displayFailedMessage(errMsg || 'Error al iniciar sesión');
      }
    }
  };

  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
    return emailPattern.test(email);
  };

  const handleClick = () => {
    setLoadings(true);
    handleLogin().finally(() => setLoadings(false));
  };

  return (
    <div style={{ paddingTop: '24px', paddingBottom: '32px' }} className="w-full flex justify-center px-4">
      <div className="bg-white shadow-md rounded-lg w-full" style={{ maxWidth: '420px' }}>
        <h3 className="px-6 py-4 mb-0 bg-gray-100 border-b border-gray-200 text-base font-semibold rounded-t-lg text-gray-700">
          Iniciar sesión
        </h3>
        <form className="px-6 pt-5 pb-2">
          <div className="mb-4">
            <label
              htmlFor="email"
              style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500, color: '#4b5563' }}
            >
              Correo electrónico
            </label>
            <input
              type="email"
              style={{ display: 'block', width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
              id="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              required
            />
            {emailError && <p style={{ marginTop: '4px', color: '#ef4444', fontSize: '12px' }}>{emailError}</p>}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500, color: '#4b5563' }}
            >
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                style={{ display: 'block', width: '100%', padding: '8px 40px 8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                required
              />
              <button
                type="button"
                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, paddingRight: '12px', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
              </button>
            </div>
            {passwordError && <p style={{ marginTop: '4px', color: '#ef4444', fontSize: '12px' }}>{passwordError}</p>}
          </div>

          <div style={{ paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
            <button
              type="button"
              onClick={handleClick}
              disabled={loadings}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px 16px', backgroundColor: '#191654', color: 'white', fontSize: '14px', fontWeight: 600, borderRadius: '6px', border: 'none', cursor: loadings ? 'not-allowed' : 'pointer', opacity: loadings ? 0.7 : 1, transition: 'background-color 0.3s' }}
            >
              {loadings && (
                <svg style={{ animation: 'spin 1s linear infinite', height: '16px', width: '16px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Iniciar sesión
            </button>
          </div>

          {error && (
            <p style={{ textAlign: 'center', marginTop: '12px', color: '#ef4444', fontSize: '14px' }}>{error}</p>
          )}
        </form>

        <div style={{ padding: '16px 24px', textAlign: 'center' }}>
          <Link style={{ fontSize: '14px', color: '#191654' }} href="/forgot-password">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
      <ToastContainer style={{ marginTop: '100px' }} />
    </div>
  );
}
