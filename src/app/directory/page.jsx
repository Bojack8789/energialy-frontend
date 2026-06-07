'use client'
import CompanyCardContainer from "../components/CompanyCardContainer";
import FilterBar from "../components/FilterBar";
import PaginationComp from "../components/Pagination";
import { setAllCompanies } from "@/app/redux/features/companieSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { urlProduction } from "../data/dataGeneric";

function Page() {

 const dispatch = useDispatch();
   
  useEffect(() => {
    fetch(`${urlProduction}/companies`)
      .then((response) => response.json())
      .then((data) => dispatch(setAllCompanies(data)))
      .catch((error) => console.error("Error fetching data:", error));
  }, [dispatch]);


  return (
    <>
      <div className="mt-8 mb-0 w-full max-w-7xl mx-auto flex px-4">
        <div className="hidden md:w-80 md:flex-shrink-0 md:flex md:justify-center md:mr-6">
          <FilterBar />
        </div>
        <div className="flex flex-col w-full min-w-0">
          <CompanyCardContainer />
        </div>
      </div>
    </>
  );
}

export default Page