'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import getLocalStorage from '../Func/localStorage';
import CompanyDashboardNew from './components/CompanyDashboardNew';

function DasboardPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const user = getLocalStorage();
    if (!user) {
      window.location.href = '/';
      return;
    }
    if (user.role === 'superAdmin') {
      router.replace('/administrador');
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
    <div className="min-h-screen">
      <CompanyDashboardNew user={user} />
    </div>
  );
}

export default DasboardPage;
