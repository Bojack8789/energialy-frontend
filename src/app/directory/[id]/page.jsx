"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import CollapsedBar from "./components/collapsedBar";
import {
  axiosGetDetailCompany,
  axiosGetGalleryCompanyById,
  axiosGetCertificationCompanyById,
} from "@/app/Func/axios";
import Chat from "@/app/components/Chat";
const Page = ({ params: { id } }) => {
  const [company, setCompany] = useState({});
  const [gallery, setGallery] = useState([]); 
  const [certification, setCertification] = useState([]);

  useEffect(() => {
    if (id) {
      axiosGetDetailCompany(id, setCompany);
      axiosGetGalleryCompanyById(id, setGallery);
      axiosGetCertificationCompanyById(id,setCertification);
    }
  }, [id]);
  if (!company) return "loading...";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      {/* Banner */}
      <div className="relative w-full h-[180px] sm:h-[240px] mt-6 rounded-xl overflow-hidden bg-gray-200">
        {company.bannerPicture ? (
          <Image
            src={company.bannerPicture}
            alt="Company banner picture"
            fill
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="mt-6">
        <CollapsedBar title="Compañía" company={company} intState={false} />
        <CollapsedBar title="Licitaciones" company={company} intState={true} />
        <CollapsedBar title="Productos/Servicios" gallery={gallery} intState={true} />
        <CollapsedBar title="Certificaciones/Homologaciones" certification={certification} intState={true} />
      </div>
    </div>
  );
};

export default Page;
