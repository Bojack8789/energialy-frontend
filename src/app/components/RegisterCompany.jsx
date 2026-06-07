"use client";
import React, { useState, useEffect } from "react";
import { Montserrat } from "next/font/google";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { displayFailedMessage, displaySuccessMessage } from "./Toastify";
import { annualRevenueOptions, employeeCountOptions, organizationTypes} from '@/app/data/dataGeneric'
import {handleCategoryChange, handleSubcategoryChange} from '@/app/Func/handlers'
import getLocalStorage from "../Func/localStorage";
//import { useGetLocationsQuery } from "../redux/services/locationApi";
import { urlProduction } from "@/app/data/dataGeneric";


const stepsForm = ["01", "02", "03", "04"];

export default function RegisterCompany() {
  const router = useRouter();
  const user = getLocalStorage();

  // ------------ Estados Locales ---------------------//
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [foundationYear, setfoundationYear] = useState("");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [cuit, setCuit] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);


  //-------------- Funciones para traer las opciones del form --------------//
  const [locationsOptions, setLocationsOptions] = useState([]);
  const [subcategoriesOptions, setSubcategoriesOptions] = useState([]);
  const [subcategorySelected, setSubcategorySelected] = useState([]);
  const [stepCompletion, setStepCompletion] = useState([false, false, false, false]);
  const [errorMessages, setErrorMessages] = useState({
    step1: "",
    step2: "",
    step3: "",
    step4: "",
  });
  
  //const { data: locations, isLoading } = useGetLocationsQuery();


  const getLocation = async () => {
    try {
      const response = await axios.get(`${urlProduction}/locations`);
      const transformedData = response.data.map((item) => ({
        id: item.id,
        name: item.name,
      }));
      setLocationsOptions(transformedData);
      console.log("Locations: ", transformedData);
    } catch (error) {
      console.log("Error al traer las ubicaciones: ", error);
      throw error;
    }
  };

  

  const getCategories = async () => {
    try {
      const response = await axios.get(`${urlProduction}/categories`);
      const transformedData = response.data.map((item) => ({
        id: item.id,
        name: item.name,
      }));
      setCategories(transformedData);
      console.log("Categories: ", transformedData);
    } catch (error) {
      console.log("Error al traer las categorias: ", error);
      throw error;
    }
  };

  const getSubcategories = async () => {
    try {
      const response = await axios.get(`${urlProduction}/subcategories`);
      const transformedData = response.data.map((item) => ({
        id: item.id,
        name: item.name,
        categoryId: item.parentCategory.id,
      }));
      setSubcategories(transformedData);
      console.log('Subcategories: ', transformedData)
    } catch (error) {
      console.log("Error al traer las subcategorias: ", error);
      throw error;
    }
  };

  useEffect(() => {
    getLocation();
    getSubcategories();
    getCategories();
  }, []);

  // -------- Handlers de campos ----------------- //

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    console.log('categoryId:',categoryId)
    const filteredSubcategories = subcategories.filter(
      (subcategory) => subcategory.categoryId === categoryId
    );
    setSubcategoriesOptions(filteredSubcategories);
    console.log('nuevas opciones de subcat:',filteredSubcategories)
  };

  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value;
    setSubcategorySelected((prevSubcategories) => {
      if (prevSubcategories.includes(subcategoryId)) {
        return prevSubcategories.filter(id => id !== subcategoryId);
      } else {
        return [...prevSubcategories, subcategoryId];
      }
    });
    console.log('Subcategorias seleccionadas:', subcategoryId)
  };
  console.log('Estado subcategorySelected:', subcategorySelected)

  const handleSubmit = async (e) => {
    e.preventDefault();

    const companyData = {
      name,
      description,
      locations,
      subcategories: subcategorySelected,
      foundationYear,
      annualRevenue,
      employeeCount,
      cuit,
      profilePicture,
      bannerPicture,
      organizationType,
      userId: user.id,
    };

    console.log("Datos enviados en companyData:", companyData);


    try {
      const response = await axios.post(
        `${urlProduction}/companies`,
        companyData,
        {
          headers: {
            "Content-Type": "application/json", // Cambiado a JSON
          },
        }
      );
      console.log("Respuesta del servidor:", response);

      // Actualizar el sessionStorage con la información de la empresa
      const createdCompany = response.data;
      const currentUser = getLocalStorage();

      // Actualizar el objeto user con la empresa
      const updatedUser = {
        ...currentUser,
        company: {
          id: createdCompany.id,
          name: createdCompany.name,
          profilePicture: createdCompany.profilePicture,
          bannerPicture: createdCompany.bannerPicture,
          description: createdCompany.description,
        }
      };

      // Guardar en sessionStorage
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      sessionStorage.setItem('companyId', createdCompany.id);
      sessionStorage.setItem('companyName', createdCompany.name);

      displaySuccessMessage("Empresa registrada con éxito");

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error al registrar la empresa:", error);
      console.log("Datos enviados en companyData:", companyData);
      displayFailedMessage(error.response.data.error);
    }
  };

  // ------------------------ Cloudinary ----------------------------//

  const [profilePicture, setProfilePicture] = useState("");
  const [bannerPicture, setBannerPicture] = useState("");
  const [profilePictureError, setProfilePictureError] = useState("");
  const [bannerPictureError, setBannerPictureError] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadImage = async (e, imageType) => {
    const files = e.target.files;
    const data = new FormData();
    data.append("file", files[0]);
    data.append("upload_preset", "energialy_users");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dbraa6jpj/image/upload",
        data  
      );
      const file = res.data;
      console.log("Respuesta de cloudinary:", res);

      if (imageType === "profile") {
        setProfilePicture(file.secure_url);
      } else if (imageType === "banner") {
        setBannerPicture(file.secure_url);
      }

      setLoading(false);
    } catch (error) {
      console.log("Error al cargar la imagen:", error);
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------------ //

  return (
    <div className="flex flex-col">
      {/* BANNER */}
      <div className="relative mb-4 min-h-[160px] sm:min-h-[220px] bg-[#191654] overflow-hidden">
        <img
          src="https://energialy.ar/uploads/settings/home//Back-Acceso-Denegado.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 flex items-center justify-center h-full min-h-[160px] sm:min-h-[220px] px-4 text-center text-white font-poppins">
          <div>
            <h2 className="mb-2 text-2xl sm:text-4xl font-bold">Registrá tu empresa en</h2>
            <h2 className="text-2xl sm:text-4xl font-bold">Energialy</h2>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}

      <div className="w-full">
        <div className="my-8 sm:my-12 w-full max-w-3xl mx-auto px-4 sm:px-6">
          <form
            className="bg-white rounded-xl shadow-sm p-6 sm:p-8"
            onSubmit={handleSubmit}
          >
            <div className="items-center mb-3">
              <div className="w-full mx-auto text-center mb-8 sm:mb-12 font-poppins">
                <h3 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-bold leading-7 text-gray-800">
                  Indicános algunos datos
                </h3>
                <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-6 text-gray-600">
                  Luego podrás completar el perfil desde tu cuenta.
                </p>
              </div>

              <div className="flex items-center justify-center flex-grow">
                <ul className="flex p-0 mb-5 gap-2 sm:gap-4">
                  {stepsForm.map((option, index) => (
                    <li key={index}>
                      <a
                        onClick={() => setStep(index + 1)}
                        className={`no-underline w-8 h-8 sm:w-10 sm:h-10 cursor-pointer flex items-center justify-center rounded-full border-2 border-solid font-bold text-xs leading-[38px] font-poppins ${
                          step === index + 1
                            ? "border-[#191654] text-[#191654]"
                            : "text-gray-400 border-gray-400"
                        }`}
                      >
                        {option}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              {step === 1 && (
                <div>
                  <div className="mb-3">
                    <input
                      type="text"
                      id="name"
                      placeholder="Nombre de la empresa"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 text-base border border-gray-300 rounded focus:outline-none focus:border-[#191654] placeholder:text-gray-500"
                    />
                  </div>
                  <div className="mb-3">
                    <textarea
                      id="description"
                      placeholder="Descripción de la empresa"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2.5 text-base border border-gray-300 rounded resize-y focus:outline-none focus:border-[#191654] placeholder:text-gray-500"
                      rows="4" // Puedes ajustar la cantidad de filas aquí
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="mb-3">
                      <input
                        type="number"
                        id="foundationYear"
                        placeholder="Año de fundación (ej. 1990)"
                        value={foundationYear}
                        onChange={(e) => setfoundationYear(e.target.value)}
                        className={`w-full px-3 py-2.5 text-base border rounded placeholder:text-gray-500 focus:outline-none ${
                          foundationYear.length === 4
                            ? "border-green-500 focus:border-green-600"
                            : foundationYear.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-[#191654]"
                        }`}
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="text"
                        id="cuit"
                        placeholder="CUIT de la empresa"
                        value={cuit}
                        onChange={(e) => setCuit(e.target.value)}
                        className="w-full px-3 py-2.5 text-base border border-gray-300 rounded focus:outline-none focus:border-[#191654] placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={handleNextStep}
                      className="w-full sm:w-auto px-6 py-2.5 text-white bg-[#191654] rounded hover:bg-secondary-600 transition duration-300"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <div className="space-y-2">
                    <div className="mb-3">
                      <label className="block mb-2 font-semibold text-gray-700">Tipo de Organización</label>
                      <div className="flex flex-wrap">
                        {organizationTypes.map((type, index) => (
                          <div key={index} className="w-1/2 mb-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                id={`organizationType${index}`}
                                value={type}
                                checked={organizationType === type}
                                onChange={(e) =>
                                  setOrganizationType(e.target.value)
                                }
                              />
                              <span className="ml-2">{type}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 font-semibold text-sm sm:text-base text-gray-700">Ingresos Anuales</label>
                        {annualRevenueOptions.map((option, index) => (
                          <div key={index} className="mb-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                value={option}
                                checked={annualRevenue === option}
                                onChange={(e) =>
                                  setAnnualRevenue(e.target.value)
                                }
                              />
                              <span className="ml-2">{option}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-sm sm:text-base text-gray-700">
                          Cantidad de Empleados
                        </label>
                        {employeeCountOptions.map((option, index) => (
                          <div key={index} className="mb-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                value={option}
                                checked={employeeCount === option}
                                onChange={(e) =>
                                  setEmployeeCount(e.target.value)
                                }
                              />
                              <span className="ml-2">{option}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <button
                        onClick={() => setStep(step - 1)}
                        className="w-full sm:w-auto px-6 py-2.5 text-gray-500 transition duration-300 bg-gray-200 rounded hover:bg-secondary-600 hover:text-white"
                      >
                        Volver
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="w-full sm:w-auto px-6 py-2.5 text-white bg-[#191654] rounded hover:bg-secondary-600 transition duration-300"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <div className="mb-3">
                    <label className="block mb-2 font-semibold text-sm sm:text-base text-gray-700">
                      Seleccionar ubicaciones
                    </label>
                    <div className="flex flex-wrap">
                      {locationsOptions.map((option) => (
                        <div key={option.id} className="w-full sm:w-1/2 mb-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              value={option.id}
                              checked={locations.includes(option.id)}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setLocations((prevLocations) =>
                                  isChecked
                                    ? [...prevLocations, option.id]
                                    : prevLocations.filter(
                                        (id) => id !== option.id
                                      )
                                );
                              }}
                            />
                            <span className="ml-2">{option.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <select
                      value=''
                      onChange={handleCategoryChange} 
                      className="w-full px-3 py-2.5 text-base border border-gray-300 rounded focus:outline-none focus:border-[#191654] text-gray-700"
                    >
                      <option value="">Seleccione una categoria</option>
                      {categories?.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="block mb-2 font-semibold text-sm sm:text-base text-gray-700">Subcategorías</label>
                    <div className="flex flex-wrap">
                      {subcategoriesOptions.map((option) => (
                        <div key={option.id} className="w-full sm:w-1/2 mb-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              value={option.id}
                              checked={subcategorySelected.includes(option.id)}
                              onChange={handleSubcategoryChange}
                            />
                            <span className="ml-2">{option.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={() => setStep(step - 1)}
                      className="w-full sm:w-auto px-6 py-2.5 text-gray-500 transition duration-300 bg-gray-200 rounded hover:bg-secondary-600 hover:text-white"
                    >
                      Volver
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="w-full sm:w-auto px-6 py-2.5 text-white bg-[#191654] rounded hover:bg-secondary-600 transition duration-300"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
              {step === 4 && (
                <div>
                  <div className="mb-3">
                    <label htmlFor="profilePicture" className="block mb-2 font-semibold text-sm sm:text-base text-gray-700">Foto de Perfil</label>
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={(e) => uploadImage(e, "profile")}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:border-[#191654]"
                    />
                    {profilePictureError && (
                      <p className="text-sm text-red-500">
                        {profilePictureError}
                      </p>
                    )}
                    {loading ? (
                      <h3 className="text-sm sm:text-base">Cargando Imagenes...</h3>
                    ) : (
                      profilePicture && <img src={profilePicture} className="w-full max-w-xs mt-2 rounded" alt="Preview" />
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="bannerPicture" className="block mb-2 font-semibold text-sm sm:text-base text-gray-700">Banner</label>
                    <input
                      type="file"
                      id="bannerPicture"
                      accept="image/*"
                      onChange={(e) => uploadImage(e, "banner")}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:border-[#191654]"
                    />
                    {bannerPictureError && (
                      <p className="text-sm text-red-500">
                        {bannerPictureError}
                      </p>
                    )}
                    {loading ? (
                      <h3 className="text-sm sm:text-base">Cargando Imagenes...</h3>
                    ) : (
                      bannerPicture && <img src={bannerPicture} className="w-full max-w-xs mt-2 rounded" alt="Preview" />
                    )}
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={() => setStep(step - 1)}
                      className="w-full sm:w-auto px-6 py-2.5 text-gray-500 transition duration-300 bg-gray-200 rounded hover:bg-secondary-600 hover:text-white"
                    >
                      Volver
                    </button>
                    <button
                      className="w-full sm:w-auto px-6 py-2.5 text-white bg-[#191654] rounded hover:bg-secondary-600 transition duration-300"
                      type="submit"
                    >
                      Registrarse
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
        <ToastContainer style={{ marginTop: "100px" }} />
      </div>
    </div>
  );
}
