"use client";
import { useGetCategoriesQuery } from "@/app/redux/services/categoriesApi";
import { useGetLocationsQuery } from "@/app/redux/services/locationApi";
import { Card, Typography } from "@material-tailwind/react";
import { FormGroup } from "react-bootstrap";
import Select from "react-select";
import { useState, useEffect } from "react";
import { getAccessToken, getUserId } from "@/app/Func/sessionStorage";
import {
  duration,
  etapa,
  tendersTypes,
  exampleCategories,
  exampleLocations,
  urlProduction,
} from "@/app/data/dataGeneric";
import axios from "axios";
import {
  displayFailedMessage,
  displaySuccessMessage,
} from "@/app/components/Toastify";
import ErrorMensage from "@/app/components/ErrorMensage";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import getLocalStorage from "@/app/Func/localStorage";
import LimitExceededModal from "@/app/components/LimitExceededModal";
import ToggleSwitch from "@/app/components/ToggleSwitch";
import { useGetCompanyMetricsQuery } from "@/app/redux/services/metricsApi";

function CreateTenderForm() {
  //fetch states
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const { data: locations, isLoading: loadingLocations } =
    useGetLocationsQuery();

  // Usar datos de ejemplo si no hay conectividad
  const displayCategories =
    categories && categories.length > 0 ? categories : exampleCategories;
  const locationsArray = Array.isArray(locations) ? locations : (locations?.value ?? []);
  const displayLocations = locationsArray.length > 0 ? locationsArray : exampleLocations;

  const userData = getLocalStorage();

  const { data: metricsData } = useGetCompanyMetricsQuery(
    { companyId: userData?.company?.id },
    { skip: !userData?.company?.id }
  );
  const canCreatePrivate = metricsData?.plan?.canCreatePrivate ?? false;
  const canFeatureTender = metricsData?.plan?.featuredInDirectory ?? false;

  const router = useRouter();

  // Control de acceso: colaboradores necesitan permiso LICITACIONES
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    const checkLicitacionesPermission = async () => {
      if (!userData) return;
      // Owners, admins y superAdmins siempre tienen acceso
      if (userData.role !== "company_collaborator") return;
      try {
        const token = getAccessToken();
        const userId = getUserId();
        if (!token || !userId) { setHasPermission(false); return; }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}/permissions`,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        if (response.ok) {
          const data = await response.json();
          setHasPermission(Array.isArray(data.permissions) && data.permissions.includes("LICITACIONES_PROPIAS"));
        } else {
          setHasPermission(false);
        }
      } catch (error) {
        console.error("Error verificando permisos de licitaciones:", error);
        setHasPermission(false);
      }
    };
    checkLicitacionesPermission();
  }, []);

  //local states
  const [tenderData, setTenderData] = useState({
    title: "",
    description: "",
    contractType: "",
    budget: 0,
    showBudget: true,
    public: true,
    majorSector: "",
    projectDuration: "",
    validityDate: "",
    locationId: "",
    subcategories: [],
    address: "",
    companyId: userData?.company.id,
    files: [],
    customFields: [], // Campos personalizados
    servicePrices: [], // array de servicios con precios
  });

  const [inputError, setInputError] = useState({
    title: "",
    description: "",
    contractType: "",
    budget: "",
    majorSector: "",
    projectDuration: "",
    validityDate: "",
    locationId: "",
    subcategories: "",
    files: [],
    customFields: "",
    servicePrices: "",
  });
  const [categorieSelected, setCategorieSelected] = useState([]);
  const [subCatSelected, setSubCatSelected] = useState([]);
  const [isShow, setIsShow] = useState(true);
  const [isPrivateCheqed, setIsPrivateCheqed] = useState(false);
  const [isSponsoredCheqed, setIsSponsoredCheqed] = useState(false);
  const [editorValue, setEditorValue] = useState("");
  const [fileName, setFileName] = useState("");
  const [limitExceededModal, setLimitExceededModal] = useState({
    isOpen: false,
    limitInfo: null,
  });

  // Estados para campos personalizados
  const [customFields, setCustomFields] = useState([]);
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [newField, setNewField] = useState({
    type: "text", // text, textarea, select, radio, number, date
    label: "",
    placeholder: "",
    required: false,
    options: [], // Para select y radio
  });

  // Estados para servicios y precios
  const [servicePrices, setServicePrices] = useState([]);

  //Handlers
  const handleChangeCategories = (e) => {
    //crear las subcategorias para el select
    const subcategories =
      displayCategories?.find((cat) => cat.id === e.value)?.subcategories || [];
    setSubCatSelected(
      subcategories.map((subcat) => ({ name: subcat.name, value: subcat.id }))
    );
  };
  const handleSubcategorieChange = (e) => {
    const arr = [];
    arr.push(e.value);
    setTenderData({ ...tenderData, subcategories: arr });
  };

  const handleChangeLocation = (e) => {
    setTenderData({ ...tenderData, locationId: e.value });
  };
  const handlePrivateChange = (e) => {
    if (!canCreatePrivate) return;
    const newValue = !isPrivateCheqed;
    setIsPrivateCheqed(newValue);
    setTenderData({ ...tenderData, public: !newValue });
  };

  const handleSponsoredChange = (e) => {
    if (!canFeatureTender) return;
    setIsSponsoredCheqed(!isSponsoredCheqed);
  };

  const handleShowChange = () => {
    const newValue = !isShow;
    setIsShow(newValue);
    setTenderData({ ...tenderData, showBudget: newValue });
  };

  // const handleDescriptionChange = (data) => {
  //   setTenderData({ ...tenderData, description: data });
  // }

  const handleInputsChanges = (e) => {
    setTenderData({ ...tenderData, [e.target.name]: e.target.value });
    console.log(tenderData);
  };

  // Handlers para campos personalizados
  const handleAddCustomField = () => {
    if (newField.label.trim() === "") return;

    const fieldToAdd = {
      id: Date.now(), // ID temporal
      ...newField,
      options:
        newField.type === "select" || newField.type === "radio"
          ? newField.options
          : [],
    };

    setCustomFields([...customFields, fieldToAdd]);
    setTenderData({
      ...tenderData,
      customFields: [...customFields, fieldToAdd],
    });

    // Reset form
    setNewField({
      type: "text",
      label: "",
      placeholder: "",
      required: false,
      options: [],
    });
    setShowCustomFieldModal(false);
  };

  const handleRemoveCustomField = (fieldId) => {
    const updatedFields = customFields.filter((field) => field.id !== fieldId);
    setCustomFields(updatedFields);
    setTenderData({ ...tenderData, customFields: updatedFields });
  };

  const handleAddOption = () => {
    setNewField({
      ...newField,
      options: [...newField.options, ""],
    });
  };

  const handleUpdateOption = (index, value) => {
    const updatedOptions = [...newField.options];
    updatedOptions[index] = value;
    setNewField({ ...newField, options: updatedOptions });
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = newField.options.filter((_, i) => i !== index);
    setNewField({ ...newField, options: updatedOptions });
  };

  // Handlers para servicios y precios
  const handleAddServicePrice = () => {
    const newService = {
      id: Date.now(),
      name: "",
      description: "",
      price: "",
      priceType: "fixed", // 'fixed' o 'per_day'
    };
    setServicePrices([...servicePrices, newService]);
    setTenderData({
      ...tenderData,
      servicePrices: [...servicePrices, newService],
    });
  };

  const handleUpdateServicePrice = (serviceId, field, value) => {
    const updatedServices = servicePrices.map((service) =>
      service.id === serviceId ? { ...service, [field]: value } : service
    );
    setServicePrices(updatedServices);
    setTenderData({ ...tenderData, servicePrices: updatedServices });
  };

  const handleRemoveServicePrice = (serviceId) => {
    const updatedServices = servicePrices.filter(
      (service) => service.id !== serviceId
    );
    setServicePrices(updatedServices);
    setTenderData({ ...tenderData, servicePrices: updatedServices });
  };

  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [fileError, setFileError] = useState("");

  const MAX_FILES = 4;
  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  const ALLOWED_TYPES = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ];

  const handleFileChange = async (e) => {
    setFileError("");
    const selectedFiles = Array.from(e.target.files);
    const currentFiles = tenderData.files || [];

    if (currentFiles.length + selectedFiles.length > MAX_FILES) {
      setFileError(`Máximo ${MAX_FILES} archivos permitidos.`);
      e.target.value = "";
      return;
    }

    const oversized = selectedFiles.find((f) => f.size > MAX_SIZE_BYTES);
    if (oversized) {
      setFileError(`"${oversized.name}" supera el límite de ${MAX_SIZE_MB} MB.`);
      e.target.value = "";
      return;
    }

    const invalidType = selectedFiles.find((f) => !ALLOWED_TYPES.includes(f.type));
    if (invalidType) {
      setFileError(`Formato no permitido: "${invalidType.name}".`);
      e.target.value = "";
      return;
    }

    setUploadingFiles(true);
    try {
      const uploaded = await Promise.all(
        selectedFiles.map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", "energialy_users");
          const res = await axios.post(
            "https://api.cloudinary.com/v1_1/dbraa6jpj/upload",
            data
          );
          return {
            url: res.data.secure_url,
            name: file.name,
            size: file.size,
          };
        })
      );
      setTenderData((prev) => ({
        ...prev,
        files: [...(prev.files || []), ...uploaded],
      }));
    } catch (error) {
      setFileError("Error al subir el archivo. Intenta de nuevo.");
      console.error("Error al cargar archivo:", error);
    } finally {
      setUploadingFiles(false);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index) => {
    setTenderData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validation = (tenderData) => {
    console.log("entro acá");
    console.log(tenderData);
    const errors = {};

    if (tenderData.title === "") {
      errors.title = "El titulo de la Licitación no puede estar vacío";
    }
    if (tenderData.description === "") {
      errors.description = "La Licitación debe tener una descripción";
    }
    if (tenderData.contractType === "") {
      errors.contractType = "El tipo de contrato es requerido";
    }
    if (tenderData.majorSector === "") {
      errors.majorSector = "El sector es requerido";
    }
    if (tenderData.projectDuration === "") {
      errors.projectDuration = "La duración del proyecto es requerida";
    }
    if (tenderData.validityDate === "") {
      errors.validityDate =
        "La fecha límite para enviar propuestas es requerida";
    }
    if (tenderData.locationId === "") {
      errors.locationId = "La ubicación del proyecto es requerida";
    }
    if (tenderData.subcategories.length === 0) {
      errors.subcategories = "Las subcategorias del proyecto son requeridas";
    }
    // Validar presupuesto solo si showBudget es true
    if (tenderData.showBudget && (tenderData.budget === 0 || tenderData.budget === "")) {
      errors.budget = "El presupuesto del proyecto es requerido cuando se muestra públicamente";
    }
    // Los archivos son opcionales
    // if (tenderData.files.length === 0) {
    //   errors.files = "La documentacion es requerida";
    // }
    // Validación para campos personalizados
    if (tenderData.customFields && tenderData.customFields.length > 0) {
      const invalidFields = tenderData.customFields.filter(
        (field) =>
          !field.label ||
          field.label.trim() === "" ||
          ((field.type === "select" || field.type === "radio") &&
            field.options.length === 0)
      );
      if (invalidFields.length > 0) {
        errors.customFields =
          "Todos los campos personalizados deben tener una etiqueta válida y opciones si son de tipo selección";
      }
    }
    // Validación para servicios y precios
    if (tenderData.servicePrices && tenderData.servicePrices.length > 0) {
      const invalidServices = tenderData.servicePrices.filter(
        (service) =>
          !service.name ||
          service.name.trim() === "" ||
          service.price === "" ||
          parseFloat(service.price) <= 0 ||
          !service.priceType ||
          service.priceType.trim() === ""
      );
      if (invalidServices.length > 0) {
        errors.servicePrices =
          "Todos los servicios deben tener un nombre, un tipo de precio y un precio válido";
      }
    }

    setInputError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasErrors = !validation(tenderData);
    if (!hasErrors) {
      try {
        // Limpiar campos temporales y asegurar tipos correctos
        const payload = { ...tenderData };
        // Convertir budget a número
        payload.budget = Number(payload.budget);
        // Limpiar servicePrices (remover id y asegurar price como número)
        if (Array.isArray(payload.servicePrices)) {
          payload.servicePrices = payload.servicePrices.map(
            ({ id, ...rest }) => ({
              ...rest,
              price: rest.price === "" ? 0 : Number(rest.price),
              priceType: rest.priceType || "fixed",
            })
          );
        }
        // Limpiar customFields (remover id temporal)
        if (Array.isArray(payload.customFields)) {
          payload.customFields = payload.customFields.map(({ id, ...rest }) => rest);
        }

        // Obtener el token de autenticación
        const accessToken = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;

        // Enviar payload limpio
        const tender = await axios.post(`${urlProduction}/tenders`, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        displaySuccessMessage("Licitación creada con éxito");
        setTimeout(() => router.back(), 2000);
      } catch (error) {
        console.log(error);

        // Verificar si es un error de límite de plan
        if (error?.response?.status === 403) {
          const errorData = error.response.data;
          if (errorData.featureNotAvailable || errorData.upgradeRequired) {
            // Mostrar modal de límite excedido
            setLimitExceededModal({
              isOpen: true,
              limitInfo: errorData,
            });
            return;
          }
        }

        const msg =
          error?.response?.data?.error || "Error al crear la licitación";
        displayFailedMessage(msg);
      }
    }
  };

  // Card de acceso restringido para colaboradores sin permiso LICITACIONES
  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Acceso Restringido</h3>
          <p className="text-gray-600 mb-1">No tienes permiso para publicar licitaciones.</p>
          <p className="text-gray-500 text-sm">Contacta a tu empleador para solicitar el permiso de <strong>Licitaciones</strong>.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <FormGroup>
        <Card className="p-4">
          {/*Header Form*/}
          <div className="border-b-1">
            <Typography variant="h6" className="mb-4">
              Publicar Licitación
            </Typography>
            <Typography variant="small" className="mb-4">
              Publicar licitación publica o privada para que una empresa pueda
              postularse y luego contratarla.
            </Typography>
          </div>
          {/*First Step Data*/}
          <div className="flex flex-col gap-4">
            <div className="border-l-4 border-primary-600">
              <Typography variant="h6" className="ml-5 my-0">
                Descripción de la Licitación
              </Typography>
            </div>
            <div className="ml-4 sm:ml-5 flex flex-col gap-3">
              <input
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-[#191654]"
                type="text"
                placeholder="Título"
                name="title"
                onChange={handleInputsChanges}
              />
              {inputError.title !== "" ? (
                <ErrorMensage message={inputError.title} />
              ) : null}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <select
                    className="w-full border border-gray-300 rounded-md p-3 text-gray-600 bg-white focus:outline-none focus:border-[#191654]"
                    onChange={handleInputsChanges}
                    name="contractType"
                  >
                    <option>TIPO DE CONTRATACIÓN</option>
                    {tendersTypes?.map((type, index) => (
                      <option key={index}>{type}</option>
                    ))}
                  </select>
                  {inputError.contractType !== "" ? (
                    <ErrorMensage message={inputError.contractType} />
                  ) : null}
                </div>
                <div>
                  <select
                    className="w-full border border-gray-300 rounded-md p-3 text-gray-600 bg-white focus:outline-none focus:border-[#191654]"
                    name="projectDuration"
                    onChange={handleInputsChanges}
                  >
                    <option>DURACIÓN DE LA LICITACIÓN</option>
                    {duration.map((d, index) => (
                      <option key={index}>{d}</option>
                    ))}
                  </select>
                  {inputError.projectDuration !== "" ? (
                    <ErrorMensage message={inputError.projectDuration} />
                  ) : null}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <select
                    className="w-full border border-gray-300 rounded-md p-3 text-gray-600 bg-white focus:outline-none focus:border-[#191654]"
                    name="majorSector"
                    onChange={handleInputsChanges}
                  >
                    <option>ETAPA</option>
                    {etapa.map((e, index) => (
                      <option key={index}>{e}</option>
                    ))}
                  </select>
                  {inputError.majorSector !== "" ? (
                    <ErrorMensage message={inputError.majorSector} />
                  ) : null}
                </div>
                <div className="border border-gray-300 rounded-md p-3 text-gray-600 flex flex-col sm:flex-row sm:justify-between gap-2">
                  <label htmlFor="validityDate" className="text-sm">Fecha límite para enviar Propuestas</label>
                  <input
                    className="focus:border-none focus:outline-none w-full sm:w-auto"
                    type="date"
                    name="validityDate"
                    id="validityDate"
                    onChange={handleInputsChanges}
                  />
                  {inputError.validityDate !== "" ? (
                    <ErrorMensage message={inputError.validityDate} />
                  ) : null}
                </div>
              </div>
              <div>
                <input
                  className="w-full sm:w-1/2 border border-gray-300 rounded-md p-3 text-gray-600 focus:outline-none focus:border-[#191654]"
                  type="number"
                  name="budget"
                  onChange={handleInputsChanges}
                  placeholder="Presupuesto en U$S"
                />
                {inputError.budget !== "" ? (
                  <ErrorMensage message={inputError.budget} />
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <ToggleSwitch
                checked={isShow}
                onChange={handleShowChange}
                label="Mostrar Presupuesto Público"
                description="Si activas esta opción, el presupuesto será visible para todos los proveedores. Si la desactivas, solo verán el presupuesto los proveedores que invites directamente."
                id="flexSwitchCheckDefault"
              />
            </div>
          </div>
          {/*Categories*/}
          <div className="flex flex-col gap-4 mt-4">
            <div className="border-l-4 border-primary-600">
              <Typography variant="h6" className="ml-5 my-0">
                Categorias
              </Typography>
            </div>
            <div className="ml-5 flex flex-col gap-2">
              {categoriesLoading && "Loading..."}
              <Select
                options={displayCategories?.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                  key: cat.id,
                }))}
                placeholder="CATEGORIA"
                onChange={handleChangeCategories}
              />
            </div>
          </div>
          {/*Sub-Categories*/}
          <div className="flex flex-col gap-4 mt-4">
            <div className="border-l-4 border-primary-600">
              <Typography variant="h6" className="ml-5 my-0">
                Subcategorias
              </Typography>
            </div>
            <div className="ml-5 flex flex-col gap-2">
              {categoriesLoading && "Loading..."}
              <Select
                options={subCatSelected?.map((subCat) => ({
                  label: subCat.name,
                  value: subCat.value,
                  key: subCat.id,
                }))}
                name="subcategories"
                placeholder="SUBCATEGORIA"
                onChange={handleSubcategorieChange}
              />
              {inputError.subcategories !== "" ? (
                <ErrorMensage message={inputError.subcategories} />
              ) : null}
            </div>
          </div>
          {/*Location Data*/}
          <div className="flex flex-col gap-4 mt-4">
            <div className="border-l-4 border-primary-600">
              <Typography variant="h6" className="ml-5 my-0">
                Ubicación
              </Typography>
            </div>
            <div className="ml-5 flex flex-col gap-2">
              {loadingLocations && "Loading..."}
              <Select
                options={displayLocations?.map((loc) => ({
                  value: loc.id,
                  label: loc.name,
                }))}
                placeholder="SELECCIONAR UBICACIÓN"
                onChange={handleChangeLocation}
              />
              {inputError.locationId !== "" ? (
                <ErrorMensage message={inputError.locationId} />
              ) : null}
              <div className="relative">
                <input
                  className={`w-full border-1 border-gray-300 rounded-md p-3 ${!canCreatePrivate ? "bg-gray-50 text-gray-400 cursor-not-allowed pr-56" : ""}`}
                  type="text"
                  name="address"
                  placeholder="Su Dirección"
                  onChange={handleInputsChanges}
                  disabled={!canCreatePrivate}
                />
                {!canCreatePrivate && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-orange-500 font-medium pointer-events-none">
                    Disponible al Actualizar tu Suscripcion &gt;
                  </span>
                )}
              </div>
            </div>
          </div>
          {/*Licitación Destacada*/}
          <div className="flex flex-col gap-4 mt-4">
            <div className="border-l-4 border-primary-600 flex justify-between items-center">
              <Typography variant="h6" className="ml-5 my-0">
                Licitación Destacada
              </Typography>
              <div className="flex items-center gap-3">
                {!canFeatureTender ? (
                  <span className="text-xs text-orange-500 font-medium bg-orange-50 border border-orange-200 rounded px-2 py-1">
                    Disponible al Actualizar tu Suscripcion &gt;
                  </span>
                ) : (
                  <label
                    className="inline-block pl-[0.15rem] hover:cursor-pointer text-sm text-gray-600"
                    htmlFor="flexSwitchCheckDefaultSponsored"
                  >
                    {isSponsoredCheqed ? "Destacar" : "No destacar"}
                  </label>
                )}
                <div className="relative group">
                  <input
                    className={`mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] focus:outline-none focus:ring-0 ${
                      canFeatureTender
                        ? "bg-neutral-300 hover:cursor-pointer checked:bg-primary checked:after:bg-primary"
                        : "bg-neutral-200 cursor-not-allowed opacity-50"
                    }`}
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckDefaultSponsored"
                    checked={isSponsoredCheqed}
                    onChange={handleSponsoredChange}
                    disabled={!canFeatureTender}
                  />
                  {!canFeatureTender && (
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Disponible al Actualizar tu Suscripcion
                      <div className="absolute top-full right-3 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/*Licitación Privada*/}
          <div className="flex flex-col gap-4 mt-4">
            <div className="border-l-4 border-primary-600 flex justify-between items-center">
              <Typography variant="h6" className="ml-5 my-0">
                Licitación Privada
              </Typography>
              <div className="flex items-center gap-3">
                {!canCreatePrivate ? (
                  <span className="text-xs text-orange-500 font-medium bg-orange-50 border border-orange-200 rounded px-2 py-1">
                    Disponible al Actualizar tu Suscripcion &gt;
                  </span>
                ) : (
                  <label
                    className="inline-block pl-[0.15rem] hover:cursor-pointer text-sm text-gray-600"
                    htmlFor="flexSwitchCheckDefaultPrivate"
                  >
                    {isPrivateCheqed ? "Privada" : "Publica"}
                  </label>
                )}
                <div className="relative group">
                  <input
                    className={`mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] focus:outline-none focus:ring-0 ${
                      canCreatePrivate
                        ? "bg-neutral-300 hover:cursor-pointer checked:bg-primary checked:after:bg-primary"
                        : "bg-neutral-200 cursor-not-allowed opacity-50"
                    }`}
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckDefaultPrivate"
                    checked={isPrivateCheqed}
                    onChange={handlePrivateChange}
                    disabled={!canCreatePrivate}
                  />
                  {!canCreatePrivate && (
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Disponible al Actualizar tu Suscripcion
                      <div className="absolute top-full right-3 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/*Editor Data*/}
          <div className="flex flex-col gap-4 mt-4 -z-0">
            <div className="border-l-4 border-primary-600">
              <Typography variant="h6" className="ml-5 my-0">
                Detalles De La Licitación
              </Typography>
            </div>
            <div className="ml-5 flex flex-col gap-2">
              <textarea
                className="w-full border-1 border-gray-300 rounded-md p-3"
                name="description"
                onChange={handleInputsChanges}
                placeholder="Ingresa el detalle de la Licitación"
              ></textarea>
            </div>
          </div>

          {/*File Attachment */}
          <div className="flex flex-col gap-4 mt-4">
            <div className="border-l-4 border-primary-600 flex justify-between">
              <Typography variant="h6" className="ml-5 my-0">
                Requisitos
              </Typography>
            </div>
            <div className="ml-5 flex flex-col gap-3">
              <p className="text-sm text-gray-500">
                Adjunta hasta {MAX_FILES} archivos (PDF, Word, Excel, imágenes, etc.). Máximo {MAX_SIZE_MB} MB por archivo.
              </p>
              {/* Zona de carga */}
              <div className="flex border-dashed w-full border-2 border-gray-300 rounded-md p-4 items-center gap-4 flex-wrap">
                <label
                  htmlFor="filePicker"
                  className={`bg-secondary-500 text-white py-2 px-5 rounded-lg cursor-pointer uppercase font-semibold tracking-wide text-sm flex items-center gap-2 ${
                    (tenderData.files || []).length >= MAX_FILES || uploadingFiles
                      ? "opacity-50 cursor-not-allowed pointer-events-none"
                      : "hover:bg-secondary-600"
                  }`}
                >
                  {uploadingFiles ? "Subiendo..." : "+ Adjuntar archivo"}
                  <input
                    name="files"
                    type="file"
                    id="filePicker"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={(tenderData.files || []).length >= MAX_FILES || uploadingFiles}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                  />
                </label>
                <span className="text-sm text-gray-500">
                  {(tenderData.files || []).length}/{MAX_FILES} archivos
                </span>
              </div>

              {/* Error de archivo */}
              {fileError && (
                <p className="text-sm text-red-500">{fileError}</p>
              )}

              {/* Lista de archivos cargados */}
              {(tenderData.files || []).length > 0 && (
                <div className="space-y-2">
                  {tenderData.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border border-gray-200 rounded-md px-4 py-2 bg-gray-50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-lg">📄</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-3 shrink-0">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 text-xs underline"
                        >
                          Ver
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Campos Personalizados */}
          <div className="flex flex-col gap-4 mt-4">
            <div className="border-l-4 border-primary-600 flex justify-between items-center">
              <div>
                <Typography variant="h6" className="ml-5 my-0">
                  Campos Personalizados
                </Typography>
                <Typography variant="small" className="ml-5 text-gray-600">
                  Crea campos específicos para recopilar información de los
                  proveedores al enviar propuestas
                </Typography>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomFieldModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
                title="Agregar nuevo campo personalizado"
              >
                + Agregar Campo
              </button>
            </div>

            {/* Lista de campos personalizados */}
            <div className="ml-5 space-y-3">
              {customFields.map((field) => (
                <div
                  key={field.id}
                  className="border border-gray-200 rounded-md p-3 bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{field.label}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                          Tipo:{" "}
                          <span className="font-medium">{field.type}</span>
                        </span>
                        {field.required && (
                          <span className="text-sm text-red-600 font-medium">
                            Requerido
                          </span>
                        )}
                      </div>
                      {field.placeholder && (
                        <p className="text-sm text-gray-500 mt-1">
                          Ayuda: {field.placeholder}
                        </p>
                      )}
                      {field.options.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          Opciones: {field.options.join(", ")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveCustomField(field.id)}
                      className="text-red-500 hover:text-red-700 text-sm ml-3 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      title="Eliminar campo"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}

              {customFields.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-md">
                  <p className="text-gray-500 italic mb-2">
                    No hay campos personalizados agregados
                  </p>
                  <p className="text-sm text-gray-400">
                    Agrega campos para recopilar información específica de los
                    proveedores
                  </p>
                </div>
              )}
              {inputError.customFields !== "" ? (
                <ErrorMensage message={inputError.customFields} />
              ) : null}
            </div>
          </div>

          {/* Servicios y Precios */}
          <div className="flex flex-col gap-4 mt-4">
            <div className="border-l-4 border-primary-600">
              <Typography variant="h6" className="ml-5 my-0">
                Servicios y Precios
              </Typography>
              <Typography variant="small" className="ml-5 text-gray-600">
                Configura servicios específicos como viáticos, transporte, etc.
                con precios fijos o por día
              </Typography>
            </div>

            <div className="ml-5 space-y-4">
              {/* Información sobre servicios */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  Ejemplos de servicios:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • <strong>Viáticos:</strong> Gastos de comida y alojamiento
                    por día
                  </li>
                  <li>
                    • <strong>Transporte:</strong> Precio fijo para movilización
                    del equipo
                  </li>
                  <li>
                    • <strong>Equipamiento:</strong> Alquiler de maquinaria por
                    día
                  </li>
                  <li>
                    • <strong>Personal especializado:</strong> Costo por día de
                    técnicos
                  </li>
                </ul>
              </div>

              {/* Botón para agregar servicio */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {servicePrices.length === 0
                    ? "No hay servicios agregados"
                    : `${servicePrices.length} servicio(s) agregado(s)`}
                </span>
              </div>

              {/* Lista de servicios */}
              <div className="space-y-3">
                {servicePrices.map((service, index) => (
                  <div
                    key={service.id}
                    className="border border-gray-200 rounded-md p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        Servicio #{index + 1}
                      </h4>
                      <button
                        onClick={() => handleRemoveServicePrice(service.id)}
                        className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        title="Eliminar servicio"
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Nombre del Servicio *
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Viáticos de alimentación"
                          value={service.name}
                          onChange={(e) =>
                            handleUpdateServicePrice(
                              service.id,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Descripción
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Gastos de comida y alojamiento"
                          value={service.description}
                          onChange={(e) =>
                            handleUpdateServicePrice(
                              service.id,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Tipo de Precio *
                        </label>
                        <select
                          value={service.priceType || "fixed"}
                          onChange={(e) =>
                            handleUpdateServicePrice(
                              service.id,
                              "priceType",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="fixed">Precio Fijo</option>
                          <option value="per_day">Precio por Día</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Precio de Referencia *
                          {service.priceType === "per_day" && (
                            <span className="text-gray-500"> (por día)</span>
                          )}
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">U$D</span>
                          <input
                            type="number"
                            placeholder="Ingresa el precio"
                            min="0"
                            step="0.01"
                            value={service.price}
                            onChange={(e) =>
                              handleUpdateServicePrice(
                                service.id,
                                "price",
                                e.target.value === "" ? "" : parseFloat(e.target.value)
                              )
                            }
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {service.priceType === "per_day" && (
                            <span className="text-sm text-gray-600">/ día</span>
                          )}
                        </div>
                        {service.priceType === "per_day" && (
                          <p className="text-xs text-gray-500 mt-1">
                            Vista previa: U$D {service.price || "0"} por día
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {servicePrices.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-md">
                    <p className="text-gray-500 italic mb-2">
                      No hay servicios agregados
                    </p>
                    <p className="text-sm text-gray-400">
                      Agrega servicios como viáticos, transporte, equipamiento,
                      etc. para que los proveedores puedan cotizar con mayor
                      precisión
                    </p>
                  </div>
                )}
                {inputError.servicePrices !== "" ? (
                  <ErrorMensage message={inputError.servicePrices} />
                ) : null}
              </div>

              {/* Botón para agregar nuevo servicio */}
              <button
                type="button"
                onClick={handleAddServicePrice}
                className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors"
              >
                + Agregar Servicio
              </button>
            </div>
          </div>

          <button
            className="w-full sm:w-auto bg-[#191654] hover:bg-[#252075] text-white font-semibold rounded-md px-8 py-3 mt-4 transition-colors duration-200"
            onClick={handleSubmit}
          >
            Crear Licitación
          </button>
        </Card>

        {/* Modal para crear campo personalizado */}
        {showCustomFieldModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto z-50 py-6">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto my-auto">
              <h3 className="text-lg font-semibold mb-4">
                Agregar Campo Personalizado
              </h3>

              <div className="space-y-4">
                {/* Tipo de campo */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tipo de Campo *
                  </label>
                  <select
                    value={newField.type}
                    onChange={(e) =>
                      setNewField({
                        ...newField,
                        type: e.target.value,
                        options: [],
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Texto Corto</option>
                    <option value="textarea">Texto Largo</option>
                    <option value="number">Número</option>
                    <option value="date">Fecha</option>
                    <option value="select">Lista Desplegable</option>
                    <option value="radio">Opción Múltiple</option>
                  </select>
                </div>

                {/* Etiqueta */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Etiqueta *
                  </label>
                  <input
                    type="text"
                    value={newField.label}
                    onChange={(e) =>
                      setNewField({ ...newField, label: e.target.value })
                    }
                    placeholder="Ej: ¿Cuántos años de experiencia tienes?"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Placeholder */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Texto de Ayuda (opcional)
                  </label>
                  <input
                    type="text"
                    value={newField.placeholder}
                    onChange={(e) =>
                      setNewField({ ...newField, placeholder: e.target.value })
                    }
                    placeholder="Texto que aparecerá como ayuda"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Opciones para select y radio */}
                {(newField.type === "select" || newField.type === "radio") && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Opciones *
                    </label>
                    <div className="space-y-2">
                      {newField.options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleUpdateOption(index, e.target.value)
                            }
                            placeholder={`Opción ${index + 1}`}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="text-red-500 hover:text-red-700 px-2"
                            title="Eliminar opción"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        + Agregar opción
                      </button>
                      {newField.options.length === 0 && (
                        <p className="text-sm text-red-500">
                          Debe agregar al menos una opción
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Campo requerido */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newField.required}
                    onChange={(e) =>
                      setNewField({ ...newField, required: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="required" className="text-sm">
                    Campo requerido
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCustomFieldModal(false);
                    setNewField({
                      type: "text",
                      label: "",
                      placeholder: "",
                      required: false,
                      options: [],
                    });
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCustomField}
                  disabled={
                    !newField.label.trim() ||
                    ((newField.type === "select" ||
                      newField.type === "radio") &&
                      newField.options.length === 0)
                  }
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Agregar Campo
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer style={{ marginTop: "300px" }} />
      </FormGroup>

      {/* Limit Exceeded Modal */}
      <LimitExceededModal
        isOpen={limitExceededModal.isOpen}
        onClose={() =>
          setLimitExceededModal({ isOpen: false, limitInfo: null })
        }
        limitInfo={limitExceededModal.limitInfo}
      />
    </>
  );
}

export default CreateTenderForm;
