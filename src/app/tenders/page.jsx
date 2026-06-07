'use client';

import FilterBar from '../components/FilterBar';
import { useGetTendersQuery } from '@/app/redux/services/tendersApi';
import TenderContainer from '../components/TenderContainer';

function Page() {
  const { data, isLoading } = useGetTendersQuery();

  return (
    <>
      <div className="mt-8 mb-8 w-full max-w-7xl mx-auto flex px-4">
        <div className="hidden md:w-80 md:flex-shrink-0 md:flex md:justify-center md:mr-6">
          <FilterBar />
        </div>
        <div className="flex flex-col w-full min-w-0">
          {isLoading ? <h1>Cargando...</h1> : <TenderContainer data={data} />}
        </div>
      </div>
    </>
  );
}

export default Page;
