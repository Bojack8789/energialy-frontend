'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Footer from './Footer';

export default function FooterWrapper() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const hide = pathname?.startsWith('/dashboard') || pathname?.startsWith('/administrador');
  if (hide) return null;

  return <Footer />;
}
