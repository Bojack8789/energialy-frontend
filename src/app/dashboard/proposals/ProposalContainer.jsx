'use client';

import { useSelector } from 'react-redux';
import CardProposal from '@/app/components/CardProposal';
import { use } from 'react';
import getLocalStorage from '@/app/Func/localStorage';

function ProposalContainer({ proposals }) {
  // Las propuestas ya vienen filtradas por companyId desde el backend
  // Solo necesitamos verificar que existan

  if (!proposals || proposals.length === 0) {
    return (
      <div className="px-5">
        <h2 className="text-2xl font-bold mb-3">Mis propuestas</h2>
        <h1>No existen propuestas</h1>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-screen-xl mx-auto w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Mis propuestas</h2>
      {proposals.map((item, index) => (
        <CardProposal key={item.id || index} item={item} />
      ))}
    </div>
  );
}

export default ProposalContainer;
