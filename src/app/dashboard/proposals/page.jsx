'use client';
import ProposalContainer from '@/app/dashboard/proposals/ProposalContainer';
import { useGetProposalsQuery } from '@/app/redux/services/ProposalApi';
import getLocalStorage from '@/app/Func/localStorage';

function Propuestas() {
  const userData = getLocalStorage();
  const companyId = userData?.company?.id;

  const { data: proposals, isLoading } = useGetProposalsQuery(companyId);

  return <>{isLoading ? <h1>&quot;Loading...&quot;</h1> : <ProposalContainer proposals={proposals} />}</>;
  //return <h1>Propuestas</h1>
}

export default Propuestas;
