'use client';
import { useState, useEffect } from 'react';
import getLocalStorage from '../Func/localStorage';
import CompanyDashboardNew from './components/CompanyDashboardNew';
import SuperAdminDashboard from './components/SuperAdminDashboard';

function DasboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = getLocalStorage();
    if (!user) {
      window.location.href = '/';
    }
    setUser(user);
  }, []);

  const renderDashboard = () => {
    if (!user) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      );
    }

    if (user.role === 'superAdmin') {
      return <SuperAdminDashboard user={user} />;
    }

    if (user.role === 'bank') {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="rounded-sm border border-stroke bg-white p-10 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h2 className="text-title-md font-semibold text-black dark:text-white">
              Dashboard de Banco
            </h2>
            <p className="mt-3 text-black dark:text-white">
              Funcionalidad en desarrollo
            </p>
          </div>
        </div>
      );
    }

    return <CompanyDashboardNew user={user} />;
  };

  return (
    <div className="min-h-screen bg-gray-1 dark:bg-boxdark-2 dark:text-bodydark">
      {renderDashboard()}
    </div>
  );
}

export default DasboardPage;
