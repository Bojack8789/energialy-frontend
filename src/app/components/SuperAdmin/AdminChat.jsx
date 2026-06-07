"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const Chat = dynamic(() => import('@/app/components/Chat'), { ssr: false });

export const AdminChat = () => {
  return (
    <div style={{ margin: '20px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600', flexShrink: 0 }}>Chat General - Super Admin</h2>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Chat />
      </div>
    </div>
  );
};
