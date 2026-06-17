import CardTender from './CardTender';
import PaginationComponent from './PaginationComponent';
import { setAllTenders } from '../redux/features/tenderSlice';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import getLocalStorage from '../Func/localStorage';

function TenderContainer({ data }) {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  const filterTenders = useSelector((state) => state.tender.filterTenders);
  const userData = getLocalStorage();
  const myCompanyId = userData?.company?.id;
  const itemsPerPage = 3;
  const totalPages = Math.ceil(filterTenders?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const tendersToShow = filterTenders?.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (data) {
      dispatch(setAllTenders(data));
    }
  }, [data]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterTenders?.length]);

  return (
    <div className="flex flex-col w-full gap-3 items-center mb-4">
      {filterTenders?.length > 0
        ? tendersToShow?.map((item) => (
            <CardTender key={item.id} item={item} isOwn={item.company?.id === myCompanyId} />
          ))
        : <h1>No existen Licitaciones</h1>
      }
      <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
}

export default TenderContainer;
