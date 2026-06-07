"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ImpersonationSelector = () => {
  const [companies, setCompanies] = useState([]);
  const [impersonatedCompany, setImpersonatedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchImpersonationStatus();
    fetchCompanies();
  }, []);

  const fetchImpersonationStatus = async () => {
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/impersonate/status`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: 'include' }
      );
      const data = await res.json();
      if (data.isImpersonating) {
        setImpersonatedCompany(data.company);
      }
    } catch (error) {
      console.error('Error fetching impersonation status:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/companies?limit=200&isActive=true`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async (companyId) => {
    if (!companyId) return;

    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/impersonate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({ companyId })
        }
      );

      if (!res.ok) throw new Error('Error al impersonar empresa');

      const data = await res.json();
      setImpersonatedCompany(data.company);

      // Redirigir al dashboard de la empresa
      router.push('/dashboard');
    } catch (error) {
      console.error('Error impersonating company:', error);
      alert('Error al impersonar empresa');
    }
  };

  const handleStopImpersonation = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/impersonate`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        }
      );

      if (!res.ok) throw new Error('Error al finalizar impersonación');

      setImpersonatedCompany(null);

      // Redirigir al panel admin
      router.push('/administrador');
    } catch (error) {
      console.error('Error stopping impersonation:', error);
      alert('Error al finalizar impersonación');
    }
  };

  if (loading) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {!impersonatedCompany ? (
        <select
          onChange={(e) => handleImpersonate(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            fontSize: '14px',
            backgroundColor: 'white',
            cursor: 'pointer',
            minWidth: '200px'
          }}
          defaultValue=""
        >
          <option value="" disabled>🔍 Ver como empresa...</option>
          {companies.map(company => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#fff3cd',
          padding: '8px 16px',
          borderRadius: '6px',
          border: '1px solid #ffc107'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>
            🔍 Viendo como: <strong>{impersonatedCompany.name}</strong>
          </span>
          <button
            onClick={handleStopImpersonation}
            style={{
              padding: '4px 12px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#ffc107',
              color: '#000',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Volver al Admin
          </button>
        </div>
      )}
    </div>
  );
};

export default ImpersonationSelector;
