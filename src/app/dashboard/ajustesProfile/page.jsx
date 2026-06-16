'use client'
import React, {useState} from "react";
import Nav from "../components/Nav";
import EditProfile from "./components/EditProfile";
import SubscriptionSection from "./components/SubscriptionSection";
import ProfileCard from "./components/ProfileCard";

const optionsNav = ["Datos personales", "Mi Plan"];

function PageProfile() {
  // Nav envía el índice numérico de la opción (ver Nav.jsx), no el string
  const [selectedOption, setSelectedOption] = useState(0);
  const handleOptions = (option) => {
    setSelectedOption(option);
  };


  return (
    <div className="w-full bg-white flex flex-col md:flex-row shadow min-h-screen">
      <div className="w-full md:w-1/4 md:min-w-[200px] md:max-w-[260px] border-b md:border-b-0 md:border-r border-gray-200">
        <Nav options={optionsNav} onClick={handleOptions} />
      </div>
      <div className="flex-1 p-4 sm:p-6 min-w-0">
        {selectedOption === 1 ? (
          <SubscriptionSection />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-1/2">
              <EditProfile option={selectedOption} />
            </div>
            <div className="w-full lg:w-1/2">
              <ProfileCard editable />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PageProfile;
