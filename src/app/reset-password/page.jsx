import React, { Suspense } from 'react';
import ResetPasswordForm from '../components/ResetPasswordForm';

function page() {
  return (
    <div className="bg-gray-100">
      <Suspense fallback={<div>Cargando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

export default page;
