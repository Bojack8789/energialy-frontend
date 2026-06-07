'use client'
import React, {useState} from "react";
import Nav from "../components/Nav";
import EditProfile from "./components/EditProfile";
import SubscriptionSection from "./components/SubscriptionSection";

const optionsNav = ["Datos personales", "Mi Plan"];

function PageProfile() {
  const [selectedOption, setSelectedOption] = useState("");
  console.log('selectedoption profile:',selectedOption)
  console.log('optionsnav profile:',optionsNav)
  const handleOptions = (option) => {
    setSelectedOption(option);
  };


  return (
    <div className="w-full bg-white flex flex-col md:flex-row shadow min-h-screen">
      <div className="w-full md:w-1/4 md:min-w-[200px] md:max-w-[260px] border-b md:border-b-0 md:border-r border-gray-200">
        <Nav options={optionsNav} onClick={handleOptions} />
      </div>
      <div className="flex-1 p-4 sm:p-6 min-w-0">
        {selectedOption === "Mi Plan" ? (
          <SubscriptionSection />
        ) : (
          <EditProfile option={selectedOption} />
        )}
      </div>
    </div>
  );
}

export default PageProfile;
