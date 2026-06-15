'use client';
import { useState, useEffect } from 'react';
import getLocalStorage from '../Func/localStorage';
import CompanyDashboardNew from './components/CompanyDashboardNew';

function DasboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = getLocalStorage();
    if (!user) {
      window.location.href = '/';
      return;
    }
    if (user.role === 'superAdmin' || user.role === 'admin') {
      window.location.href = '/administrador';
      return;
    }
    setUser(user);
  }, []);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-1 dark:bg-boxdark-2 dark:text-bodydark">
      <CompanyDashboardNew user={user} />
    </div>
  );
}

export default DasboardPage;
