"use client";

import dynamic from 'next/dynamic';
import TailAdminLayout from '@/app/components/SuperAdmin/TailAdminLayout';

const InboxPage = dynamic(
  () => import('@/app/dashboard/inbox/page'),
  { ssr: false }
);

export default function AdminChatPage() {
  return (
    <TailAdminLayout>
      <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <InboxPage />
      </div>
    </TailAdminLayout>
  );
}
