'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from './Navigation';

export default function NavigationWrapper() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // No renderizar nada hasta que el cliente sepa la ruta real
  if (!mounted) return null;

  const hide = pathname?.startsWith('/dashboard') || pathname?.startsWith('/administrador');
  if (hide) return null;

  return <Navigation />;
}
